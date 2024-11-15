// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./HemShopBase.sol";

contract HemShopPurchase is HemShopBase {
    constructor(uint256 _pct) HemShopBase(_pct) {}

    function buyProduct(
        uint256 productId,
        ShippingDetails calldata shippingDetails,
        string calldata selectedColor,
        string calldata selectedSize,
        uint256 quantity
    ) external payable nonReentrant {
        require(productExists[productId], 'Product not found');
        ProductStruct storage product = products[productId];
        require(!product.deleted, 'Product has been deleted');
        require(product.stock >= quantity, 'Insufficient stock');
        require(msg.value >= product.price * quantity, 'Insufficient payment');

        product.stock -= quantity;
        if (product.stock == 0) {
            product.soldout = true;
        }

        _recordPurchase(
            productId,
            msg.sender,
            product.seller,
            msg.value,
            product.price * quantity,
            shippingDetails,
            selectedColor,
            selectedSize,
            quantity
        );

        emit ProductPurchased(productId, msg.sender, product.seller, msg.value, block.timestamp);
    }

    function _recordPurchase(
        uint256 productId,
        address buyer,
        address seller,
        uint256 totalAmount,
        uint256 basePrice,
        ShippingDetails memory shippingDetails,
        string memory selectedColor,
        string memory selectedSize,
        uint256 quantity
    ) internal {
        ProductStruct storage product = products[productId];

        OrderDetails memory orderDetails = OrderDetails({
            name: product.name,
            images: product.images,
            selectedColor: selectedColor,
            selectedSize: selectedSize,
            quantity: quantity,
            category: product.category,
            description: product.description
        });

        PurchaseHistoryStruct memory purchase = PurchaseHistoryStruct({
            productId: productId,
            totalAmount: totalAmount,
            basePrice: basePrice,
            timestamp: block.timestamp,
            lastUpdated: block.timestamp,
            buyer: buyer,
            seller: seller,
            isDelivered: false,
            shippingDetails: shippingDetails,
            orderDetails: orderDetails
        });

        buyerPurchaseHistory[buyer].push(purchase);
        sellerPurchaseHistory[seller].push(purchase);
        sellerBalances[seller] += totalAmount;

        emit PurchaseRecorded(productId, buyer, seller, totalAmount, basePrice, block.timestamp);
    }

    function withdraw() external nonReentrant {
        require(registeredSellers[msg.sender], 'Must be a registered seller');
        uint256 balance = sellerBalances[msg.sender];
        require(balance > 0, 'No balance to withdraw');

        uint256 serviceFee = (balance * servicePct) / 100;
        uint256 sellerAmount = balance - serviceFee;

        sellerBalances[msg.sender] = 0;
        emit BalanceUpdated(msg.sender, 0);

        payTo(owner(), serviceFee);
        payTo(msg.sender, sellerAmount);
    }

    function getSellerBalance(address seller) external view returns (uint256) {
        return sellerBalances[seller];
    }

    function getBuyerPurchaseHistory(address buyer) external view returns (PurchaseHistoryStruct[] memory) {
        return buyerPurchaseHistory[buyer];
    }

    function getSellerPurchaseHistory(address seller) external view returns (PurchaseHistoryStruct[] memory) {
        return sellerPurchaseHistory[seller];
    }

    function markPurchaseDelivered(uint256 productId, address buyer) external onlyVerifiedSellerOrOwner {
        bool found = false;

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
}