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

  uint256 public servicePct;

  struct Review {
    address reviewer;
    uint256 rating;
    string comment;
  }

  struct Specification {
    uint256 SKU;
    uint256 weight;
    string model;
    string brand;
  }

  struct Product {
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
    Specification specs;
    bool sold;
    bool wishlist;
    bool isActive;
    Review[] reviews;
  }

  mapping(uint256 => Product) public products;
  mapping(address => uint256[]) public sellerProducts;

  enum SellerStatus {
    Unverified,
    Pending,
    Verified,
    Suspended
  }

  struct PurchaseHistory {
    uint256 productId;
    uint256 price;
    uint256 timestamp;
    address buyer;
    address seller;
    bool isDelivered;
  }

  mapping(address => uint256) public sellerBalances;
  mapping(address => SellerStatus) public sellerStatus;
  mapping(address => PurchaseHistory[]) public buyerPurchaseHistory;
  mapping(address => PurchaseHistory[]) public sellerPurchaseHistory;
  mapping(address => bool) public registeredSellers;

  event SellerRegistered(address indexed seller, uint256 timestamp);
  event SellerStatusUpdated(address indexed seller, SellerStatus status);
  event BalanceUpdated(address indexed seller, uint256 newBalance);
  event PurchaseRecorded(
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

  function createProduct(
    string memory name,
    string memory description,
    uint256 price,
    uint256 stock,
    string memory color,
    string memory size,
    string[] memory images,
    string memory category,
    Specification memory specs
  ) public onlyVerifiedSeller {
    require(bytes(name).length > 0, 'Name cannot be empty');
    require(bytes(description).length > 0, 'Description cannot be empty');
    require(price > 0, 'Price must be greater than 0');
    require(stock > 0, 'Stock must be greater than 0');
    require(bytes(color).length > 0, 'Color cannot be empty');
    require(bytes(size).length > 0, 'Size cannot be empty');
    require(bytes(category).length > 0, 'Category cannot be empty');
  }

  function registerSeller() external {
    require(!registeredSellers[msg.sender], 'Already registered');
    registeredSellers[msg.sender] = true;
    sellerStatus[msg.sender] = SellerStatus.Pending;
    emit SellerRegistered(msg.sender, block.timestamp);
  }

  function updateSellerStatus(address seller, SellerStatus status) external onlyOwner {
    require(registeredSellers[seller], 'Seller not registered');
    sellerStatus[seller] = status;
    emit SellerStatusUpdated(seller, status);
  }

  function _recordPurchase(
    uint256 productId,
    address buyer,
    address seller,
    uint256 price
  ) internal {
    PurchaseHistory memory purchase = PurchaseHistory({
      productId: productId,
      price: price,
      timestamp: block.timestamp,
      buyer: buyer,
      seller: seller,
      isDelivered: false
    });

    buyerPurchaseHistory[buyer].push(purchase);
    sellerPurchaseHistory[seller].push(purchase);

    // Update seller balance
    sellerBalances[seller] += price;

    emit PurchaseRecorded(productId, buyer, seller, price, block.timestamp);
  }

  function withdrawBalance() external nonReentrant {
    uint256 balance = sellerBalances[msg.sender];
    require(balance > 0, 'No balance to withdraw');

    sellerBalances[msg.sender] = 0;

    (bool success, ) = payable(msg.sender).call{ value: balance }('');
    require(success, 'Transfer failed');

    emit BalanceUpdated(msg.sender, 0);
  }

  function getSellerBalance(address seller) external view returns (uint256) {
    return sellerBalances[seller];
  }

  function getBuyerPurchaseHistory(address buyer) external view returns (PurchaseHistory[] memory) {
    return buyerPurchaseHistory[buyer];
  }

  function getSellerPurchaseHistory(
    address seller
  ) external view returns (PurchaseHistory[] memory) {
    return sellerPurchaseHistory[seller];
  }
}
