// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

contract HemShopBase is Ownable, ReentrancyGuard, ERC721 {
    using Counters for Counters.Counter;

    // --- State Variables ---
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

    struct UserProfile {
        string name;
        string email;
        string avatar;
        uint256 registeredAt;
        bool isActive;
    }

    // Mappings
    mapping(address => UserProfile) public userProfiles;
    mapping(address => SellerProfile) public sellerProfiles;
    mapping(address => SellerStatus) public sellerStatus;
    mapping(address => bool) public registeredSellers;
    mapping(address => bool) public registeredUsers;
    mapping(address => uint256) public sellerBalances;
    mapping(address => address) public adminImpersonating;

    // Events
    event UserRegistered(address indexed user, string name);
    event SellerRegistered(address indexed seller, uint256 timestamp);
    event SellerStatusUpdated(address indexed seller, SellerStatus status);
    event BalanceUpdated(address indexed seller, uint256 newBalance);
    event AdminImpersonationChanged(address admin, address impersonatedAccount);

    constructor(uint256 _pct) ERC721('HemShop', 'Hsp') {
        servicePct = _pct;
    }

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
        require(msg.sender != address(0), 'Invalid address');
        require(!registeredSellers[msg.sender], 'Already registered as seller');
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

        if (!isSellerInList(msg.sender)) {
            registeredSellersList.push(msg.sender);
        }

        emit SellerRegistered(msg.sender, block.timestamp);
        emit SellerStatusUpdated(msg.sender, SellerStatus.Pending);
    }

    function isSellerInList(address seller) internal view returns (bool) {
        for (uint i = 0; i < registeredSellersList.length; i++) {
            if (registeredSellersList[i] == seller) return true;
        }
        return false;
    }

    function getSellerProfile(address seller) external view returns (SellerProfile memory) {
        require(registeredSellers[seller], 'Seller not registered');
        return sellerProfiles[seller];
    }

    function getSellerStatus(address seller) external view returns (SellerStatus) {
        require(seller != address(0), 'Invalid seller address');
        if (seller == owner()) {
            return SellerStatus.Verified;
        }
        return sellerStatus[seller];
    }

    // Internal utility function
    function payTo(address to, uint256 amount) internal {
        require(to != address(0), 'Invalid address');
        (bool success, ) = payable(to).call{value: amount}('');
        require(success, 'Transfer failed');
    }
} 