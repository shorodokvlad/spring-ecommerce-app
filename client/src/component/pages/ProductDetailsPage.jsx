import React, {useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ApiService from "../../service/ApiService";
import StockBadge from "../common/StockBadge";
import '../../style/productDetailsPage.css';


const ProductDetailsPage = () => {

    const {productId} = useParams();
    const {cart, dispatch} = useCart();
    const [product, setProduct] = useState(null);

    useEffect(()=>{
        const fetchProduct = async () => {
            try {
                const response = await ApiService.getProductById(productId);
                setProduct(response.product);
            } catch (error) {
                console.log(error.message || error)
            }
        }
        fetchProduct();
    }, [productId])


    const addToCart = () => {
        if (product) {
            dispatch({type: 'ADD_ITEM', payload: product});
        }
    }

    const incrementItem = () => {
        if(product){
            dispatch({type: 'INCREMENT_ITEM', payload: product});
        }
    }

    const decrementItem = () => {
        if (product) {
            const cartItem = cart.find(item => item.id === product.id);
            if (cartItem && cartItem.quantity > 1) {
                dispatch({type: 'DECREMENT_ITEM', payload: product});
            }else{
                dispatch({type: 'REMOVE_ITEM', payload: product});
            }
        }
    }

    if (!product) {
        return <p className="loading-product-details">Loading product details…</p>
    }

    const cartItem = cart.find(item => item.id === product.id);
    const outOfStock = product.stockQuantity === 0;
    const atStockLimit = product.stockQuantity != null
        && cartItem && cartItem.quantity >= product.stockQuantity;

    return(
        <div className="product-detail">
            <div className="product-detail-media">
                <img src={product.imageUrl} alt={product.name} />
            </div>
            <div className="product-detail-info">
                {product.category?.name && <span className="product-eyebrow">{product.category.name}</span>}
                <h1>{product.name}</h1>
                <p className="product-detail-desc">{product.description}</p>
                <div className="product-detail-meta">
                    <span className="price-ticket price-ticket-lg">€{product.price.toFixed(2)}</span>
                    <StockBadge stockQuantity={product.stockQuantity} />
                </div>
                {cartItem ? (
                    <div className="quantity-controls">
                        <button onClick={decrementItem} aria-label="Remove one">−</button>
                        <span>{cartItem.quantity}</span>
                        <button onClick={incrementItem} disabled={atStockLimit} aria-label="Add one">+</button>
                    </div>
                ):(
                    <button className="add-to-cart" onClick={addToCart} disabled={outOfStock}>
                        {outOfStock ? 'Out of stock' : 'Add to cart'}
                    </button>
                )}
            </div>
        </div>
    )

}

export default ProductDetailsPage;
