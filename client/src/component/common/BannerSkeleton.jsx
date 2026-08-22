import React from "react";
import "../../style/productSkeleton.css";

const BannerSkeleton = () => {
    return (
        <div className="banner-skeleton-container">
            <div className="banner-skeleton-content skeleton-shimmer" />
            <div className="banner-skeleton-dots">
                <div className="skeleton-dot skeleton-shimmer" />
                <div className="skeleton-dot skeleton-shimmer" />
                <div className="skeleton-dot skeleton-shimmer" />
            </div>
        </div>
    );
};

export default BannerSkeleton;
