// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import './UserSellerManager.sol';
import '../interfaces/IHemShop.sol';

contract ProductManager is ERC721, UserSellerManager {
  using Counters for Counters.Counter;

  // --- Counters ---
  Counters.Counter private _TotalProducts;
  Counters.Counter private _TotalReviews;
  uint256 private _categoryCounter;
  uint256 private _subCategoryCounter;

  // --- Mappings ---
  mapping(uint256 => IHemShop.ProductStruct) public products;
  mapping(address => uint256[]) public sellerProducts;
  mapping(uint256 => bool) public productExists;
  mapping(uint256 => IHemShop.Category) private categories;
  mapping(uint256 => IHemShop.SubCategory) private subCategories;
  mapping(uint256 => bool) public reviewExists;

  // --- Events ---
  event CategoryCreated(uint256 indexed id, string name);
  event SubCategoryCreated(uint256 indexed id, uint256 indexed parentId, string name);
  event CategoryUpdated(uint256 indexed id, string name, bool isActive);
  event SubCategoryUpdated(uint256 indexed id, string name, bool isActive);

  constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

  // --- Product Functions ---
  function createProduct(IHemShop.ProductInput calldata input) external {
    require(
      sellerStatus[msg.sender] == SellerStatus.Verified || msg.sender == owner(),
      'Must be verified seller or owner'
    );

    require(bytes(input.name).length > 0, 'Name cannot be empty');
    require(bytes(input.description).length > 0, 'Description cannot be empty');
    require(input.price > 0, 'Price must be greater than 0');
    require(input.stock > 0, 'Stock must be greater than 0');
    require(input.colors.length > 0, 'Colors cannot be empty');
    require(input.categoryId > 0, 'Category ID must be greater than 0');
    require(input.subCategoryId > 0, 'SubCategory ID must be greater than 0');
    require(input.weight > 0, 'Weight must be greater than 0');
    require(input.sku > 0, 'SKU must be greater than 0');
    require(input.images.length > 0, 'Images cannot be empty');
    require(input.images.length <= 5, 'Images cannot be more than 5');

    _TotalProducts.increment();

    IHemShop.ProductStruct memory product;
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


  function updateProduct(uint256 productId, IHemShop.ProductInput calldata input) external {
    require(products[productId].seller == msg.sender, 'Only the seller can update their product');
    require(productExists[productId], 'Product does not exist');
    require(!products[productId].deleted, 'Product is deleted');

    require(bytes(input.name).length > 0, 'Name cannot be empty');
    require(bytes(input.description).length > 0, 'Description cannot be empty');
    require(input.price > 0, 'Price must be greater than 0');
    require(input.stock > 0, 'Stock must be greater than 0');
    require(input.colors.length > 0, 'Colors cannot be empty');
    require(input.images.length > 0, 'Images cannot be empty');
    require(input.images.length <= 5, 'Images cannot be more than 5');
    require(input.categoryId > 0, 'Category cannot be empty');
    require(input.subCategoryId > 0, 'Sub-category cannot be empty');
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

  function deleteProduct(uint256 productId) external {
    require(productExists[productId], 'Product does not exist');
    require(
      products[productId].seller == msg.sender || owner() == msg.sender,
      'Only product seller or owner can delete'
    );
    require(!products[productId].deleted, 'Product is already deleted');
    products[productId].deleted = true;
  }



  // --- Category Functions ---
  function createCategory(string memory _name) external onlyOwner {
    require(bytes(_name).length > 0, 'Category name cannot be empty');

    _categoryCounter++;
    categories[_categoryCounter] = IHemShop.Category({
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
    subCategories[_subCategoryCounter] = IHemShop.SubCategory({
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

      IHemShop.SubCategory memory newSubCategory = IHemShop.SubCategory({
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
      IHemShop.Category memory category = categories[i];
      if (category.id != 0) {
        uint256 index = i - 1;
        ids[index] = category.id;
        names[index] = category.name;
        activeStates[index] = category.isActive;
        subCategoryIdArrays[index] = category.subCategoryIds;
      }
    }
  }

  // --- View Functions ---
  function getProduct(uint256 productId) public view returns (IHemShop.ProductStruct memory) {
    require(!products[productId].deleted, 'Product is deleted');
    require(productExists[productId], 'Product does not exist');
    return products[productId];
  }

  function getMyProducts() public view returns (IHemShop.ProductStruct[] memory) {
    uint256 availableProducts;
    for (uint i = 1; i <= _TotalProducts.current(); i++) {
      if (products[i].seller == msg.sender && !products[i].deleted) {
        availableProducts++;
      }
    }

    IHemShop.ProductStruct[] memory productsList = new IHemShop.ProductStruct[](availableProducts);
    uint256 index = 0;
    for (uint i = 1; i <= _TotalProducts.current(); i++) {
      if (products[i].seller == msg.sender && !products[i].deleted) {
        productsList[index] = products[i];
        index++;
      }
    }
    return productsList;
  }

  function getAllProducts() public view returns (IHemShop.ProductStruct[] memory) {
    uint256 availableProducts;
    for (uint i = 1; i <= _TotalProducts.current(); i++) {
      if (!products[i].deleted) {
        availableProducts++;
      }
    }

    IHemShop.ProductStruct[] memory allProductsList = new IHemShop.ProductStruct[](
      availableProducts
    );
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
  ) external view returns (IHemShop.ProductStruct[] memory) {
    uint256 count = 0;
    for (uint256 i = 1; i <= _TotalProducts.current(); i++) {
      if (
        keccak256(bytes(products[i].category)) == keccak256(bytes(categoryName)) &&
        !products[i].deleted
      ) {
        count++;
      }
    }

    IHemShop.ProductStruct[] memory categoryProducts = new IHemShop.ProductStruct[](count);
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

  // --- Category View Functions ---
  function getCategory(
    uint256 _id
  )
    external
    view
    returns (uint256 id, string memory name, bool isActive, uint256[] memory subCategoryIds)
  {
    IHemShop.Category memory category = categories[_id];
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
    IHemShop.SubCategory memory subCategory = subCategories[_id];
    require(subCategory.id != 0, 'Subcategory does not exist');

    return (subCategory.id, subCategory.name, subCategory.parentCategoryId, subCategory.isActive);
  }

  // Add these review functions
  function createReview(uint256 productId, uint256 rating, string memory comment) external {
    require(products[productId].seller != msg.sender, 'Seller cannot review their own product');
    require(rating > 0 && rating <= 5, 'Rating must be between 1 and 5');
    require(bytes(comment).length > 0, 'Comment cannot be empty');

    _TotalReviews.increment();
    IHemShop.ReviewStruct memory review;
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

  function getReviews(uint256 productId) external view returns (IHemShop.ReviewStruct[] memory) {
    require(!products[productId].deleted, 'Product is deleted');
    require(productExists[productId], 'Product does not exist');
    uint256 count = 0;
    for (uint i = 0; i < products[productId].reviews.length; i++) {
      if (!products[productId].reviews[i].deleted) {
        count++;
      }
    }
    IHemShop.ReviewStruct[] memory reviews = new IHemShop.ReviewStruct[](count);

    uint256 index = 0;
    for (uint i = 0; i < products[productId].reviews.length; i++) {
      if (!products[productId].reviews[i].deleted) {
        reviews[index] = products[productId].reviews[i];
        index++;
      }
    }
    return reviews;
  }

  
  function getSellerProducts(
    address seller
  ) external view returns (IHemShop.ProductStruct[] memory) {
    uint256 count = 0;
    for (uint256 i = 1; i <= _TotalProducts.current(); i++) {
      if (products[i].seller == seller && !products[i].deleted) {
        count++;
      }
    }

    IHemShop.ProductStruct[] memory sellerProductsList = new IHemShop.ProductStruct[](count);
    uint256 index = 0;
    for (uint256 i = 1; i <= _TotalProducts.current(); i++) {
      if (products[i].seller == seller && !products[i].deleted) {
        sellerProductsList[index] = products[i];
        index++;
      }
    }

    return sellerProductsList;
  }
}
