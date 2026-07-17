import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import StockBadge from "./StockBadge";
import '../../style/productList.css';


const ProductList = ({products}) => {
    const {cart, dispatch} = useCart();

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
                    return (
                        <article className="product-item" key={product.id}>
                            <Link to={`/product/${product.id}`} className="product-link">
                                <div className="product-media">
                                    <img src={product.imageUrl} alt={product.name} className="product-image" />
                                </div>
                                <div className="product-body">
                                    <h3>{product.name}</h3>
                                    <p className="product-desc">{product.description}</p>
                                    <div className="product-meta">
                                        <span className="price-ticket">€{product.price.toFixed(2)}</span>
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
