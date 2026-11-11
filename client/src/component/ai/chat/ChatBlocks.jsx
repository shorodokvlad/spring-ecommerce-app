import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Loader2, ShoppingBag, Star } from "lucide-react";
import ApiService from "../../../service/ApiService";
import { useCart } from "../../context/CartContext";
import { configureProduct, getProductPath } from "../../../utils/productVariant";

export const formatPrice = (value) => {
    if (value == null || value === "") return null;
    const number = Number(value);
    if (Number.isNaN(number)) return null;
    return `€${number % 1 === 0 ? number.toFixed(0) : number.toFixed(2)}`;
};

const StockNote = ({ inStock }) => {
    if (inStock == null) return null;
    return (
        <span className={`chat-stock ${inStock ? "chat-stock--in" : "chat-stock--out"}`}>
            {inStock ? "In stock" : "Out of stock"}
        </span>
    );
};

const ProductThumb = ({ src, alt }) =>
    src ? (
        <img className="chat-thumb" src={src} alt={alt} loading="lazy" />
    ) : (
        <span className="chat-thumb chat-thumb--empty" aria-hidden="true">
            <ShoppingBag size={18} />
        </span>
    );

/** Product cards from search, details or "similar" results. Links open the product page. */
export const ProductCards = ({ items, onNavigate }) => (
    <ul className="chat-products" aria-label="Products">
        {items.map((p) => (
            <li key={p.id}>
                <Link to={getProductPath({ id: p.id, name: p.name })} className="chat-product" onClick={onNavigate}>
                    <ProductThumb src={p.image_url} alt="" />
                    <span className="chat-product-body">
                        <span className="chat-product-name">{p.name}</span>
                        <span className="chat-product-meta">
                            {formatPrice(p.price) && <strong>{formatPrice(p.price)}</strong>}
                            {p.review_count > 0 && p.average_rating != null && (
                                <span className="chat-rating">
                                    <Star size={11} aria-hidden="true" /> {Number(p.average_rating).toFixed(1)}
                                </span>
                            )}
                        </span>
                        <StockNote inStock={p.in_stock} />
                    </span>
                </Link>
            </li>
        ))}
    </ul>
);

/** Side-by-side specs. The first column stays visible while the table scrolls sideways. */
export const ComparisonTable = ({ products = [], rows = [], onNavigate }) => (
    <div className="chat-compare" role="region" aria-label="Product comparison" tabIndex={0}>
        <table>
            <thead>
                <tr>
                    <th scope="col"><span className="sr-only">Specification</span></th>
                    {products.map((p) => (
                        <th scope="col" key={p.id}>
                            <Link to={getProductPath({ id: p.id, name: p.name })} onClick={onNavigate}>
                                {p.name}
                            </Link>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => (
                    <tr key={row.label}>
                        <th scope="row">{row.label}</th>
                        {row.values.map((value, i) => (
                            <td key={i}>{value}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

/**
 * "Add to cart" suggested by the assistant. Nothing is added until the shopper presses
 * the button; the product is re-read so the cart gets the current price and stock.
 */
export const CartAction = ({ product, variant, quantity = 1 }) => {
    const { dispatch } = useCart();
    const [state, setState] = useState("idle"); // idle | adding | added | error
    const [message, setMessage] = useState(null);

    const add = async () => {
        setState("adding");
        setMessage(null);
        try {
            const response = await ApiService.getProductById(product.id);
            const fresh = response.product;
            const chosen = variant ? (fresh.variants || []).find((v) => v.id === variant.id) : null;
            if (variant && !chosen) throw new Error("That option is no longer available.");
            const item = configureProduct(fresh, chosen);
            if (item.stockQuantity === 0) throw new Error("It's out of stock now.");
            for (let i = 0; i < quantity; i++) dispatch({ type: "ADD_ITEM", payload: item });
            setState("added");
        } catch (err) {
            setState("error");
            setMessage(err.message && !err.response ? err.message : "Couldn't add it. Please try again.");
        }
    };

    const price = formatPrice(variant?.price ?? product.price);
    // "Black / 256GB" reads better than a title that repeats the product name.
    const optionLabel = variant
        ? Object.values(variant.attributes || {}).filter(Boolean).join(" / ") || variant.title
        : null;
    return (
        <div className="chat-cart">
            <ProductThumb src={product.image_url} alt="" />
            <div className="chat-cart-body">
                <span className="chat-product-name">{product.name}</span>
                <span className="chat-cart-meta">
                    {optionLabel && <span>{optionLabel}</span>}
                    {quantity > 1 && <span>× {quantity}</span>}
                    {price && <strong>{price}</strong>}
                </span>
                {message && <span className="chat-cart-error" role="alert">{message}</span>}
            </div>
            {state === "added" ? (
                <Link to="/cart" className="chat-cart-btn chat-cart-btn--done">
                    <Check size={15} aria-hidden="true" /> View cart
                </Link>
            ) : (
                <button type="button" className="chat-cart-btn" onClick={add} disabled={state === "adding"}>
                    {state === "adding" ? <Loader2 size={15} className="ai-spin" aria-hidden="true" /> : <ShoppingBag size={15} aria-hidden="true" />}
                    Add to cart
                </button>
            )}
        </div>
    );
};
