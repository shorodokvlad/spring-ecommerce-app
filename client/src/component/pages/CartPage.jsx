import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ApiService from "../../service/ApiService";
import { useCart } from "../context/CartContext";
import '../../style/cart.css'

const CartPage = () => {
    const { cart, dispatch } = useCart();
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();


    const incrementItem = (product) => {
        dispatch({ type: 'INCREMENT_ITEM', payload: product });
    }

    const decrementItem = (product) => {

        const cartItem = cart.find(item => item.id === product.id);
        if (cartItem && cartItem.quantity > 1) {
            dispatch({ type: 'DECREMENT_ITEM', payload: product });
        } else {
            dispatch({ type: 'REMOVE_ITEM', payload: product });
        }
    }

    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);



    const handleCheckout = async () => {
        if (!ApiService.isAuthenticated()) {
            setMessage("Log in to place your order");
            setTimeout(() => {
                setMessage('')
                navigate("/login")
            }, 1500);
            return;
        }

        const orderItems = cart.map(item => ({
            productId: item.id,
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
                <div className="cart-empty">
                    <p>Your cart is empty.</p>
                    <Link to="/" className="btn-primary">Browse the catalogue</Link>
                </div>
            ) : (
                <div className="cart-layout">
                    <ul className="cart-items">
                        {cart.map(item => (
                            <li key={item.id} className="cart-item">
                                <img src={item.imageUrl} alt={item.name} />
                                <div className="cart-item-info">
                                    <h2>{item.name}</h2>
                                    <p className="cart-item-desc">{item.description}</p>
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
                        ))}
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
