// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import './HemShopBase.sol';

contract HemShop is HemShopBase {
    using Counters for Counters.Counter;

    // --- State Variables ---
    Counters.Counter private _TotalSales;
    uint256 public servicePct;

    // Lists
    address[] private registeredSellersList;
    address[] public usersList;

    // --- Enums ---
    enum SellerStatus {
        Unverified,
        Pending,
        Verified,
        Suspended
    }

    // --- Structs ---
    struct SellerProfile {
        string businessName;
        string description;
        string email;
        string phone;
        string logo;
        uint256 registeredAt;
        bool termsAccepted;
    }

    struct UserProfile {
        string name;
        string email;
        string avatar;
        uint256 registeredAt;
        bool isActive;
    }

    struct ShippingDetails {
        string fullName;
        string streetAddress;
        string city;
        string state;
        string country;
        string postalCode;
        string phone;
        string email;
    }

    struct OrderDetails {
        string name;
        string[] images;
        string selectedColor;
        string selectedSize;
        uint256 quantity;
        string category;
        string description;
    }

    struct PurchaseHistoryStruct {
        uint256 productId;
        uint256 totalAmount;
        uint256 basePrice;
        uint256 timestamp;
        uint256 lastUpdated;
        address buyer;
        address seller;
        bool isDelivered;
        ShippingDetails shippingDetails;
        OrderDetails orderDetails;
    }

    // --- Mappings ---
    mapping(address => UserProfile) public userProfiles;
    mapping(address => SellerProfile) public sellerProfiles;
    mapping(address => SellerStatus) public sellerStatus;
    mapping(address => bool) public registeredSellers;
    mapping(address => bool) public registeredUsers;
    mapping(address => uint256) public sellerBalances;
    mapping(address => PurchaseHistoryStruct[]) public buyerPurchaseHistory;
    mapping(address => PurchaseHistoryStruct[]) public sellerPurchaseHistory;
    mapping(address => address) public adminImpersonating;

    // --- Events ---
    event SellerRegistered(address indexed seller, uint256 timestamp);
    event SellerStatusUpdated(address indexed seller, SellerStatus status);
    event BalanceUpdated(address indexed seller, uint256 newBalance);
    event PurchaseRecorded(
        uint256 indexed productId,
        address indexed buyer,
        address indexed seller,
        uint256 totalAmount,
        uint256 basePrice,
        uint256 timestamp
    );
    event ProductPurchased(
        uint256 indexed productId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 timestamp
    );
    event DeliveryStatusUpdated(uint256 indexed productId, address indexed buyer, bool isDelivered);
    event AdminImpersonationChanged(address admin, address impersonatedAccount);
    event UserRegistered(address indexed user, string name);

    constructor(string memory name, string memory symbol) HemShopBase(name, symbol) {}

    // --- Modifiers ---
    modifier onlyVerifiedSellerOrOwner() {
        if (msg.sender == owner()) {
            _;
            return;
        }

        address actingAs = adminImpersonating[msg.sender];
        if (actingAs != address(0)) {
            require(
                sellerStatus[actingAs] == SellerStatus.Verified || actingAs == owner(),
                'Only verified seller or owner allowed'
            );
        } else {
            require(
                sellerStatus[msg.sender] == SellerStatus.Verified || msg.sender == owner(),
                'Only verified seller or owner allowed'
            );
        }
        _;
    }

    // --- Override Product Management Functions ---
    function createProduct(ProductInput calldata input) public override onlyVerifiedSellerOrOwner {
        super.createProduct(input);
    }

    function updateProduct(uint256 productId, ProductInput calldata input) public override onlyVerifiedSellerOrOwner {
        super.updateProduct(productId, input);
    }

    function deleteProduct(uint256 productId) public override onlyVerifiedSellerOrOwner {
        super.deleteProduct(productId);
    }

    // --- User Management Functions ---
    function registerUser(string memory name, string memory email, string memory avatar) external {
        require(!registeredUsers[msg.sender], 'User already registered');
        require(bytes(name).length > 0, 'Name cannot be empty');
        require(bytes(email).length > 0, 'Email cannot be empty');

        userProfiles[msg.sender] = UserProfile({
            name: name,
            email: email,
            avatar: avatar,
            registeredAt: block.timestamp,
            isActive: true
        });

        registeredUsers[msg.sender] = true;
        usersList.push(msg.sender);
        emit UserRegistered(msg.sender, name);
    }

    // --- Seller Management Functions ---
    function registerSeller(
        string memory businessName,
        string memory description,
        string memory email,
        string memory phone,
        string memory logo
    ) external {
        require(!registeredSellers[msg.sender], 'Already registered as seller');
        require(bytes(businessName).length > 0, 'Business name cannot be empty');
        require(bytes(email).length > 0, 'Email cannot be empty');
        require(bytes(phone).length > 0, 'Phone cannot be empty');

        sellerProfiles[msg.sender] = SellerProfile({
            businessName: businessName,
            description: description,
            email: email,
            phone: phone,
            logo: logo,
            registeredAt: block.timestamp,
            termsAccepted: true
        });

        registeredSellers[msg.sender] = true;
        sellerStatus[msg.sender] = SellerStatus.Pending;
        registeredSellersList.push(msg.sender);

        emit SellerRegistered(msg.sender, block.timestamp);
    }

    // --- Purchase Management Functions ---
    function purchaseProduct(
        uint256 productId,
        uint256 quantity,
        string memory selectedColor,
        string memory selectedSize,
        ShippingDetails calldata shipping
    ) external payable {
        require(productExists[productId], 'Product does not exist');
        require(!products[productId].deleted, 'Product is deleted');
        require(products[productId].stock >= quantity, 'Insufficient stock');
        require(msg.value >= products[productId].price * quantity, 'Insufficient payment');
        require(bytes(selectedColor).length > 0, 'Color must be selected');
        require(bytes(selectedSize).length > 0, 'Size must be selected');
        require(bytes(shipping.fullName).length > 0, 'Full name is required');
        require(bytes(shipping.streetAddress).length > 0, 'Street address is required');
        require(bytes(shipping.city).length > 0, 'City is required');
        require(bytes(shipping.state).length > 0, 'State is required');
        require(bytes(shipping.country).length > 0, 'Country is required');
        require(bytes(shipping.postalCode).length > 0, 'Postal code is required');
        require(bytes(shipping.phone).length > 0, 'Phone is required');
        require(bytes(shipping.email).length > 0, 'Email is required');

        ProductStruct storage product = products[productId];
        require(product.seller != msg.sender, 'Cannot buy your own product');

        uint256 totalAmount = product.price * quantity;
        uint256 serviceFee = (totalAmount * servicePct) / 100;
        uint256 sellerAmount = totalAmount - serviceFee;

        // Update seller balance
        sellerBalances[product.seller] += sellerAmount;
        emit BalanceUpdated(product.seller, sellerBalances[product.seller]);

        // Update product stock
        product.stock -= quantity;
        if (product.stock == 0) {
            product.soldout = true;
        }

        // Create order details
        OrderDetails memory order = OrderDetails({
            name: product.name,
            images: product.images,
            selectedColor: selectedColor,
            selectedSize: selectedSize,
            quantity: quantity,
            category: product.category,
            description: product.description
        });

        // Record purchase history
        PurchaseHistoryStruct memory purchase = PurchaseHistoryStruct({
            productId: productId,
            totalAmount: totalAmount,
            basePrice: product.price,
            timestamp: block.timestamp,
            lastUpdated: block.timestamp,
            buyer: msg.sender,
            seller: product.seller,
            isDelivered: false,
            shippingDetails: shipping,
            orderDetails: order
        });

        buyerPurchaseHistory[msg.sender].push(purchase);
        sellerPurchaseHistory[product.seller].push(purchase);

        _TotalSales.increment();

        emit PurchaseRecorded(
            productId,
            msg.sender,
            product.seller,
            totalAmount,
            product.price,
            block.timestamp
        );
        emit ProductPurchased(productId, msg.sender, product.seller, totalAmount, block.timestamp);

        // Refund excess payment
        if (msg.value > totalAmount) {
            payTo(msg.sender, msg.value - totalAmount);
        }
    }

    function withdrawBalance() external {
        require(sellerBalances[msg.sender] > 0, 'No balance to withdraw');
        uint256 amount = sellerBalances[msg.sender];
        sellerBalances[msg.sender] = 0;
        
        emit BalanceUpdated(msg.sender, 0);
        payTo(msg.sender, amount);
    }

    function updateDeliveryStatus(uint256 productId, address buyer) external {
        require(msg.sender == products[productId].seller, 'Not the seller');
        
        PurchaseHistoryStruct[] storage purchases = buyerPurchaseHistory[buyer];
        bool found = false;
        
        for (uint256 i = 0; i < purchases.length; i++) {
            if (purchases[i].productId == productId && !purchases[i].isDelivered) {
                purchases[i].isDelivered = true;
                purchases[i].lastUpdated = block.timestamp;
                found = true;
                
                // Update seller's purchase history
                PurchaseHistoryStruct[] storage sellerPurchases = sellerPurchaseHistory[msg.sender];
                for (uint256 j = 0; j < sellerPurchases.length; j++) {
                    if (sellerPurchases[j].productId == productId && 
                        sellerPurchases[j].buyer == buyer) {
                        sellerPurchases[j].isDelivered = true;
                        sellerPurchases[j].lastUpdated = block.timestamp;
                        break;
                    }
                }
                
                emit DeliveryStatusUpdated(productId, buyer, true);
                break;
            }
        }
        
        require(found, 'Purchase not found or already delivered');
    }

    // --- Admin Functions ---
    function impersonateAccount(address account) external onlyOwner {
        require(account != address(0), 'Invalid account address');
        adminImpersonating[msg.sender] = account;
        emit AdminImpersonationChanged(msg.sender, account);
    }

    function stopImpersonating() external onlyOwner {
        adminImpersonating[msg.sender] = address(0);
        emit AdminImpersonationChanged(msg.sender, address(0));
    }

    function changeServicePct(uint256 newPct) external onlyOwner {
        require(newPct >= 0 && newPct <= 100, 'Invalid percentage');
        servicePct = newPct;
    }

    // --- Helper Functions ---
    function payTo(address to, uint256 amount) internal {
        require(to != address(0), 'Invalid address');
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, 'Transfer failed');
    }

    function isSellerInList(address seller) internal view returns (bool) {
        for (uint i = 0; i < registeredSellersList.length; i++) {
            if (registeredSellersList[i] == seller) {
                return true;
            }
        }
        return false;
    }

    // --- Getter Functions ---
    function getSellerBalance(address seller) external view returns (uint256) {
        return sellerBalances[seller];
    }

    function getBuyerPurchaseHistory(address buyer) external view returns (PurchaseHistoryStruct[] memory) {
        return buyerPurchaseHistory[buyer];
    }

    function getSellerPurchaseHistory(address seller) external view returns (PurchaseHistoryStruct[] memory) {
        return sellerPurchaseHistory[seller];
    }

    function getSeller(
        address seller
    ) external view returns (
        SellerProfile memory profile,
        SellerStatus status,
        uint256 balance,
        uint256[] memory productIds
    ) {
        require(registeredSellers[seller], 'Seller not registered');
        return (
            sellerProfiles[seller],
            sellerStatus[seller],
            sellerBalances[seller],
            sellerProducts[seller]
        );
    }

    function getUser(
        address user
    ) external view returns (
        bool isRegistered,
        UserProfile memory profile,
        bool isUserSeller,
        SellerStatus sellerState
    ) {
        return (
            registeredUsers[user],
            userProfiles[user],
            registeredSellers[user],
            registeredSellers[user] ? sellerStatus[user] : SellerStatus.Unverified
        );
    }

    function getAllRegisteredSellers() external view returns (address[] memory) {
        return registeredSellersList;
    }

    function updateSellerStatus(address seller, SellerStatus newStatus) external onlyOwner {
        require(registeredSellers[seller], 'Seller not registered');
        require(newStatus != SellerStatus.Unverified, 'Cannot set status to Unverified');
        require(sellerStatus[seller] != newStatus, 'Seller already has this status');

        sellerStatus[seller] = newStatus;
        emit SellerStatusUpdated(seller, newStatus);
    }
}
