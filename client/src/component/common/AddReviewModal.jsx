import React, { useState } from "react";
import { Star, X } from "lucide-react";
import "../../style/addReviewModal.css";

const AddReviewModal = ({ isOpen, onClose, product, onSubmitReview }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen || !product) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (rating < 1) {
            setError("Please select a star rating (1–5) before submitting.");
            return;
        }
        setIsSubmitting(true);
        try {
            await onSubmitReview({ rating, content: content.trim() });
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to submit review.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="add-review-modal-overlay" onClick={onClose}>
            <div className="add-review-modal-card" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="add-review-modal-header">
                    <div className="add-review-product-info">
                        <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="add-review-product-thumb" 
                        />
                        <div className="add-review-header-text">
                            <span className="add-review-header-label">Add a review for:</span>
                            <h3 className="add-review-product-name">{product.name}</h3>
                        </div>
                    </div>
                    <button type="button" className="add-review-close-btn" onClick={onClose} aria-label="Close modal">
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form className="add-review-modal-body" onSubmit={handleSubmit}>
                    {error && <div className="add-review-error-banner">{error}</div>}

                    {/* Rating Section */}
                    <div className="add-review-rating-section">
                        <h4 className="add-review-section-title">Rate the product</h4>
                        <div className="add-review-star-picker">
                            {[1, 2, 3, 4, 5].map((starVal) => {
                                const activeVal = hoverRating || rating;
                                const isFilled = starVal <= activeVal;
                                return (
                                    <button
                                        key={starVal}
                                        type="button"
                                        className="star-btn-item"
                                        onMouseEnter={() => setHoverRating(starVal)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(starVal)}
                                    >
                                        <Star
                                            size={32}
                                            fill={isFilled ? "#facc15" : "none"}
                                            color={isFilled ? "#facc15" : "#cbd5e1"}
                                            strokeWidth={1.5}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Textarea */}
                    <div className="add-review-field-group">
                        <label className="add-review-field-label">Review:</label>
                        <textarea
                            className="add-review-textarea"
                            rows={4}
                            placeholder={`Tell us if you like or dislike what you bought.\n• Met your expectations\n• Satisfied with price/quality ratio\n• Would recommend to others`}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    {/* Footer Support Info */}
                    <div className="add-review-footer-notice">
                        <p>
                            Having issues with the product or delivery? <a href="#support">Submit a request</a>
                        </p>
                        <p className="terms-subtext">
                            By publishing this review, you agree to the <a href="#terms">terms and conditions</a> of the site.
                        </p>
                    </div>

                    {/* Action Button */}
                    <div className="add-review-modal-actions">
                        <button
                            type="submit"
                            className="add-review-submit-btn"
                            disabled={isSubmitting || rating < 1}
                        >
                            {isSubmitting ? "Submitting..." : "Submit review"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddReviewModal;
