import React from "react";
import { useNavigate } from "react-router-dom";
import "../../style/addToCartModal.css";

const AddToCartModal = ({ isOpen, onClose, product, activeVariant, price, imageUrl }) => {
    const navigate = useNavigate();

    if (!isOpen || !product) return null;

    const handleViewCart = () => {
        onClose();
        navigate("/cart");
    };

    const variantTitle = activeVariant?.title || "";

    return (
        <div className="add-to-cart-modal-backdrop" onClick={onClose}>
            <div className="add-to-cart-modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="add-to-cart-modal-header">
                    <h2>Product added to cart</h2>
                    <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </div>

                {/* Modal Body */}
                <div className="add-to-cart-modal-body">
                    <div className="modal-product-media">
                        <img src={imageUrl || product.imageUrl} alt={product.name} />
                    </div>

                    <div className="modal-product-info">
                        <h3>{product.name}</h3>
                        {variantTitle && <p className="modal-variant-title">{variantTitle}</p>}
                        {product.category?.name && <span className="modal-category-name">{product.category.name}</span>}
                    </div>

                    <div className="modal-product-price">
                        <span>€{(price || 0).toFixed(2)}</span>
                    </div>

                    <div className="modal-actions-col">
                        <button type="button" className="btn-view-cart" onClick={handleViewCart}>
                            View Cart Details
                        </button>
                        <button type="button" className="btn-continue-shopping" onClick={onClose}>
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddToCartModal;
