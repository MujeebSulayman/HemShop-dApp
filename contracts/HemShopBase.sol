// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

contract HemShopBase is Ownable, ReentrancyGuard, ERC721 {
    using Counters for Counters.Counter;

    // Counters
    Counters.Counter internal _TotalProducts;
    Counters.Counter internal _TotalSales;
    Counters.Counter internal _TotalReviews;
    uint256 internal _categoryCounter;
    uint256 internal _subCategoryCounter;

    uint256 public servicePct;

    // Lists
    address[] internal registeredSellersList;
    address[] public usersList;

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

    struct UserProfile {
        string name;
        string email;
        string avatar;
        uint256 registeredAt;
        bool isActive;
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

    // Mappings
    mapping(address => UserProfile) public userProfiles;
    mapping(address => SellerProfile) public sellerProfiles;
    mapping(address => SellerStatus) public sellerStatus;
    mapping(address => bool) public registeredSellers;
    mapping(address => bool) public registeredUsers;

    mapping(uint256 => ProductStruct) public products;
    mapping(address => uint256[]) public sellerProducts;
    mapping(uint256 => bool) public productExists;

    mapping(uint256 => Category) internal categories;
    mapping(uint256 => SubCategory) internal subCategories;

    mapping(address => uint256) public sellerBalances;
    mapping(address => PurchaseHistoryStruct[]) public buyerPurchaseHistory;
    mapping(address => PurchaseHistoryStruct[]) public sellerPurchaseHistory;

    mapping(uint256 => bool) public reviewExists;
    mapping(address => address) public adminImpersonating;

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
    event UserRegistered(address indexed user, string name);

    // Modifiers
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

    constructor(uint256 _pct) ERC721('HemShop', 'Hsp') {
        servicePct = _pct;
    }

    // Internal helper functions
    function payTo(address to, uint256 amount) internal {
        require(to != address(0), 'Invalid address');
        (bool success, ) = payable(to).call{value: amount}('');
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

    function changeServicePct(uint256 newPct) external onlyOwner {
        require(newPct >= 0 && newPct <= 100, 'Invalid percentage');
        servicePct = newPct;
    }
}