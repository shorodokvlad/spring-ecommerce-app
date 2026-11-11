import React from "react";
import AiTag from "./AiTag";
import "../../style/aiProduct.css";

/** Short AI summary shown right under the product title. Hidden when the AI has nothing to say. */
const AiOverviewSummary = ({ state }) => {
    if (state.status === "loading") {
        return (
            <div className="ai-summary-block" aria-busy="true" aria-label="Loading AI summary">
                <div className="ai-skeleton-line" />
                <div className="ai-skeleton-line ai-skeleton-line--short" />
            </div>
        );
    }
    if (state.status !== "ready") return null;

    const { summary, best_for: bestFor = [] } = state.overview;
    return (
        <div className="ai-summary-block">
            <AiTag title="Written by AI from the product specifications" />
            <p className="ai-summary-text">{summary}</p>
            {bestFor.length > 0 && (
                <div className="ai-bestfor">
                    <span className="ai-bestfor-label">Best for</span>
                    {bestFor.map((item) => (
                        <span className="ai-bestfor-chip" key={item}>{item}</span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AiOverviewSummary;
