// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./HemShopBase.sol";

contract HemShopCategory is HemShopBase {
    constructor(uint256 _pct) HemShopBase(_pct) {}

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

    function createSubCategoriesBulk(uint256 parentId, string[] calldata names) external {
        require(categories[parentId].isActive, 'Parent category not active');

        for (uint i = 0; i < names.length; i++) {
            _subCategoryCounter++;

            SubCategory memory newSubCategory = SubCategory({
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

    function getCategory(
        uint256 _id
    ) external view returns (uint256 id, string memory name, bool isActive, uint256[] memory subCategoryIds) {
        Category memory category = categories[_id];
        require(category.id != 0, 'Category does not exist');

        return (category.id, category.name, category.isActive, category.subCategoryIds);
    }

    function getSubCategory(
        uint256 _id
    ) external view returns (uint256 id, string memory name, uint256 parentCategoryId, bool isActive) {
        SubCategory memory subCategory = subCategories[_id];
        require(subCategory.id != 0, 'Subcategory does not exist');

        return (subCategory.id, subCategory.name, subCategory.parentCategoryId, subCategory.isActive);
    }

    function getAllCategories() external view returns (
        uint256[] memory ids,
        string[] memory names,
        bool[] memory activeStates,
        uint256[][] memory subCategoryIdArrays
    ) {
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
}