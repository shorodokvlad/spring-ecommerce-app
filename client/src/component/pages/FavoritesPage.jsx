import React from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import { useCart } from "../context/CartContext";
import StockBadge from "../common/StockBadge";
import "../../style/productList.css";
import { getProductPath } from "../../utils/productVariant";

const FavoritesPage = () => {
    const { favorites, removeFromFavorites } = useFavorites();
    const { dispatch } = useCart();

    const addToCart = (product) => {
        dispatch({ type: "ADD_ITEM", payload: product });
    };

    return (
        <div className="category-list">
            <h2>My Favorites</h2>

            {favorites.length === 0 ? (
                <div className="favorites-empty" style={{ textAlign: "center", padding: "48px 0" }}>
                    <h3 style={{ margin: "0 0 8px", color: "var(--ink)", fontSize: "1.3rem", fontWeight: 700 }}>You haven't saved any favorite products yet</h3>
                    <p style={{ margin: "0 0 24px", color: "var(--muted)", fontSize: "0.95rem" }}>Explore our catalog and save your favorite items here.</p>
                    <Link to="/categories" className="btn-primary" style={{ padding: "10px 24px", borderRadius: "10px", background: "var(--ink)", color: "#ffffff", textDecoration: "none" }}>
                        Browse Categories
                    </Link>
                </div>
            ) : (
                <div className="product-list">
                    {favorites.map((product) => {
                        const outOfStock = product.stockQuantity === 0;

                        return (
                            <article className="product-item" key={product.favoriteKey || product.id} style={{ position: "relative" }}>
                                <button
                                    onClick={() => removeFromFavorites(product.favoriteKey || product.id)}
                                    title="Remove from favorites"
                                    style={{
                                        position: "absolute",
                                        top: "12px",
                                        right: "12px",
                                        background: "rgba(255, 255, 255, 0.9)",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "50%",
                                        width: "32px",
                                        height: "32px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        zIndex: 2
                                    }}
                                >
                                    <img src="/favorite.svg" alt="Remove favorite" style={{ width: "16px", height: "16px" }} />
                                </button>

                                <Link to={product.productUrl || getProductPath(product)} className="product-link">
                                    <div className="product-media">
                                        <img src={product.imageUrl} alt={product.name} className="product-image" />
                                    </div>
                                    <div className="product-body">
                                        <h3>{product.name}</h3>
                                        {product.variantTitle && <p className="product-variant-title">{product.variantTitle}</p>}
                                        <div className="product-meta">
                                            <span className="price-ticket">€{(product.price || 0).toFixed(2)}</span>
                                            <StockBadge stockQuantity={product.stockQuantity} />
                                        </div>
                                    </div>
                                </Link>

                                <button className="add-to-cart" onClick={() => addToCart(product)} disabled={outOfStock}>
                                    {outOfStock ? "Out of stock" : "Add to cart"}
                                </button>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FavoritesPage;
