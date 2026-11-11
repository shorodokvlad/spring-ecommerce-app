import React, { useEffect, useState } from "react";
import { MessageCircleQuestion, ArrowUp, Loader2 } from "lucide-react";
import AiService from "../../service/AiService";
import "../../style/aiProduct.css";

const MAX_LENGTH = 300;
const CITATION_LABEL = {
    live: "Price & stock",
    product: "Product details",
    spec: "Specifications",
    description: "Description",
    review: "Customer review",
};

/**
 * Ask about this product: sits beside the specifications so questions about them get
 * answered in place. Answers cite where they came from.
 */
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

    const citationText = (c) => {
        if (c.type === "review") return c.rating ? `Review · ${c.rating}/5` : CITATION_LABEL.review;
        if (c.type === "spec" && c.label) {
            // Spec section titles are often stored in capitals ("GENERAL CHARACTERISTICS")
            const section = c.label.replace(/^Specifications:\s*/, "").toLowerCase();
            return section ? section.charAt(0).toUpperCase() + section.slice(1) : CITATION_LABEL.spec;
        }
        return CITATION_LABEL[c.type] || c.label;
    };

    return (
        <section className="ai-ask" aria-labelledby="ai-ask-title">
            <div className="ai-ask-head">
                <span className="ai-ask-icon" aria-hidden="true"><MessageCircleQuestion size={18} /></span>
                <div>
                    <h2 id="ai-ask-title" className="ai-ask-title">Ask about this product</h2>
                    <p className="ai-ask-sub">Answers come from the specifications and customer reviews.</p>
                </div>
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
                    placeholder="Type your question"
                    aria-label="Your question about this product"
                    disabled={loading}
                />
                <button type="submit" disabled={loading || question.trim().length < 3} aria-label="Ask">
                    {loading ? <Loader2 size={18} className="ai-spin" /> : <ArrowUp size={18} />}
                </button>
            </form>

            {suggestedQuestions.length > 0 && !answer && !loading && (
                <div className="ai-suggestions">
                    <span className="ai-suggestions-label">Try asking</span>
                    {suggestedQuestions.slice(0, 3).map((q) => (
                        <button type="button" key={q} className="ai-suggestion" onClick={() => submit(q)}>
                            {q}
                        </button>
                    ))}
                </div>
            )}

            <div aria-live="polite">
                {loading && <p className="ai-muted">Checking the specifications and reviews…</p>}
                {error && <p className="ai-error">{error}</p>}
                {answer && (
                    <div className={`ai-answer ${answer.answerable ? "" : "ai-answer--unknown"}`}>
                        <p className="ai-answer-q">{answer.question}</p>
                        <p>{answer.answer}</p>
                        {answer.citations?.length > 0 && (
                            <div className="ai-sources">
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
