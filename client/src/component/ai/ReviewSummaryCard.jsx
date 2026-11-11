import React, { useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import AiService from "../../service/AiService";
import AiTag from "./AiTag";
import "../../style/aiProduct.css";

const SENTIMENT_LABEL = { positive: "Mostly positive", mixed: "Mixed", negative: "Mostly negative" };

/**
 * F3: "Customers say" summary. Clicking a pro/con/theme filters the review list to the
 * reviews behind it (onSelect receives {label, reviewIds}; null clears the filter).
 * `reviewsVersion` changes whenever the reviews change, which refetches the summary.
 */
const ReviewSummaryCard = ({ productId, reviewsVersion, selectedLabel, onSelect }) => {
    const [data, setData] = useState(null);

    useEffect(() => {
        let active = true;
        AiService.getReviewSummary(productId)
            .then((response) => active && setData(response))
            .catch(() => active && setData(null));
        return () => {
            active = false;
        };
    }, [productId, reviewsVersion]);

    if (!data || data.status !== "ready" || !data.summary) return null;
    const { verdict, sentiment, pros = [], cons = [], themes = [] } = data.summary;

    const toggle = (label, reviewIds) => {
        onSelect?.(selectedLabel === label ? null : { label, reviewIds });
    };

    const renderPoint = (point, kind) => {
        const label = point.text;
        const Icon = kind === "pro" ? ThumbsUp : ThumbsDown;
        return (
            <li key={`${kind}-${label}`}>
                <button
                    type="button"
                    className={`ai-point ai-point--${kind} ${selectedLabel === label ? "is-active" : ""}`}
                    onClick={() => toggle(label, point.review_ids)}
                    aria-pressed={selectedLabel === label}
                    title="Show the reviews that mention this"
                >
                    <Icon size={14} />
                    <span>{label}</span>
                    <span className="ai-point-count">{point.count}</span>
                </button>
            </li>
        );
    };

    return (
        <section className="ai-review-summary" aria-labelledby="ai-review-summary-title">
            <div className="ai-section-head">
                <h3 id="ai-review-summary-title" className="ai-review-summary-title">Customers say</h3>
                {sentiment && <span className={`ai-sentiment ai-sentiment--${sentiment}`}>{SENTIMENT_LABEL[sentiment]}</span>}
                <AiTag>AI summary of {data.summary.review_count} reviews</AiTag>
            </div>

            <p className="ai-review-verdict">{verdict}</p>

            {(pros.length > 0 || cons.length > 0) && (
                <div className="ai-proscons">
                    {pros.length > 0 && (
                        <div>
                            <h4 className="ai-subheading">What customers like</h4>
                            <ul className="ai-point-list">{pros.map((p) => renderPoint(p, "pro"))}</ul>
                        </div>
                    )}
                    {cons.length > 0 && (
                        <div>
                            <h4 className="ai-subheading">What could be better</h4>
                            <ul className="ai-point-list">{cons.map((c) => renderPoint(c, "con"))}</ul>
                        </div>
                    )}
                </div>
            )}

            {themes.length > 0 && (
                <div className="ai-chip-row">
                    <span className="ai-chip-label">Mentioned most</span>
                    {themes.map((t) => {
                        const ids = [...t.positive_review_ids, ...t.negative_review_ids];
                        const label = `theme:${t.name}`;
                        return (
                            <button
                                type="button"
                                key={t.name}
                                className={`ai-chip ai-chip--button ${selectedLabel === label ? "is-active" : ""}`}
                                onClick={() => toggle(label, ids)}
                                aria-pressed={selectedLabel === label}
                            >
                                {t.name}
                                <span className="ai-theme-counts">
                                    {t.positive > 0 && <span className="ai-pos">+{t.positive}</span>}
                                    {t.negative > 0 && <span className="ai-neg">−{t.negative}</span>}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </section>
    );
};

export default ReviewSummaryCard;
