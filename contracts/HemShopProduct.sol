// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./HemShopBase.sol";

contract HemShopProduct is HemShopBase {
    constructor(uint256 _pct) HemShopBase(_pct) {}

    function createProduct(ProductInput calldata input) external {
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

    function updateProduct(uint256 productId, ProductInput calldata input) external {
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
}