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

    modifier onlyRegisteredUser() {
        require(registeredUsers[msg.sender], "User not registered");
        _;
    }

    modifier onlyRegisteredSeller() {
        require(registeredSellers[msg.sender], "Seller not registered");
        _;
    }

    constructor(uint256 _pct) HemShopBase("HemShop", "Hsp") {
        servicePct = _pct;
    }

    // --- User Management ---
    function registerUser(string memory name, string memory email, string memory avatar) external {
        require(msg.sender != address(0), 'Invalid address');
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

    // --- Seller Management ---
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

        if (!isSellerInList(msg.sender)) {
            registeredSellersList.push(msg.sender);
        }

        emit SellerRegistered(msg.sender, block.timestamp);
    }

    // --- Purchase Management ---
    function buyProduct(
        uint256 productId,
        ShippingDetails calldata shippingDetails,
        string calldata selectedColor,
        string calldata selectedSize,
        uint256 quantity
    ) external payable nonReentrant {
        require(productExists[productId], 'Product not found');
        ProductStruct storage product = products[productId];
        require(!product.deleted, 'Product has been deleted');
        require(product.stock >= quantity, 'Insufficient stock');
        require(msg.value >= product.price * quantity, 'Insufficient payment');

        // Update stock
        product.stock -= quantity;
        if (product.stock == 0) {
            product.soldout = true;
        }

        // Record the purchase
        _recordPurchase(
            productId,
            msg.sender,
            product.seller,
            msg.value,
            product.price * quantity,
            shippingDetails,
            selectedColor,
            selectedSize,
            quantity
        );

        emit ProductPurchased(productId, msg.sender, product.seller, msg.value, block.timestamp);
    }

    function _recordPurchase(
        uint256 productId,
        address buyer,
        address seller,
        uint256 totalAmount,
        uint256 basePrice,
        ShippingDetails memory shippingDetails,
        string memory selectedColor,
        string memory selectedSize,
        uint256 quantity
    ) internal {
        ProductStruct storage product = products[productId];

        OrderDetails memory orderDetails = OrderDetails({
            name: product.name,
            images: product.images,
            selectedColor: selectedColor,
            selectedSize: selectedSize,
            quantity: quantity,
            category: product.category,
            description: product.description
        });

        PurchaseHistoryStruct memory purchase = PurchaseHistoryStruct({
            productId: productId,
            totalAmount: totalAmount,
            basePrice: basePrice,
            timestamp: block.timestamp,
            lastUpdated: block.timestamp,
            buyer: buyer,
            seller: seller,
            isDelivered: false,
            shippingDetails: shippingDetails,
            orderDetails: orderDetails
        });

        buyerPurchaseHistory[buyer].push(purchase);
        sellerPurchaseHistory[seller].push(purchase);
        sellerBalances[seller] += totalAmount;

        emit PurchaseRecorded(productId, buyer, seller, totalAmount, basePrice, block.timestamp);
    }

    // --- Balance Management ---
    function withdraw() external nonReentrant {
        require(registeredSellers[msg.sender], 'Must be a registered seller');
        uint256 balance = sellerBalances[msg.sender];
        require(balance > 0, 'No balance to withdraw');

        uint256 serviceFee = (balance * servicePct) / 100;
        uint256 sellerAmount = balance - serviceFee;

        sellerBalances[msg.sender] = 0;
        emit BalanceUpdated(msg.sender, 0);

        payTo(owner(), serviceFee);
        payTo(msg.sender, sellerAmount);
    }

    // --- Purchase History Management ---
    function markPurchaseDelivered(uint256 productId, address buyer) external onlyVerifiedSellerOrOwner {
        bool found = false;

        for (uint i = 0; i < buyerPurchaseHistory[buyer].length; i++) {
            if (buyerPurchaseHistory[buyer][i].productId == productId) {
                require(!buyerPurchaseHistory[buyer][i].isDelivered, 'Already marked as delivered');
                require(
                    buyerPurchaseHistory[buyer][i].seller == msg.sender || owner() == msg.sender,
                    'Only seller or owner can mark as delivered'
                );
                buyerPurchaseHistory[buyer][i].isDelivered = true;
                found = true;
                break;
            }
        }

        if (found) {
            address seller = products[productId].seller;
            for (uint i = 0; i < sellerPurchaseHistory[seller].length; i++) {
                if (
                    sellerPurchaseHistory[seller][i].productId == productId &&
                    sellerPurchaseHistory[seller][i].buyer == buyer
                ) {
                    sellerPurchaseHistory[seller][i].isDelivered = true;
                    break;
                }
            }

            emit DeliveryStatusUpdated(productId, buyer, true);
        } else {
            revert('Purchase not found');
        }
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