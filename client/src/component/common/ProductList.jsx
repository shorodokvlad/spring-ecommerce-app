import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import StockBadge from "./StockBadge";
import AddToCartModal from "./AddToCartModal";
import '../../style/productList.css';

const ProductList = ({ products }) => {
    const { dispatch } = useCart();
    const { isFavorite, toggleFavorite } = useFavorites();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddToCart = (product) => {
        dispatch({ type: 'ADD_ITEM', payload: product });
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    return (
        <div className="product-list">
            {products.map((product) => {
                const outOfStock = product.stockQuantity === 0;
                const favorited = isFavorite(product.id);

                return (
                    <article className="product-item" key={product.id} style={{ position: "relative" }}>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleFavorite(product);
                            }}
                            title={favorited ? "Remove from favorites" : "Add to favorites"}
                            style={{
                                position: "absolute",
                                top: "12px",
                                right: "12px",
                                background: favorited ? "#fee2e2" : "rgba(255, 255, 255, 0.9)",
                                border: favorited ? "1px solid #f87171" : "1px solid #e2e8f0",
                                borderRadius: "50%",
                                width: "34px",
                                height: "34px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 2,
                                transition: "all 150ms ease"
                            }}
                        >
                            <img src="/favorite.svg" alt="Favorite" style={{ width: "18px", height: "18px", opacity: favorited ? 1 : 0.6 }} />
                        </button>

                        <Link to={`/product/${product.id}`} className="product-link">
                            <div className="product-media">
                                <img src={product.imageUrl} alt={product.name} className="product-image" />
                            </div>
                            <div className="product-body">
                                <h3>{product.name}</h3>
                                <div className="product-meta">
                                    <span className="price-ticket">€{(product.price || 0).toFixed(2)}</span>
                                    <StockBadge stockQuantity={product.stockQuantity} />
                                </div>
                            </div>
                        </Link>

                        <button className="add-to-cart" onClick={() => handleAddToCart(product)} disabled={outOfStock}>
                            {outOfStock ? 'Out of stock' : 'Add to cart'}
                        </button>
                    </article>
                );
            })}

            {/* Added to Cart Popup Modal */}
            <AddToCartModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
                price={selectedProduct?.price}
                imageUrl={selectedProduct?.imageUrl}
            />
        </div>
    );
};

export default ProductList;
