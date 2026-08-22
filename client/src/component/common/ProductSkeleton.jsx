import React from "react";
import "../../style/productSkeleton.css";

const ProductSkeleton = ({ count = 18 }) => {
    return (
        <div className="product-skeleton-grid">
            {Array.from({ length: count }).map((_, idx) => (
                <div className="product-skeleton-card" key={idx}>
                    <div className="skeleton-img-box skeleton-shimmer" />
                    <div className="skeleton-title-line skeleton-shimmer" />
                    <div className="skeleton-title-line short skeleton-shimmer" />
                    <div className="skeleton-rating-line skeleton-shimmer" />
                    <div className="skeleton-bottom-row">
                        <div className="skeleton-price-line skeleton-shimmer" />
                        <div className="skeleton-btn-box skeleton-shimmer" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductSkeleton;
