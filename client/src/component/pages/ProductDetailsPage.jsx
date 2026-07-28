import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import StockBadge from "../common/StockBadge";
import ApiService from "../../service/ApiService";
import '../../style/productDetailsPage.css';

const getColorHex = (colorName) => {
    if (!colorName) return null;
    const lower = colorName.toLowerCase().trim();
    if (lower.includes("white")) return "#ffffff";
    if (lower.includes("black") || lower.includes("dark")) return "#1e293b";
    if (lower.includes("pink") || lower.includes("rose")) return "#f472b6";
    if (lower.includes("blue") || lower.includes("navy")) return "#3b82f6";
    if (lower.includes("red") || lower.includes("ruby")) return "#ef4444";
    if (lower.includes("green") || lower.includes("mint")) return "#10b981";
    if (lower.includes("yellow") || lower.includes("gold")) return "#eab308";
    if (lower.includes("purple") || lower.includes("violet")) return "#a855f7";
    if (lower.includes("titanium") || lower.includes("grey") || lower.includes("gray") || lower.includes("silver")) return "#94a3b8";
    return null;
};

const ProductDetailsPage = () => {
    const { productId } = useParams();
    const { cart, dispatch } = useCart();
    const { isFavorite, toggleFavorite } = useFavorites();
    const [product, setProduct] = useState(null);

    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await ApiService.getProductById(productId);
                const prod = response.product;
                setProduct(prod);

                if (prod.variants && prod.variants.length > 0) {
                    const urlParams = new URLSearchParams(window.location.search);
                    const targetVariantId = urlParams.get("variantId");

                    let targetIndex = 0;
                    if (targetVariantId) {
                        const foundIndex = prod.variants.findIndex(v => String(v.id) === String(targetVariantId));
                        if (foundIndex >= 0) {
                            targetIndex = foundIndex;
                        }
                    }

                    const targetVar = prod.variants[targetIndex] || prod.variants[0];
                    setSelectedVariantIndex(targetIndex);
                    if (targetVar.attributes) {
                        setSelectedAttributes({ ...targetVar.attributes });
                    }
                }
            } catch (error) {
                console.log(error.message || error);
            }
        };
        fetchProduct();
    }, [productId]);

    // Group all available custom attributes across variants dynamically
    const attributeGroups = useMemo(() => {
        if (!product || !product.variants || product.variants.length === 0) return {};

        const groups = {};
        product.variants.forEach((v) => {
            if (v.attributes) {
                Object.entries(v.attributes).forEach(([key, val]) => {
                    if (!groups[key]) groups[key] = [];
                    if (!groups[key].includes(val)) {
                        groups[key].push(val);
                    }
                });
            }
        });
        return groups;
    }, [product]);

    // Currently active variant based on selectedVariantIndex or matched attributes
    const activeVariant = useMemo(() => {
        if (!product || !product.variants || product.variants.length === 0) return null;

        const matched = product.variants.find((v) => {
            if (!v.attributes) return false;
            return Object.entries(selectedAttributes).every(
                ([attrKey, attrVal]) => v.attributes[attrKey] === attrVal
            );
        });

        return matched || product.variants[selectedVariantIndex] || product.variants[0];
    }, [product, selectedAttributes, selectedVariantIndex]);

    const handleSelectAttribute = (attrKey, attrVal) => {
        if (!product || !product.variants) return;
        if (checkOptionStock(attrKey, attrVal) === 0) return;

        const nextTargetAttrs = { ...selectedAttributes, [attrKey]: attrVal };

        // 1. Try finding exact match for nextTargetAttrs
        let bestMatch = product.variants.find((v) => {
            if (!v.attributes) return false;
            return Object.entries(nextTargetAttrs).every(
                ([k, val]) => v.attributes[k] === val
            );
        });

        // 2. If no exact match across all keys, find first variant matching this newly selected attrKey & attrVal
        if (!bestMatch) {
            bestMatch = product.variants.find((v) => {
                return v.attributes && v.attributes[attrKey] === attrVal;
            });
        }

        if (bestMatch) {
            const vIndex = product.variants.indexOf(bestMatch);
            setSelectedVariantIndex(vIndex >= 0 ? vIndex : 0);
            if (bestMatch.attributes) {
                setSelectedAttributes({ ...bestMatch.attributes });
            }
        } else {
            setSelectedAttributes(nextTargetAttrs);
        }
        setActiveImageIndex(0);
    };

    const handleSelectVariantCard = (vIndex) => {
        setSelectedVariantIndex(vIndex);
        if (product?.variants?.[vIndex]?.attributes) {
            setSelectedAttributes({ ...product.variants[vIndex].attributes });
        }
        setActiveImageIndex(0);
    };

    // Determine photos to show in gallery
    const currentImages = useMemo(() => {
        if (activeVariant && activeVariant.imageUrls && activeVariant.imageUrls.length > 0) {
            return activeVariant.imageUrls;
        }
        if (product && product.imageUrls && product.imageUrls.length > 0) {
            return product.imageUrls;
        }
        return product ? [product.imageUrl] : [];
    }, [product, activeVariant]);

    const activePrice = activeVariant?.price ?? product?.price ?? 0;
    const activeStock = activeVariant?.stockQuantity ?? product?.stockQuantity ?? 0;

    const cartItemKey = activeVariant ? `${product?.id}-v-${activeVariant.id}` : product?.id;
    const cartItem = cart.find(item => item.cartKey === cartItemKey || item.id === product?.id);

    const outOfStock = activeStock === 0;
    const atStockLimit = activeStock != null && cartItem && cartItem.quantity >= activeStock;
    const favorited = product ? isFavorite(product.id) : false;

    const itemToCart = useMemo(() => {
        if (!product) return null;
        return {
            ...product,
            id: product.id,
            cartKey: cartItemKey,
            price: activePrice,
            stockQuantity: activeStock,
            selectedAttributes: activeVariant?.attributes || selectedAttributes,
            variantTitle: activeVariant?.title,
            imageUrl: currentImages[0] || product.imageUrl
        };
    }, [product, cartItemKey, activePrice, activeStock, activeVariant, selectedAttributes, currentImages]);

    const addToCart = () => {
        if (itemToCart) {
            dispatch({ type: 'ADD_ITEM', payload: itemToCart });
        }
    };

    const incrementItem = () => {
        if (itemToCart) {
            dispatch({ type: 'INCREMENT_ITEM', payload: itemToCart });
        }
    };

    const decrementItem = () => {
        if (itemToCart) {
            if (cartItem && cartItem.quantity > 1) {
                dispatch({ type: 'DECREMENT_ITEM', payload: itemToCart });
            } else {
                dispatch({ type: 'REMOVE_ITEM', payload: itemToCart });
            }
        }
    };

    if (!product) {
        return <p className="loading-product-details">Loading product details…</p>;
    }

    const currentImage = currentImages[activeImageIndex] || currentImages[0] || product.imageUrl;
    const hasAttributeGroups = Object.keys(attributeGroups).length > 0;
    const hasVariantsList = product.variants && product.variants.length > 0;
    const checkOptionStock = (attrKey, val) => {
        if (!product || !product.variants) return 1;
        const hypotheticalAttrs = { ...selectedAttributes, [attrKey]: val };

        let matched = product.variants.find((v) => {
            if (!v.attributes) return false;
            return Object.entries(hypotheticalAttrs).every(
                ([k, vVal]) => v.attributes[k] === vVal
            );
        });

        if (!matched) {
            matched = product.variants.find((v) => v.attributes && v.attributes[attrKey] === val);
        }

        if (!matched) return 0;
        return matched.stockQuantity ?? 0;
    };

    return (
        <div className="product-detail">
            <div className="product-detail-media-container">
                <div className="product-detail-media">
                    <img src={currentImage} alt={product.name} />
                </div>

                {currentImages.length > 1 && (
                    <div className="gallery-thumbnails">
                        {currentImages.map((imgUrl, idx) => (
                            <button
                                key={idx}
                                className={`gallery-thumb-btn ${idx === activeImageIndex ? 'active' : ''}`}
                                onMouseEnter={() => setActiveImageIndex(idx)}
                                onClick={() => setActiveImageIndex(idx)}
                                type="button"
                                aria-label={`View photo ${idx + 1}`}
                            >
                                <img src={imgUrl} alt={`${product.name} ${idx + 1}`} />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="product-detail-info">
                {product.category?.name && <span className="product-eyebrow">{product.category.name}</span>}
                <h1>{product.name}</h1>
                <p className="product-detail-desc">{product.description}</p>

                {/* Configurations Section */}
                {hasVariantsList && (
                    <div className="variant-selectors">
                        {hasAttributeGroups ? (
                            /* Dynamic Attribute Group Pickers */
                            Object.entries(attributeGroups).map(([attrKey, attrValues]) => (
                                <div className="option-group" key={attrKey}>
                                    <label className="option-label">
                                        {attrKey}: <strong>{selectedAttributes[attrKey] || attrValues[0]}</strong>
                                    </label>
                                    <div className="option-pills">
                                        {attrValues.map((val) => {
                                            const isSelected = selectedAttributes[attrKey] === val;
                                            const isColorAttr = attrKey.toLowerCase().includes("color");
                                            const hexColor = isColorAttr ? getColorHex(val) : null;
                                            const stockVal = checkOptionStock(attrKey, val);
                                            const isOutOfStockOption = stockVal === 0;

                                            return (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    disabled={isOutOfStockOption}
                                                    className={`option-pill ${isSelected ? 'active' : ''} ${isOutOfStockOption ? 'is-out-of-stock' : ''}`}
                                                    onClick={() => !isOutOfStockOption && handleSelectAttribute(attrKey, val)}
                                                    title={isOutOfStockOption ? `${val} (Out of stock)` : val}
                                                >
                                                    {hexColor && (
                                                        <span
                                                            className="swatch-circle"
                                                            style={{ backgroundColor: hexColor, opacity: isOutOfStockOption ? 0.4 : 1 }}
                                                        />
                                                    )}
                                                    <span>{val}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            /* Configuration Card List Selector */
                            <div className="option-group">
                                <label className="option-label">Configuration</label>
                                <div className="option-pills">
                                    {product.variants.map((v, idx) => {
                                        const isConfigOut = (v.stockQuantity ?? 0) === 0;
                                        return (
                                            <button
                                                key={v.id || idx}
                                                type="button"
                                                disabled={isConfigOut}
                                                className={`option-pill ${selectedVariantIndex === idx ? 'active' : ''} ${isConfigOut ? 'is-out-of-stock' : ''}`}
                                                onClick={() => !isConfigOut && handleSelectVariantCard(idx)}
                                                title={isConfigOut ? `${v.title || `Config #${idx + 1}`} (Out of stock)` : v.title}
                                            >
                                                {v.title || `Config #${idx + 1}`}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="product-detail-meta" style={{ marginTop: "24px" }}>
                    <span className="price-ticket price-ticket-lg">€{activePrice.toFixed(2)}</span>
                    <StockBadge stockQuantity={activeStock} />
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "20px" }}>
                    {cartItem ? (
                        <div className="quantity-controls">
                            <button onClick={decrementItem} aria-label="Remove one">−</button>
                            <span>{cartItem.quantity}</span>
                            <button onClick={incrementItem} disabled={atStockLimit} aria-label="Add one">+</button>
                        </div>
                    ) : (
                        <button className="add-to-cart" onClick={addToCart} disabled={outOfStock}>
                            {outOfStock ? 'Out of stock' : 'Add to cart'}
                        </button>
                    )}

                    <button
                        onClick={() => toggleFavorite(product)}
                        title={favorited ? "Remove from favorites" : "Add to favorites"}
                        style={{
                            background: favorited ? "#fee2e2" : "#f1f5f9",
                            border: favorited ? "1px solid #f87171" : "1px solid #cbd5e1",
                            borderRadius: "10px",
                            padding: "10px 16px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            cursor: "pointer",
                            fontWeight: "600",
                            color: favorited ? "#b91c1c" : "#334155"
                        }}
                    >
                        <img src="/favorite.svg" alt="Favorite" style={{ width: "20px", height: "20px" }} />
                        {favorited ? "Favorited" : "Add to Favorites"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage;
