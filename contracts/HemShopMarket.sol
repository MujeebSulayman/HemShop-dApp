// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./HemShopBase.sol";

contract HemShopMarket is HemShopBase {
    // Structs
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

    // Mappings
    mapping(uint256 => ProductStruct) public products;
    mapping(address => uint256[]) public sellerProducts;
    mapping(uint256 => bool) public productExists;
    mapping(uint256 => bool) public reviewExists;
    mapping(address => PurchaseHistoryStruct[]) public buyerPurchaseHistory;
    mapping(address => PurchaseHistoryStruct[]) public sellerPurchaseHistory;

    // Events
    event ProductPurchased(
        uint256 indexed productId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 timestamp
    );
    event PurchaseRecorded(
        uint256 indexed productId,
        address indexed buyer,
        address indexed seller,
        uint256 totalAmount,
        uint256 basePrice,
        uint256 timestamp
    );
    event DeliveryStatusUpdated(uint256 indexed productId, address indexed buyer, bool isDelivered);

    constructor(uint256 _pct) HemShopBase(_pct) {}

    // Include all product-related functions from the original contract
    // (createProduct, updateProduct, deleteProduct, getProduct, etc.)
    // Include all review-related functions
    // Include all purchase-related functions
} 