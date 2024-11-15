// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./HemShopBase.sol";

contract HemShopUser is HemShopBase {
    constructor(uint256 _pct) HemShopBase(_pct) {}

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

    function getSeller(
        address seller
    ) external view returns (
        SellerProfile memory profile,
        SellerStatus status,
        uint256 balance,
        uint256[] memory productIds
    ) {
        require(registeredSellers[seller], 'Seller not registered');

        profile = sellerProfiles[seller];
        status = sellerStatus[seller];
        balance = sellerBalances[seller];
        productIds = sellerProducts[seller];

        return (profile, status, balance, productIds);
    }

    function getUser(
        address user
    ) external view returns (
        bool isRegistered,
        UserProfile memory profile,
        bool isUserSeller,
        SellerStatus sellerState
    ) {
        isRegistered = registeredUsers[user];
        profile = userProfiles[user];
        isUserSeller = registeredSellers[user];
        sellerState = isUserSeller ? sellerStatus[user] : SellerStatus.Unverified;

        return (isRegistered, profile, isUserSeller, sellerState);
    }

    function getAllRegisteredSellers() external view returns (address[] memory) {
        return registeredSellersList;
    }

    function updateSellerStatus(address seller, SellerStatus newStatus) external onlyOwner {
        require(registeredSellers[seller], 'Seller not registered');
        require(newStatus != SellerStatus.Unverified, 'Cannot set status to Unverified');
        require(sellerStatus[seller] != newStatus, 'Seller already has this status');

        sellerStatus[seller] = newStatus;
        emit SellerStatusUpdated(seller, newStatus);
    }

    function impersonateAccount(address account) external onlyOwner {
        require(account != address(0), 'Invalid account address');
        adminImpersonating[msg.sender] = account;
        emit AdminImpersonationChanged(msg.sender, account);
    }

    function stopImpersonating() external onlyOwner {
        adminImpersonating[msg.sender] = address(0);
        emit AdminImpersonationChanged(msg.sender, address(0));
    }
}