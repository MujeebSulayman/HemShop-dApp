// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

interface IHemShop {
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
}
