import React, { useEffect, useState } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";
import AiService from "../../service/AiService";
import "../../style/aiProduct.css";

const MAX_LENGTH = 300;
const CITATION_LABEL = {
    live: "Current price & stock",
    product: "Product details",
    spec: "Specifications",
    description: "Description",
    review: "Customer review",
};

/** F4: ask a question about this product; the answer cites where it came from. */
const AskProductBox = ({ productId, suggestedQuestions = [] }) => {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setQuestion("");
        setAnswer(null);
        setError(null);
    }, [productId]);

    const submit = async (text) => {
        const trimmed = text.trim();
        if (trimmed.length < 3 || loading) return;
        setQuestion(trimmed);
        setLoading(true);
        setError(null);
        setAnswer(null);
        try {
            setAnswer(await AiService.ask(productId, trimmed));
        } catch (err) {
            setError(AiService.errorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const citationText = (c) =>
        c.type === "review" && c.rating ? `${CITATION_LABEL.review} (${c.rating}/5)` : c.label || CITATION_LABEL[c.type];

    return (
        <section className="ai-card ai-ask" aria-label="Ask about this product">
            <div className="ai-card-head">
                <Sparkles size={18} className="ai-spark" />
                <span className="ai-card-title">Ask about this product</span>
            </div>

            <form
                className="ai-ask-form"
                onSubmit={(e) => {
                    e.preventDefault();
                    submit(question);
                }}
            >
                <input
                    type="text"
                    value={question}
                    maxLength={MAX_LENGTH}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g. Does it support fast charging?"
                    aria-label="Your question about this product"
                    disabled={loading}
                />
                <button type="submit" disabled={loading || question.trim().length < 3} aria-label="Ask">
                    {loading ? <Loader2 size={18} className="ai-spin" /> : <Send size={18} />}
                </button>
            </form>

            {suggestedQuestions.length > 0 && !answer && !loading && (
                <div className="ai-chip-row">
                    {suggestedQuestions.slice(0, 3).map((q) => (
                        <button type="button" key={q} className="ai-chip ai-chip--button" onClick={() => submit(q)}>
                            {q}
                        </button>
                    ))}
                </div>
            )}

            <div aria-live="polite">
                {loading && <p className="ai-muted">Looking through the product information…</p>}
                {error && <p className="error-message">{error}</p>}
                {answer && (
                    <div className={`ai-answer ${answer.answerable ? "" : "ai-answer--unknown"}`}>
                        <p>{answer.answer}</p>
                        {answer.citations?.length > 0 && (
                            <div className="ai-sources">
                                <span>Sources:</span>
                                {answer.citations.map((c) => (
                                    <span className="ai-source" key={c.source_id}>{citationText(c)}</span>
                                ))}
                            </div>
                        )}
                        <p className="ai-disclaimer">AI answers can be wrong. Check the specifications before buying.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default AskProductBox;
