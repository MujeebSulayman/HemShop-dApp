// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import './management/ProductManager.sol';

contract HemShop is ProductManager {
  // Core settings
  uint256 public servicePct;

  // Purchase mappings
  mapping(address => uint256) public sellerBalances;
  mapping(address => IHemShop.PurchaseHistoryStruct[]) public buyerPurchaseHistory;
  mapping(address => IHemShop.PurchaseHistoryStruct[]) public sellerPurchaseHistory;

  // Admin mappings
  mapping(address => address) public adminImpersonating;

  // Events
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
  event BalanceUpdated(address indexed seller, uint256 newBalance);

  constructor(uint256 _pct) ProductManager('HemShop', 'HSP') {
    servicePct = _pct;
  }

  // Purchase functions
  function buyProduct(
    uint256 productId,
    IHemShop.ShippingDetails calldata shippingDetails,
    string calldata selectedColor,
    string calldata selectedSize,
    uint256 quantity
  ) external payable nonReentrant {
    require(productExists[productId], 'Product not found');
    IHemShop.ProductStruct storage product = products[productId];
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
    IHemShop.ShippingDetails memory shippingDetails,
    string memory selectedColor,
    string memory selectedSize,
    uint256 quantity
  ) internal {
    IHemShop.ProductStruct storage product = products[productId];

    IHemShop.OrderDetails memory orderDetails = IHemShop.OrderDetails({
      name: product.name,
      images: product.images,
      selectedColor: selectedColor,
      selectedSize: selectedSize,
      quantity: quantity,
      category: product.category,
      description: product.description
    });

    IHemShop.PurchaseHistoryStruct memory purchase = IHemShop.PurchaseHistoryStruct({
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

  function withdraw() external nonReentrant {
    require(registeredSellers[msg.sender], 'Must be a registered seller');
    uint256 balance = sellerBalances[msg.sender];
    require(balance > 0, 'No balance to withdraw');

    // Calculate service fee
    uint256 serviceFee = (balance * servicePct) / 100;
    uint256 sellerAmount = balance - serviceFee;

    // Clear balance first
    sellerBalances[msg.sender] = 0;
    emit BalanceUpdated(msg.sender, 0);

    // Then perform transfers
    payTo(owner(), serviceFee);
    payTo(msg.sender, sellerAmount);
  }

  function getSellerBalance(address seller) external view returns (uint256) {
    return sellerBalances[seller];
  }

  function getBuyerPurchaseHistory(
    address buyer
  ) external view returns (IHemShop.PurchaseHistoryStruct[] memory) {
    return buyerPurchaseHistory[buyer];
  }

    function getSellerPurchaseHistory(
        address seller
    ) external view returns (IHemShop.PurchaseHistoryStruct[] memory) {
        return sellerPurchaseHistory[seller];
    }

  function markPurchaseDelivered(
    uint256 productId,
    address buyer
  ) external onlyVerifiedSellerOrOwner {
    bool found = false;

    // Update buyer's purchase history
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

    // Update seller's purchase history
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

  // Admin functions
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

  function payTo(address to, uint256 amount) internal {
    require(to != address(0), 'Invalid address');
    (bool success, ) = payable(to).call{ value: amount }('');
    require(success, 'Transfer failed');
  }

  modifier onlyVerifiedSellerOrOwner() {
    // Owner always has access
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
}
