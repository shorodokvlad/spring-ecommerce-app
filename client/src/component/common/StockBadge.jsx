import React from "react";

// Shows availability for a product. Products saved before stock tracking
// existed have no stockQuantity — show nothing for those.
const StockBadge = ({ stockQuantity }) => {
    if (stockQuantity == null) return null;

    if (stockQuantity === 0) {
        return <span className="stock-badge stock-out">Out of stock</span>;
    }
    if (stockQuantity <= 5) {
        return <span className="stock-badge stock-low">Only {stockQuantity} left</span>;
    }
    return <span className="stock-badge stock-ok">In stock</span>;
};

export default StockBadge;
