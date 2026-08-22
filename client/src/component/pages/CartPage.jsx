import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ApiService from "../../service/ApiService";
import { useCart } from "../context/CartContext";
import { getProductPath } from "../../utils/productVariant";
import '../../style/cart.css'

const CartPage = () => {
    const { cart, dispatch } = useCart();
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const incrementItem = (product) => {
        dispatch({ type: 'INCREMENT_ITEM', payload: product });
    }

    const decrementItem = (product) => {
        const cartItem = cart.find(item => (item.cartKey || String(item.id)) === (product.cartKey || String(product.id)));
        if (cartItem && cartItem.quantity > 1) {
            dispatch({ type: 'DECREMENT_ITEM', payload: product });
        } else {
            dispatch({ type: 'REMOVE_ITEM', payload: product });
        }
    }

    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    const handleCheckout = async () => {
        if (!ApiService.isAuthenticated()) {
            setMessage("Sign in to place your order");
            setTimeout(() => {
                setMessage('')
                navigate("/login")
            }, 1500);
            return;
        }

        const orderItems = cart.map(item => ({
            productId: item.id,
            variantId: item.variantId || null,
            quantity: item.quantity
        }));

        const orderRequest = {
            totalPrice,
            items: orderItems,
        }

        try {
            const response = await ApiService.createOrder(orderRequest);
            setMessage(response.message)

            setTimeout(() => {
                setMessage('')
            }, 5000);

            if (response.status === 200) {
                dispatch({ type: 'CLEAR_CART' })
            }

        } catch (error) {
            setMessage(error.response?.data?.message || error.message || 'Failed to place the order');
            setTimeout(() => {
                setMessage('')
            }, 4000);
        }
    };

    return (
        <div className="cart-page">
            <h1>Cart</h1>
            {message && <p className="response-message">{message}</p>}

            {cart.length === 0 ? (
                <div className="cart-empty" style={{ textAlign: "center", padding: "48px 0" }}>
                    <h3 style={{ margin: "0 0 8px", color: "var(--ink)", fontSize: "1.3rem", fontWeight: 700 }}>Your cart is empty</h3>
                    <p style={{ margin: "0 0 24px", color: "var(--muted)", fontSize: "0.95rem" }}>Explore our catalog to find your favorite products and place your order.</p>
                    <Link to="/" className="btn-primary" style={{ padding: "10px 24px", borderRadius: "10px", background: "var(--ink)", color: "#ffffff", textDecoration: "none" }}>
                        Browse the Catalogue
                    </Link>
                </div>
            ) : (
                <div className="cart-layout">
                    <ul className="cart-items">
                        {cart.map(item => {
                            const productUrl = item.productUrl || getProductPath(item);
                            return (
                                <li key={item.cartKey || item.id} className="cart-item">
                                    <Link to={productUrl} className="cart-item-image-link" title={item.name}>
                                        <img src={item.imageUrl} alt={item.name} />
                                    </Link>
                                    <div className="cart-item-info">
                                        <h2>
                                            <Link to={productUrl} className="cart-item-title-link">
                                                {item.name}
                                            </Link>
                                        </h2>
                                        {item.variantTitle && <p className="cart-item-variant">{item.variantTitle}</p>}
                                    <div className="cart-item-row">
                                        <div className="quantity-controls">
                                            <button onClick={()=> decrementItem(item)} aria-label={`Remove one ${item.name}`}>−</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={()=> incrementItem(item)}
                                                disabled={item.stockQuantity != null && item.quantity >= item.stockQuantity}
                                                aria-label={`Add one ${item.name}`}>+</button>
                                        </div>
                                        <span className="price-ticket">€{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            </li>
                        );
                        })}
                    </ul>
                    <aside className="cart-summary">
                        <h2>Summary</h2>
                        <div className="cart-summary-row">
                            <span>{(() => { const n = cart.reduce((sum, item) => sum + item.quantity, 0); return `${n} ${n === 1 ? 'item' : 'items'}`; })()}</span>
                            <span className="price-ticket price-ticket-lg">€{totalPrice.toFixed(2)}</span>
                        </div>
                        <button className="checkout-button" onClick={handleCheckout}>Place order</button>
                    </aside>
                </div>
            )}
        </div>
    )
}

export default CartPage;
