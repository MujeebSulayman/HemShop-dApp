// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

contract HemShop is Ownable, ReentrancyGuard, ERC721 {
  constructor(uint256 _pct) ERC721('HemShop', 'Hsp') {
    servicePct = _pct;
  }

  using Counters for Counters.Counter;
  Counters.Counter private _TotalProducts;
  Counters.Counter private _TotalSales;
  Counters.Counter private _TotalReviews;

  uint256 public servicePct;

  struct ReviewStruct {
    uint256 reviewId;
    address reviewer;
    uint256 rating;
    string comment;
    bool deleted;
  }

  struct ProductStruct {
    uint256 id;
    address seller;
    string name;
    string description;
    uint256 price;
    uint256 stock;
    string color;
    string size;
    string[] images;
    string category;
    string subCategory;
    uint256 weight;
    string model;
    string brand;
    uint256 squ;
    uint256 soldout;
    bool wishlist;
    bool deleted;
    ReviewStruct[] reviews;
  }

  mapping(uint256 => ProductStruct) public products;
  mapping(address => uint256[]) public sellerProducts;

  enum SellerStatus {
    Unverified,
    Pending,
    Verified,
    Suspended
  }

  struct PurchaseHistoryStruct {
    uint256 productId;
    uint256 totalAmount;
    uint256 basePrice;
    uint256 timestamp;
    address buyer;
    address seller;
    bool isDelivered;
  }

  mapping(address => uint256) public sellerBalances;
  mapping(address => SellerStatus) public sellerStatus;
  mapping(address => PurchaseHistoryStruct[]) public buyerPurchaseHistory;
  mapping(address => PurchaseHistoryStruct[]) public sellerPurchaseHistory;
  mapping(address => bool) public registeredSellers;
  mapping(uint256 => bool) public productExists;
  mapping(uint256 => bool) public reviewExists;

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

  modifier onlyVerifiedSeller() {
    require(sellerStatus[msg.sender] == SellerStatus.Verified, 'Seller not verified');
    _;
  }

  modifier onlyVerifiedSellerOrOwner() {
    require(
      sellerStatus[msg.sender] == SellerStatus.Verified || owner() == msg.sender,
      'Only verified seller or owner allowed'
    );
    _;
  }

  function createProduct(
    string memory name,
    string memory description,
    uint256 price,
    uint256 stock,
    string memory color,
    string memory size,
    string[] memory images,
    string memory category,
    string memory subCategory,
    string memory model,
    string memory brand,
    uint256 weight,
    uint256 squ
  ) public onlyVerifiedSeller {
    require(bytes(name).length > 0, 'Name cannot be empty');
    require(bytes(description).length > 0, 'Description cannot be empty');
    require(price > 0, 'Price must be greater than 0');
    require(stock > 0, 'Stock must be greater than 0');
    require(bytes(color).length > 0, 'Color cannot be empty');
    require(images.length > 0, 'Images cannot be empty');
    require(images.length < 5, 'Images cannot be more than 5');
    require(bytes(size).length > 0, 'Size cannot be empty');
    require(bytes(category).length > 0, 'Category cannot be empty');
    require(bytes(subCategory).length > 0, 'Sub-category cannot be empty');
    require(bytes(model).length > 0, 'Model cannot be empty');
    require(bytes(brand).length > 0, 'Brand cannot be empty');
    require(weight > 0, 'Weight must be greater than 0');
    require(squ > 0, 'SKU must be greater than 0');

    // Increment the total products counter
    _TotalProducts.increment();

    // Create the product
    ProductStruct memory product;
    product.id = _TotalProducts.current();
    product.seller = msg.sender;
    product.name = name;
    product.description = description;
    product.price = price;
    product.stock = stock;
    product.color = color;
    product.size = size;
    product.images = images;
    product.category = category;
    product.subCategory = subCategory;
    product.model = model;
    product.brand = brand;
    product.weight = weight;
    product.squ = squ;

    // Mint the new product
    uint256 newProductId = _TotalProducts.current();
    _mint(msg.sender, newProductId);

    // Store the product
    products[newProductId] = product;
    productExists[newProductId] = true;
    sellerProducts[msg.sender].push(newProductId);
  }

  function updateProduct(
    uint256 productId,
    string memory name,
    string memory description,
    uint256 price,
    uint256 stock,
    string memory color,
    string memory size,
    string[] memory images,
    string memory category,
    string memory subCategory,
    string memory model,
    string memory brand,
    uint256 weight,
    uint256 squ
  ) external onlyVerifiedSeller {
    require(products[productId].seller == msg.sender, 'Only the seller can update their product');
    require(productExists[productId], 'Product does not exist');
    require(!products[productId].deleted, 'Product is deleted');
    require(bytes(name).length > 0, 'Name cannot be empty');
    require(bytes(description).length > 0, 'Description cannot be empty');
    require(price > 0, 'Price must be greater than 0');
    require(images.length > 0, 'Images cannot be empty');
    require(images.length < 5, 'Images cannot be more than 5');
    require(stock > 0, 'Stock must be greater than 0');
    require(bytes(color).length > 0, 'Color cannot be empty');
    require(bytes(size).length > 0, 'Size cannot be empty');
    require(bytes(category).length > 0, 'Category cannot be empty');
    require(bytes(subCategory).length > 0, 'Sub-category cannot be empty');
    require(bytes(model).length > 0, 'Model cannot be empty');
    require(bytes(brand).length > 0, 'Brand cannot be empty');
    require(weight > 0, 'Weight must be greater than 0');
    require(squ > 0, 'SKU must be greater than 0');

    products[productId].name = name;
    products[productId].description = description;
    products[productId].price = price;
    products[productId].stock = stock;
    products[productId].color = color;
    products[productId].size = size;
    products[productId].images = images;
    products[productId].category = category;
    products[productId].subCategory = subCategory;
    products[productId].model = model;
    products[productId].brand = brand;
    products[productId].weight = weight;
    products[productId].squ = squ;
  }

  function deleteProduct(uint256 productId) external onlyVerifiedSellerOrOwner {
    require(productExists[productId], 'Product does not exist');
    require(
      products[productId].seller == msg.sender || owner() == msg.sender,
      'Only product seller or owner can delete'
    );
    require(!products[productId].deleted, 'Product is already deleted');
    products[productId].deleted = true;
  }

  function createReview(uint256 productId, uint256 rating, string memory comment) external {
    require(products[productId].seller != msg.sender, 'Seller cannot review their own product');
    require(rating > 0 && rating <= 5, 'Rating must be between 1 and 5');
    require(bytes(comment).length > 0, 'Comment cannot be empty');

    ReviewStruct memory review;
    review.reviewId = _TotalReviews.current();
    review.reviewer = msg.sender;
    review.rating = rating;
    review.comment = comment;
    reviewExists[review.reviewId] = true;

    products[productId].reviews.push(review);
  }

  function deleteReview(uint256 productId, uint256 reviewId) external {
    bool found = false;
    for (uint i = 0; i < products[productId].reviews.length; i++) {
      if (products[productId].reviews[i].reviewId == reviewId) {
        require(reviewExists[reviewId], 'Review does not exist');
        require(
          products[productId].reviews[i].reviewer == msg.sender || owner() == msg.sender,
          'Only reviewer or owner can delete review'
        );
        require(!products[productId].reviews[i].deleted, 'Review already deleted');
        products[productId].reviews[i].deleted = true;
        found = true;
        break;
      }
    }
    require(found, 'Review not found');
  }

  function getReviews(uint256 productId) external view returns (ReviewStruct[] memory) {
    require(!products[productId].deleted, 'Product is deleted');
    require(productExists[productId], 'Product does not exist');
    uint256 count = 0;
    for (uint i = 0; i < products[productId].reviews.length; i++) {
      if (!products[productId].reviews[i].deleted) {
        count++;
      }
    }
    ReviewStruct[] memory reviews = new ReviewStruct[](count);

    uint256 index = 0;
    for (uint i = 0; i < products[productId].reviews.length; i++) {
      if (!products[productId].reviews[i].deleted) {
        reviews[index] = products[productId].reviews[i];
        index++;
      }
    }
    return reviews;
  }

  function getProduct(uint256 productId) public view returns (ProductStruct memory) {
    require(!products[productId].deleted, 'Product is deleted');
    require(productExists[productId], 'Product does not exist');
    return products[productId];
  }

  function getMyProducts() public view returns (ProductStruct[] memory myProducts) {
    uint256 availableProducs;
    for (uint i = 1; i < _TotalProducts.current(); i++) {
      if (products[i].seller == msg.sender && !products[i].deleted) {
        availableProducs++;
      }
    }
    ProductStruct[] memory myProducts = new ProductStruct[](availableProducs);
    uint256 index = 0;
    for (uint i = 1; i < _TotalProducts.current(); i++) {
      if (products[i].seller == msg.sender && !products[i].deleted) {
        myProducts[index] = products[i];
        index++;
      }
    }
    return myProducts;
  }

  function getAllProducts() public view returns (ProductStruct[] memory) {
    uint256 availableProducs;
    for (uint i = 1; i < _TotalProducts.current(); i++) {
      if (!products[i].deleted) {
        availableProducs++;
      }
    }
    ProductStruct[] memory allProducts = new ProductStruct[](availableProducs);
    uint256 index = 0;
    for (uint i = 1; i < _TotalProducts.current(); i++) {
      if (!products[i].deleted) {
        allProducts[index] = products[i];
        index++;
      }
    }
    return allProducts;
  }

  function buyProduct(uint256 productId) external payable nonReentrant {
    // Validate product state
    require(productExists[productId], 'Product does not exist');
    require(!products[productId].deleted, 'Product is deleted');
    require(products[productId].stock > 0, 'Product is out of stock');
    require(!products[productId].soldout, 'Product is already soldout');
    require(products[productId].seller != msg.sender, 'Cannot buy your own product');
    
    uint256 price = products[productId].price;
    require(msg.value >= price, 'Insufficient funds');

    // Update product state
    products[productId].stock--;
    if (products[productId].stock == 0) {
        products[productId].soldout = true;
    }

    // Record the transaction
    _recordPurchase(
        productId,
        msg.sender,
        products[productId].seller,
        price,
        price
    );
    _TotalSales.increment();

    // Return excess payment if any
    uint256 excess = msg.value - price;
    if (excess > 0) {
        payTo(msg.sender, excess);
    }

    emit ProductPurchased(
        productId, 
        msg.sender, 
        products[productId].seller, 
        price, 
        block.timestamp
    );
  }

  function payTo(address to, uint256 amount) internal {
    (bool success, ) = payable(to).call{ value: amount }('');
    require(success, 'Transfer failed');
  }

  function registerSeller() external {
    require(!registeredSellers[msg.sender], 'Already registered');
    registeredSellers[msg.sender] = true;
    sellerStatus[msg.sender] = SellerStatus.Pending;
    emit SellerRegistered(msg.sender, block.timestamp);
  }

  function updateSellerStatus(address seller, SellerStatus status) external onlyOwner {
    require(seller != address(0), "Invalid seller address");
    require(registeredSellers[seller], "Seller not registered");
    require(sellerStatus[seller] != status, "Status already set");
    
    // Special validations for certain status changes
    if (status == SellerStatus.Verified) {
        require(
            sellerStatus[seller] == SellerStatus.Pending,
            "Can only verify pending sellers"
        );
    }
    
    sellerStatus[seller] = status;
    emit SellerStatusUpdated(seller, status);
  }

  function _recordPurchase(
    uint256 productId,
    address buyer,
    address seller,
    uint256 totalAmount,
    uint256 basePrice
  ) internal {
    PurchaseHistoryStruct memory purchase = PurchaseHistoryStruct({
      productId: productId,
      totalAmount: totalAmount,
      basePrice: basePrice,
      timestamp: block.timestamp,
      buyer: buyer,
      seller: seller,
      isDelivered: false
    });

    buyerPurchaseHistory[buyer].push(purchase);
    sellerPurchaseHistory[seller].push(purchase);

  
    sellerBalances[seller] += totalAmount;

    emit PurchaseRecorded(productId, buyer, seller, totalAmount, basePrice, block.timestamp);
  }

  function withdraw() external onlyVerifiedSellerOrOwner {
    uint256 balance = sellerBalances[msg.sender];
    require(balance > 0, "No balance to withdraw");
    
    // Calculate service fee
    uint256 serviceFee = (balance * servicePct) / 100;
    uint256 sellerAmount = balance - serviceFee;
    
    // Reset balance before transfer
    sellerBalances[msg.sender] = 0;
    
    payTo(owner(), serviceFee);
    payTo(msg.sender, sellerAmount);
    
    emit BalanceUpdated(msg.sender, 0);
  }

  function getSellerBalance(address seller) external view returns (uint256) {
    return sellerBalances[seller];
  }

  function getBuyerPurchaseHistory(
    address buyer
  ) external view returns (PurchaseHistoryStruct[] memory) {
    return buyerPurchaseHistory[buyer];
  }

  function getSellerPurchaseHistory(
    address seller
  ) external view returns (PurchaseHistoryStruct[] memory) {
    return sellerPurchaseHistory[seller];
  }
}
