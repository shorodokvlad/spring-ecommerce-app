import React from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import ProductList from "../common/ProductList";
import "../../style/productList.css";

const FavoritesPage = () => {
    const { favorites } = useFavorites();

    return (
        <div className="category-list" style={{ maxWidth: "1440px", margin: "0 auto", padding: "20px 32px 40px" }}>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#1F4E63", marginBottom: "20px" }}>
                My Favorites ({favorites.length})
            </h2>

            {favorites.length === 0 ? (
                <div className="favorites-empty" style={{ textAlign: "center", padding: "64px 0" }}>
                    <h3 style={{ margin: "0 0 10px", color: "#1F4E63", fontSize: "1.3rem", fontWeight: 700 }}>
                        You haven't saved any favorite products yet
                    </h3>
                    <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: "0.95rem" }}>
                        Explore our catalog and save your favorite items here.
                    </p>
                    <Link 
                        to="/categories" 
                        style={{ 
                            padding: "12px 28px", 
                            borderRadius: "10px", 
                            background: "#1F4E63", 
                            color: "#ffffff", 
                            textDecoration: "none",
                            fontWeight: 700,
                            display: "inline-block"
                        }}
                    >
                        Browse Categories
                    </Link>
                </div>
            ) : (
                <ProductList products={favorites} />
            )}
        </div>
    );
};

export default FavoritesPage;
