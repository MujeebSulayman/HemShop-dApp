// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

contract HemShopBase is Ownable, ReentrancyGuard, ERC721 {
    using Counters for Counters.Counter;

    // --- Counters ---
    Counters.Counter private _TotalProducts;
    Counters.Counter private _TotalReviews;
    uint256 private _categoryCounter;
    uint256 private _subCategoryCounter;

    // --- Structs ---
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
        uint256 weight;
        string model;
        string brand;
        uint256 sku;
    }

    // --- Mappings ---
    mapping(uint256 => ProductStruct) public products;
    mapping(address => uint256[]) public sellerProducts;
    mapping(uint256 => bool) public productExists;
    mapping(uint256 => Category) private categories;
    mapping(uint256 => SubCategory) private subCategories;
    mapping(uint256 => bool) public reviewExists;

    // --- Events ---
    event CategoryCreated(uint256 indexed id, string name);
    event SubCategoryCreated(uint256 indexed id, uint256 indexed parentId, string name);
    event CategoryUpdated(uint256 indexed id, string name, bool isActive);
    event SubCategoryUpdated(uint256 indexed id, string name, bool isActive);
    event ProductCreated(uint256 indexed productId, address indexed seller);
    event ProductUpdated(uint256 indexed productId);
    event ProductDeleted(uint256 indexed productId);
    event ReviewCreated(uint256 indexed productId, uint256 indexed reviewId);
    event ReviewDeleted(uint256 indexed productId, uint256 indexed reviewId);

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

    // --- Product Management ---
    function createProduct(ProductInput calldata input) public virtual {
        require(bytes(input.name).length > 0, 'Name cannot be empty');
        require(bytes(input.description).length > 0, 'Description cannot be empty');
        require(input.price > 0, 'Price must be greater than 0');
        require(input.stock > 0, 'Stock must be greater than 0');
        require(input.colors.length > 0, 'Colors cannot be empty');
        require(input.images.length > 0 && input.images.length <= 5, 'Invalid number of images');
        require(input.categoryId > 0, 'Category ID must be greater than 0');
        require(input.subCategoryId > 0, 'SubCategory ID must be greater than 0');
        require(input.weight > 0, 'Weight must be greater than 0');
        require(input.sku > 0, 'SKU must be greater than 0');

        _TotalProducts.increment();
        uint256 newProductId = _TotalProducts.current();

        ProductStruct memory product;
        product.id = newProductId;
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
        product.weight = input.weight;
        product.model = input.model;
        product.brand = input.brand;
        product.sku = input.sku;

        products[newProductId] = product;
        productExists[newProductId] = true;
        sellerProducts[msg.sender].push(newProductId);

        _mint(msg.sender, newProductId);
        emit ProductCreated(newProductId, msg.sender);
    }

    function updateProduct(uint256 productId, ProductInput calldata input) public virtual {
        require(productExists[productId], 'Product does not exist');
        require(!products[productId].deleted, 'Product is deleted');
        require(products[productId].seller == msg.sender, 'Not product owner');

        ProductStruct storage product = products[productId];
        product.name = input.name;
        product.description = input.description;
        product.price = input.price;
        product.stock = input.stock;
        product.colors = input.colors;
        product.sizes = input.sizes;
        product.images = input.images;
        product.category = categories[input.categoryId].name;
        product.subCategory = subCategories[input.subCategoryId].name;
        product.weight = input.weight;
        product.model = input.model;
        product.brand = input.brand;
        product.sku = input.sku;

        emit ProductUpdated(productId);
    }

    function deleteProduct(uint256 productId) public virtual {
        require(productExists[productId], 'Product does not exist');
        require(!products[productId].deleted, 'Product already deleted');
        require(products[productId].seller == msg.sender, 'Not product owner');

        products[productId].deleted = true;
        emit ProductDeleted(productId);
    }

    // --- Category Management ---
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

    // --- Review Management ---
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
        emit ReviewCreated(productId, review.reviewId);
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
                emit ReviewDeleted(productId, reviewId);
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

    // --- Category Getters ---
    function getCategory(uint256 _id)
        external
        view
        returns (
            uint256 id,
            string memory name,
            bool isActive,
            uint256[] memory subCategoryIds
        )
    {
        Category memory category = categories[_id];
        require(category.id != 0, 'Category does not exist');
        return (category.id, category.name, category.isActive, category.subCategoryIds);
    }

    function getSubCategory(uint256 _id)
        external
        view
        returns (
            uint256 id,
            string memory name,
            uint256 parentCategoryId,
            bool isActive
        )
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

    // --- Product Getters ---
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

    function getProductsByCategory(string memory categoryName) external view returns (ProductStruct[] memory) {
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
}