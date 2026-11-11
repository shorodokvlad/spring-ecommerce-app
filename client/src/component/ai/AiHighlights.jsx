import React from "react";
import { Check, Info } from "lucide-react";
import AiTag from "./AiTag";
import "../../style/aiProduct.css";

/** "At a glance": the AI overview's highlights and watch-outs, shown above the specifications. */
const AiHighlights = ({ state }) => {
    if (state.status !== "ready") return null;
    const { highlights = [], watch_outs: watchOuts = [] } = state.overview;
    if (highlights.length === 0 && watchOuts.length === 0) return null;

    return (
        <section className="ai-highlights" aria-labelledby="ai-highlights-title">
            <div className="ai-section-head">
                <h2 id="ai-highlights-title" className="pd-section-title">At a glance</h2>
                <AiTag />
            </div>

            {highlights.length > 0 && (
                <ul className="ai-highlight-grid">
                    {highlights.map((h) => (
                        <li className="ai-highlight" key={h.title}>
                            <span className="ai-highlight-icon" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>
                            <div>
                                <strong>{h.title}</strong>
                                <p>{h.text}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {watchOuts.length > 0 && (
                <div className="ai-watchouts">
                    <span className="ai-watchouts-label"><Info size={14} aria-hidden="true" /> Good to know</span>
                    <ul>
                        {watchOuts.map((w) => <li key={w}>{w}</li>)}
                    </ul>
                </div>
            )}
        </section>
    );
};

export default AiHighlights;
