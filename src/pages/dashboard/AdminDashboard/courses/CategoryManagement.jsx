import React, { useState } from 'react';
import { Edit, Delete, Add, Save, Cancel } from '@mui/icons-material';
import { coursesAPI } from '../../../../config';
import './CategoryManagement.css';

const CategoryManagement = ({ categories, onClose }) => {
  const [categoryList, setCategoryList] = useState(categories);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEdit = (category) => {
    if (!category.id) {
      setError('Cannot edit category: Missing ID');
      return;
    }
    setEditingCategory({ ...category, originalName: category.name });
  };

  const handleSaveEdit = async () => {
    if (!editingCategory?.name?.trim()) {
      setError('Category name cannot be empty');
      return;
    }
    if (!editingCategory?.id) {
      setError('Cannot update category: Missing ID');
      console.error('Missing category ID for editing:', editingCategory);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await coursesAPI.updateCategory(editingCategory.id, { name: editingCategory.name });
      setCategoryList(categoryList.map(cat => 
        cat.id === editingCategory.id ? { ...cat, name: editingCategory.name } : cat
      ));
      setEditingCategory(null);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to update category';
      setError(errorMsg);
      console.error('Error updating category:', err, 'Category data:', editingCategory);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setError(null);
  };

  const handleDelete = async (categoryId) => {
    if (!categoryId) {
      setError('Cannot delete category: Missing ID');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await coursesAPI.deleteCategory(categoryId);
      setCategoryList(categoryList.filter(cat => cat.id !== categoryId));
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to delete category';
      setError(errorMsg);
      console.error('Error deleting category:', err, 'Category ID:', categoryId);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Category name cannot be empty');
      return;
    }
    if (categoryList.some(cat => cat.name.toLowerCase() === newCategoryName.toLowerCase())) {
      setError('Category name already exists');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await coursesAPI.createCategory({ name: newCategoryName });
      setCategoryList([...categoryList, { 
        id: response.data.id, 
        name: newCategoryName, 
        count: response.data.course_count || 0 
      }]);
      setNewCategoryName('');
      setIsAdding(false);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to create category';
      setError(errorMsg);
      console.error('Error creating category:', err, 'Category name:', newCategoryName);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="CategoryManagement">
      <div className="CategoryManagement-Header">
        <h2>Manage Categories</h2>
        <button className="Close-Button" onClick={onClose} disabled={loading}>
          <Cancel /> Close
        </button>
      </div>
      
      <div className="CategoryManagement-Content">
        {error && <div className="Error">{error}</div>}
        {loading && <div className="Loading">Loading...</div>}
        
        <div className="Add-Category-Section">
          <button 
            className="Add-Category-Button" 
            onClick={() => setIsAdding(!isAdding)}
            disabled={loading}
          >
            <Add /> {isAdding ? 'Cancel' : 'Add New Category'}
          </button>
          
          {isAdding && (
            <div className="Add-Category-Form">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
                className="Category-Input"
                disabled={loading}
              />
              <button 
                className="Save-Category-Button"
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim() || loading}
              >
                <Save /> Save
              </button>
            </div>
          )}
        </div>

        <div className="Categories-Table">
          <div className="Table-Header">
            <span>Category Name</span>
            <span>Course Count</span>
            <span>Actions</span>
          </div>
          
          {categoryList.map((category) => (
            <div key={category.id} className="Table-Row">
              {editingCategory?.id === category.id ? (
                <>
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="Category-Input"
                    disabled={loading}
                  />
                  <span>{category.count}</span>
                  <div className="Actions">
                    <button 
                      className="Save-Button" 
                      onClick={handleSaveEdit}
                      disabled={!editingCategory.name.trim() || loading}
                    >
                      <Save /> Save
                    </button>
                    <button 
                      className="Cancel-Button" 
                      onClick={handleCancelEdit}
                      disabled={loading}
                    >
                      <Cancel /> Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span>{category.name}</span>
                  <span>{category.count}</span>
                  <div className="Actions">
                    <button 
                      className="Edit-Button" 
                      onClick={() => handleEdit(category)}
                      disabled={loading}
                    >
                      <Edit /> Edit
                    </button>
                    <button 
                      className="Delete-Button" 
                      onClick={() => handleDelete(category.id)}
                      disabled={loading}
                    >
                      <Delete /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;