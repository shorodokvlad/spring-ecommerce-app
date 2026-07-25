import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import '../../style/categoryListPage.css'

const CategoryListPage = () => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);




    const fetchCategories = async () => {
        try {
            const response = await ApiService.getAllCategory();
            setCategories(response.categoryList || [])

        } catch (err) {

            setError(err.response?.data?.message || err.message || 'Unable to fetch categories')

        }
    }

    const handleCategoryClick = (categoryId) => {
        navigate(`/category/${categoryId}`);
    } 

    return (
        <div className="category-list">
            {error ? (
                <p className="error-message">{error}</p>
            ) : (
                <div>
                    <h2>Explore Categories</h2>
                    <div className="category-grid">
                        {categories.map((category) => (
                            <div 
                                className="category-card" 
                                key={category.id}
                                onClick={() => handleCategoryClick(category.id)}
                            >
                                <div className="category-image-wrap">
                                    {category.imageUrl ? (
                                        <img src={category.imageUrl} alt={category.name} className="category-image" />
                                    ) : (
                                        <div className="category-placeholder-img">
                                            <span>{category.name.substring(0, 2).toUpperCase()}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="category-info">
                                    <h3>{category.name}</h3>
                                    <span className="category-cta">Browse →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryListPage;