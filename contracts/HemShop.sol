// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

contract HemShop is Ownable, ReentrancyGuard, ERC721 {
  using Counters for Counters.Counter;

  // Counters
  Counters.Counter private _TotalProducts;
  Counters.Counter private _TotalSales;
  Counters.Counter private _TotalReviews;

  // State Variables
  uint256 public servicePct;
  address[] private registeredSellersList;

  // Enums
  enum SellerStatus {
    Unverified,
    Pending,
    Verified,
    Suspended
  }

  // Structs
  struct SellerProfile {
    string businessName;
    string description;
    string email;
    string phone;
    string logo;
    uint256 registeredAt;
    bool termsAccepted;
  }

  struct Category {
    uint256 id;
    string name;
    bool isActive;
    uint256[] subCategoryIds;
  }

  struct SubCategory {
    uint256 id;
    string name;
    uint256 parentCategoryId;
    bool isActive;
  }

  struct ReviewStruct {
    uint256 reviewId;
    address reviewer;
    uint256 rating;
    string comment;
    bool deleted;
    uint256 timestamp;
  }

  struct ProductStruct {
    uint256 id;
    address seller;
    string name;
    string description;
    uint256 price;
    uint256 stock;
    string[] colors;
    string[] sizes;
    string[] images;
    string category;
    string subCategory;
    uint256 weight;
    string model;
    string brand;
    uint256 sku;
    bool soldout;
    bool wishlist;
    bool deleted;
    ReviewStruct[] reviews;
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

  struct PurchaseHistoryStruct {
    uint256 productId;
    uint256 totalAmount;
    uint256 basePrice;
    uint256 timestamp;
    address buyer;
    address seller;
    bool isDelivered;
    ShippingDetails shippingDetails;
  }

  struct ProductInput {
    string name;
    string description;
    uint256 price;
    uint256 stock;
    string[] colors;
    string[] sizes;
    string[] images;
    uint256 categoryId;
    uint256 subCategoryId;
    string model;
    string brand;
    uint256 weight;
    uint256 sku;
  }

  // Mappings
  mapping(address => SellerProfile) public sellerProfiles;
  mapping(uint256 => Category) private categories;
  mapping(uint256 => SubCategory) private subCategories;
  mapping(uint256 => ProductStruct) public products;
  mapping(address => uint256[]) public sellerProducts;
  mapping(address => uint256) public sellerBalances;
  mapping(address => SellerStatus) public sellerStatus;
  mapping(address => PurchaseHistoryStruct[]) public buyerPurchaseHistory;
  mapping(address => PurchaseHistoryStruct[]) public sellerPurchaseHistory;
  mapping(address => bool) public registeredSellers;
  mapping(uint256 => bool) public productExists;
  mapping(uint256 => bool) public reviewExists;
  mapping(address => address) public adminImpersonating;

  // Counters
  uint256 private _categoryCounter;
  uint256 private _subCategoryCounter;

  // Events
  event CategoryCreated(uint256 indexed id, string name);
  event SubCategoryCreated(uint256 indexed id, uint256 indexed parentId, string name);
  event CategoryUpdated(uint256 indexed id, string name, bool isActive);
  event SubCategoryUpdated(uint256 indexed id, string name, bool isActive);
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

  // Constructor
  constructor(uint256 _pct) ERC721('HemShop', 'Hsp') {
    servicePct = _pct;
  }

  // Modifiers
  modifier onlyVerifiedSellerOrOwner() {
    if (msg.sender == owner()) {
      _;
      return;
    }

    address actingAs = adminImpersonating[msg.sender];
    if (actingAs != address(0)) {
      require(
        sellerStatus[actingAs] == SellerStatus.Verified || msg.sender == owner(),
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

  modifier onlyVerifiedOrAdmin() {
    if (msg.sender == owner()) {
      _;
      return;
    }

    address actingAs = adminImpersonating[msg.sender];
    if (actingAs != address(0)) {
      _;
      return;
    }

    require(
      sellerStatus[msg.sender] == SellerStatus.Verified,
      'Only verified seller or admin allowed'
    );
    _;
  }

  // Main Functions

  // Seller Management Functions
  function registerSeller(
    string memory businessName,
    string memory description,
    string memory email,
    string memory phone,
    string memory logo
  ) external {
    require(!registeredSellers[msg.sender], 'Already registered');
    require(bytes(businessName).length > 0, 'Business name required');
    require(bytes(email).length > 0, 'Email required');
    require(bytes(phone).length > 0, 'Phone required');

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

  function updateSellerStatus(address seller, SellerStatus status) external onlyOwner {
    require(seller != address(0), 'Invalid seller address');
    require(registeredSellers[seller], 'Seller not registered');
    require(sellerStatus[seller] != status, 'Status already set');

    if (status == SellerStatus.Verified) {
      require(sellerStatus[seller] == SellerStatus.Pending, 'Can only verify pending sellers');
    }

    sellerStatus[seller] = status;
    emit SellerStatusUpdated(seller, status);
  }

  function getSellerProfile(address seller) external view returns (SellerProfile memory) {
    require(registeredSellers[seller], 'Seller not registered');
    return sellerProfiles[seller];
  }

  function getSellerStatus(address seller) external view returns (SellerStatus) {
    require(seller != address(0), 'Invalid seller address');
    return sellerStatus[seller];
  }

  function getPendingSellers() external view returns (address[] memory) {
    uint256 pendingCount = 0;
    for (uint256 i = 0; i < registeredSellersList.length; i++) {
      if (sellerStatus[registeredSellersList[i]] == SellerStatus.Pending) {
        pendingCount++;
      }
    }

    address[] memory pendingSellers = new address[](pendingCount);
    uint256 currentIndex = 0;

    for (uint256 i = 0; i < registeredSellersList.length; i++) {
      if (sellerStatus[registeredSellersList[i]] == SellerStatus.Pending) {
        pendingSellers[currentIndex] = registeredSellersList[i];
        currentIndex++;
      }
    }

    return pendingSellers;
  }

  // Product Management Functions
  function createProduct(ProductInput calldata input) public onlyVerifiedOrAdmin {
    require(bytes(input.name).length > 0, 'Name cannot be empty');
    require(bytes(input.description).length > 0, 'Description cannot be empty');
    require(input.price > 0, 'Price must be greater than 0');
    require(input.stock > 0, 'Stock must be greater than 0');
    require(input.colors.length > 0, 'Colors cannot be empty');
    require(input.sizes.length > 0, 'Sizes cannot be empty');
    require(input.images.length > 0, 'Images cannot be empty');
    require(input.images.length <= 5, 'Images cannot be more than 5');
    require(input.categoryId > 0, 'Category cannot be empty');
    require(input.subCategoryId > 0, 'Sub-category cannot be empty');
    require(bytes(input.model).length > 0, 'Model cannot be empty');
    require(bytes(input.brand).length > 0, 'Brand cannot be empty');
    require(input.weight > 0, 'Weight must be greater than 0');
    require(input.sku > 0, 'SKU must be greater than 0');

    _TotalProducts.increment();

    ProductStruct memory product;
    product.id = _TotalProducts.current();
    product.seller = msg.sender;
    product.name = input.name;
    product.description = input.description;
    product.price = input.price;
    product.stock = input.stock;
    product.colors = input.colors;
    product.sizes = input.sizes;
    product.images = input.images;
    product.category = categories[input.categoryId].name;
    product.subCategory = subCategories[input.subCategoryId].name;
    product.model = input.model;
    product.brand = input.brand;
    product.weight = input.weight;
    product.sku = input.sku;

    uint256 newProductId = _TotalProducts.current();
    _mint(msg.sender, newProductId);

    products[newProductId] = product;
    productExists[newProductId] = true;
    sellerProducts[msg.sender].push(newProductId);
  }

  function updateProduct(
    uint256 productId,
    ProductInput calldata input
  ) external onlyVerifiedSellerOrOwner {
    require(products[productId].seller == msg.sender, 'Only the seller can update their product');
    require(productExists[productId], 'Product does not exist');
    require(!products[productId].deleted, 'Product is deleted');

    require(bytes(input.name).length > 0, 'Name cannot be empty');
    require(bytes(input.description).length > 0, 'Description cannot be empty');
    require(input.price > 0, 'Price must be greater than 0');
    require(input.stock > 0, 'Stock must be greater than 0');
    require(input.colors.length > 0, 'Colors cannot be empty');
    require(input.sizes.length > 0, 'Sizes cannot be empty');
    require(input.images.length > 0, 'Images cannot be empty');
    require(input.images.length <= 5, 'Images cannot be more than 5');
    require(input.categoryId > 0, 'Category cannot be empty');
    require(input.subCategoryId > 0, 'Sub-category cannot be empty');
    require(bytes(input.model).length > 0, 'Model cannot be empty');
    require(bytes(input.brand).length > 0, 'Brand cannot be empty');
    require(input.weight > 0, 'Weight must be greater than 0');
    require(input.sku > 0, 'SKU must be greater than 0');

    products[productId].name = input.name;
    products[productId].description = input.description;
    products[productId].price = input.price;
    products[productId].stock = input.stock;
    products[productId].colors = input.colors;
    products[productId].sizes = input.sizes;
    products[productId].images = input.images;
    products[productId].category = categories[input.categoryId].name;
    products[productId].subCategory = subCategories[input.subCategoryId].name;
    products[productId].model = input.model;
    products[productId].brand = input.brand;
    products[productId].weight = input.weight;
    products[productId].sku = input.sku;
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

  function getProduct(uint256 productId) public view returns (ProductStruct memory) {
    require(!products[productId].deleted, 'Product is deleted');
    require(productExists[productId], 'Product does not exist');
    return products[productId];
  }

  function getMyProducts() public view returns (ProductStruct[] memory) {
    uint256 availableProducts;
    for (uint i = 1; i <= _TotalProducts.current(); i++) {
      if (products[i].seller == msg.sender && !products[i].deleted) {
        availableProducts++;
      }
    }

    ProductStruct[] memory productsList = new ProductStruct[](availableProducts);
    uint256 index = 0;
    for (uint i = 1; i <= _TotalProducts.current(); i++) {
      if (products[i].seller == msg.sender && !products[i].deleted) {
        productsList[index] = products[i];
        index++;
      }
    }
    return productsList;
  }

  function getSellerProducts(address seller) external view returns (ProductStruct[] memory) {
    uint256 count = 0;
    for (uint256 i = 1; i <= _TotalProducts.current(); i++) {
      if (products[i].seller == seller && !products[i].deleted) {
        count++;
      }
    }

    ProductStruct[] memory sellerProductsList = new ProductStruct[](count);
    uint256 index = 0;
    for (uint256 i = 1; i <= _TotalProducts.current(); i++) {
      if (products[i].seller == seller && !products[i].deleted) {
        sellerProductsList[index] = products[i];
        index++;
      }
    }

    return sellerProductsList;
  }

  function getAllProducts() public view returns (ProductStruct[] memory) {
    uint256 availableProducts;
    for (uint i = 1; i <= _TotalProducts.current(); i++) {
      if (!products[i].deleted) {
        availableProducts++;
      }
    }

    ProductStruct[] memory allProductsList = new ProductStruct[](availableProducts);
    uint256 index = 0;
    for (uint i = 1; i <= _TotalProducts.current(); i++) {
      if (!products[i].deleted) {
        allProductsList[index] = products[i];
        index++;
      }
    }
    return allProductsList;
  }

  function getProductsByCategory(
    string memory categoryName
  ) external view returns (ProductStruct[] memory) {
    uint256 count = 0;
    for (uint256 i = 1; i <= _TotalProducts.current(); i++) {
      if (
        keccak256(bytes(products[i].category)) == keccak256(bytes(categoryName)) &&
        !products[i].deleted
      ) {
        count++;
      }
    }

    ProductStruct[] memory categoryProducts = new ProductStruct[](count);
    uint256 index = 0;
    for (uint256 i = 1; i <= _TotalProducts.current(); i++) {
      if (
        keccak256(bytes(products[i].category)) == keccak256(bytes(categoryName)) &&
        !products[i].deleted
      ) {
        categoryProducts[index] = products[i];
        index++;
      }
    }

    return categoryProducts;
  }

  // Category Management Functions
  function createCategory(string memory _name) external onlyOwner {
    require(bytes(_name).length > 0, 'Category name cannot be empty');

    _categoryCounter++;
    categories[_categoryCounter] = Category({
      id: _categoryCounter,
      name: _name,
      isActive: true,
      subCategoryIds: new uint256[](0)
    });

    emit CategoryCreated(_categoryCounter, _name);
  }

  function createSubCategory(uint256 _parentId, string memory _name) external onlyOwner {
    require(categories[_parentId].id != 0, 'Parent category does not exist');
    require(bytes(_name).length > 0, 'Subcategory name cannot be empty');

    _subCategoryCounter++;
    subCategories[_subCategoryCounter] = SubCategory({
      id: _subCategoryCounter,
      name: _name,
      parentCategoryId: _parentId,
      isActive: true
    });

    categories[_parentId].subCategoryIds.push(_subCategoryCounter);

    emit SubCategoryCreated(_subCategoryCounter, _parentId, _name);
  }

  function createSubCategoriesBulk(uint256 parentId, string[] calldata names) external {
    require(categories[parentId].isActive, 'Parent category not active');

    for (uint i = 0; i < names.length; i++) {
      _subCategoryCounter++;

      SubCategory memory newSubCategory = SubCategory({
        id: _subCategoryCounter,
        name: names[i],
        parentCategoryId: parentId,
        isActive: true
      });

      subCategories[_subCategoryCounter] = newSubCategory;
      categories[parentId].subCategoryIds.push(_subCategoryCounter);

      emit SubCategoryCreated(_subCategoryCounter, parentId, names[i]);
    }
  }

  function updateCategory(uint256 _id, string memory _name, bool _isActive) external onlyOwner {
    require(categories[_id].id != 0, 'Category does not exist');
    require(bytes(_name).length > 0, 'Category name cannot be empty');

    categories[_id].name = _name;
    categories[_id].isActive = _isActive;

    emit CategoryUpdated(_id, _name, _isActive);
  }

  function updateSubCategory(uint256 _id, string memory _name, bool _isActive) external onlyOwner {
    require(subCategories[_id].id != 0, 'Subcategory does not exist');
    require(bytes(_name).length > 0, 'Subcategory name cannot be empty');

    subCategories[_id].name = _name;
    subCategories[_id].isActive = _isActive;

    emit SubCategoryUpdated(_id, _name, _isActive);
  }

  function getCategory(
    uint256 _id
  )
    external
    view
    returns (uint256 id, string memory name, bool isActive, uint256[] memory subCategoryIds)
  {
    Category memory category = categories[_id];
    require(category.id != 0, 'Category does not exist');

    return (category.id, category.name, category.isActive, category.subCategoryIds);
  }

  function getSubCategory(
    uint256 _id
  )
    external
    view
    returns (uint256 id, string memory name, uint256 parentCategoryId, bool isActive)
  {
    SubCategory memory subCategory = subCategories[_id];
    require(subCategory.id != 0, 'Subcategory does not exist');

    return (subCategory.id, subCategory.name, subCategory.parentCategoryId, subCategory.isActive);
  }

  function getAllCategories()
    external
    view
    returns (
      uint256[] memory ids,
      string[] memory names,
      bool[] memory activeStates,
      uint256[][] memory subCategoryIdArrays
    )
  {
    uint256 count = _categoryCounter;
    ids = new uint256[](count);
    names = new string[](count);
    activeStates = new bool[](count);
    subCategoryIdArrays = new uint256[][](count);

    for (uint256 i = 1; i <= count; i++) {
      Category memory category = categories[i];
      if (category.id != 0) {
        uint256 index = i - 1;
        ids[index] = category.id;
        names[index] = category.name;
        activeStates[index] = category.isActive;
        subCategoryIdArrays[index] = category.subCategoryIds;
      }
    }
  }

  // Review Management Functions
  function createReview(uint256 productId, uint256 rating, string memory comment) external {
    require(products[productId].seller != msg.sender, 'Seller cannot review their own product');
    require(rating > 0 && rating <= 5, 'Rating must be between 1 and 5');
    require(bytes(comment).length > 0, 'Comment cannot be empty');

    _TotalReviews.increment();
    ReviewStruct memory review;
    review.reviewId = _TotalReviews.current();
    review.reviewer = msg.sender;
    review.rating = rating;
    review.comment = comment;
    review.timestamp = block.timestamp;
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

  // Purchase Management Functions
  function buyProduct(
    uint256 productId,
    ShippingDetails calldata shippingDetails
  ) external payable nonReentrant {
    require(productExists[productId], 'Product does not exist');
    require(!products[productId].deleted, 'Product is deleted');
    require(
      sellerStatus[products[productId].seller] == SellerStatus.Verified,
      'Seller is not verified'
    );
    require(products[productId].stock > 0, 'Product is out of stock');
    require(products[productId].soldout == false, 'Product is already soldout');
    require(products[productId].seller != msg.sender, 'Cannot buy your own product');

    // Validate shipping details
    require(bytes(shippingDetails.fullName).length > 0, 'Full name required');
    require(bytes(shippingDetails.streetAddress).length > 0, 'Street address required');
    require(bytes(shippingDetails.city).length > 0, 'City required');
    require(bytes(shippingDetails.state).length > 0, 'State required');
    require(bytes(shippingDetails.country).length > 0, 'Country required');
    require(bytes(shippingDetails.postalCode).length > 0, 'Postal code required');
    require(bytes(shippingDetails.phone).length > 0, 'Phone required');
    require(bytes(shippingDetails.email).length > 0, 'Email required');

    uint256 price = products[productId].price;
    require(msg.value >= price, 'Insufficient funds');

    products[productId].stock--;
    if (products[productId].stock == 0) {
      products[productId].soldout = true;
    }

    _recordPurchaseWithShipping(
      productId,
      msg.sender,
      products[productId].seller,
      price,
      price,
      shippingDetails
    );
    _TotalSales.increment();

    // Return excess payment
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

  function _recordPurchaseWithShipping(
    uint256 productId,
    address buyer,
    address seller,
    uint256 totalAmount,
    uint256 basePrice,
    ShippingDetails memory shippingDetails
  ) internal {
    PurchaseHistoryStruct memory purchase = PurchaseHistoryStruct({
      productId: productId,
      totalAmount: totalAmount,
      basePrice: basePrice,
      timestamp: block.timestamp,
      buyer: buyer,
      seller: seller,
      isDelivered: false,
      shippingDetails: shippingDetails
    });

    buyerPurchaseHistory[buyer].push(purchase);
    sellerPurchaseHistory[seller].push(purchase);

    sellerBalances[seller] += totalAmount;

    emit PurchaseRecorded(productId, buyer, seller, totalAmount, basePrice, block.timestamp);
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
      isDelivered: false,
      shippingDetails: ShippingDetails('', '', '', '', '', '', '', '')
    });

    buyerPurchaseHistory[buyer].push(purchase);
    sellerPurchaseHistory[seller].push(purchase);

    sellerBalances[seller] += totalAmount;

    emit PurchaseRecorded(productId, buyer, seller, totalAmount, basePrice, block.timestamp);
  }

  function withdraw() external onlyVerifiedSellerOrOwner {
    uint256 balance = sellerBalances[msg.sender];
    require(balance > 0, 'No balance to withdraw');

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

  function deleteCategory(uint256 _id) external onlyOwner {
    require(categories[_id].id != 0, 'Category does not exist');
    categories[_id].isActive = false;
    emit CategoryUpdated(_id, categories[_id].name, false);
  }

  function deleteSubCategory(uint256 _id) external onlyOwner {
    require(subCategories[_id].id != 0, 'Subcategory does not exist');
    subCategories[_id].isActive = false;
    emit SubCategoryUpdated(_id, subCategories[_id].name, false);
  }

  // Admin Functions
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
    (bool success, ) = payable(to).call{value: amount}('');
    require(success, 'Transfer failed');
  }
}
