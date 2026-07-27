import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import StockBadge from "./StockBadge";
import '../../style/productList.css';


const ProductList = ({products}) => {
    const {cart, dispatch} = useCart();
    const { isFavorite, toggleFavorite } = useFavorites();

    const addToCart = (product) => {
        dispatch({type: 'ADD_ITEM', payload: product});
    }

    const incrementItem = (product) => {
        dispatch({type: 'INCREMENT_ITEM', payload: product});
    }

    const decrementItem = (product) => {

        const cartItem = cart.find(item => item.id === product.id);
        if (cartItem && cartItem.quantity > 1) {
            dispatch({type: 'DECREMENT_ITEM', payload: product});
        }else{
            dispatch({type: 'REMOVE_ITEM', payload: product});
        }
    }


    return(
        <div className="product-list">
                {products.map((product) => {
                    const cartItem = cart.find(item => item.id === product.id);
                    const outOfStock = product.stockQuantity === 0;
                    const atStockLimit = product.stockQuantity != null
                        && cartItem && cartItem.quantity >= product.stockQuantity;
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
                                    <p className="product-desc">{product.description}</p>
                                    <div className="product-meta">
                                        <span className="price-ticket">€{(product.price || 0).toFixed(2)}</span>
                                        <StockBadge stockQuantity={product.stockQuantity} />
                                    </div>
                                </div>
                            </Link>
                            {cartItem ? (
                                <div className="quantity-controls">
                                    <button onClick={()=> decrementItem(product)} aria-label={`Remove one ${product.name}`}>−</button>
                                    <span>{cartItem.quantity}</span>
                                    <button onClick={()=> incrementItem(product)}
                                        disabled={atStockLimit}
                                        aria-label={`Add one ${product.name}`}>+</button>
                                </div>
                            ):(
                                <button className="add-to-cart" onClick={()=> addToCart(product)} disabled={outOfStock}>
                                    {outOfStock ? 'Out of stock' : 'Add to cart'}
                                </button>
                            )}
                        </article>
                    )
                })}
        </div>
    )
};

export default ProductList;
