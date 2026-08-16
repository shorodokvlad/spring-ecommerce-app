import React, { useState } from "react";
import '../../style/starRating.css';

export const StarRating = ({ value = 0, count = null, size = 14, showValue = false }) => {
    const clamped = Math.max(0, Math.min(5, Number(value) || 0));
    const percentage = (clamped / 5) * 100;

    return (
        <div className="star-rating" aria-label={`Rated ${clamped.toFixed(1)} out of 5`}>
            <div className="star-rating-stars" style={{ fontSize: `${size}px` }}>
                <div className="star-rating-layer star-rating-back" aria-hidden="true">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <div className="star-rating-layer star-rating-fill" style={{ width: `${percentage}%` }} aria-hidden="true">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
            </div>
            {showValue && <span className="star-rating-value">{clamped.toFixed(1)}</span>}
            {count != null && <span className="star-rating-count">({count})</span>}
        </div>
    );
};

export const StarInput = ({ value = 0, onChange, size = 26 }) => {
    const [hover, setHover] = useState(0);
    const active = hover || value;

    return (
        <div className="star-input" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    className={`star-input-btn ${star <= active ? 'filled' : ''}`}
                    style={{ fontSize: `${size}px` }}
                    onMouseEnter={() => setHover(star)}
                    onClick={() => onChange(star)}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                    ★
                </button>
            ))}
        </div>
    );
};

export default StarRating;