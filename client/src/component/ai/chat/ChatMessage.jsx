import React from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { CartAction, ComparisonTable, ProductCards } from "./ChatBlocks";
import { formatText } from "./formatText";

const ACTIVITY = {
    search_products: "Searching the catalog",
    get_product_details: "Checking product details",
    get_review_insights: "Reading customer reviews",
    compare_products: "Comparing products",
    similar_products: "Finding alternatives",
    search_store_info: "Checking store information",
    suggest_add_to_cart: "Preparing your cart button",
};

const Thinking = ({ label }) => (
    <p className="chat-thinking">
        <span className="chat-dots" aria-hidden="true"><i /><i /><i /></span>
        {label}
    </p>
);

const ChatMessage = ({ message, slowStart, onRate, onNavigate }) => {
    if (message.role === "user") {
        return (
            <li className="chat-msg chat-msg--user">
                <p>{message.text}</p>
            </li>
        );
    }

    const waiting = message.streaming && !message.text && message.blocks.length === 0;
    const sources = [...new Map((message.sources || []).map((s) => [s.title, s])).values()];
    // A product with an "Add to cart" card in this answer doesn't need a second, plain card.
    const inCartCards = new Set(
        message.blocks.filter((b) => b.type === "action" && b.product).map((b) => b.product.id)
    );

    return (
        <li className="chat-msg chat-msg--assistant" aria-busy={message.streaming}>
            {waiting && (
                <Thinking
                    label={
                        message.activity
                            ? `${ACTIVITY[message.activity] || "Working on it"}…`
                            : slowStart
                              ? "Waking up the assistant, this can take a minute…"
                              : "Thinking…"
                    }
                />
            )}
            {message.text && <div className="chat-text">{formatText(message.text)}</div>}
            {message.streaming && message.activity && !waiting && (
                <Thinking label={`${ACTIVITY[message.activity] || "Working on it"}…`} />
            )}

            {message.blocks.map((block, i) => {
                if (block.type === "products") {
                    const items = block.items.filter((p) => !inCartCards.has(p.id));
                    return items.length > 0 ? <ProductCards key={i} items={items} onNavigate={onNavigate} /> : null;
                }
                if (block.type === "comparison") {
                    return <ComparisonTable key={i} products={block.products} rows={block.rows} onNavigate={onNavigate} />;
                }
                if (block.type === "action" && block.product) {
                    return <CartAction key={i} product={block.product} variant={block.variant} quantity={block.quantity} />;
                }
                return null;
            })}

            {sources.length > 0 && (
                <p className="chat-sources">
                    From: {sources.map((s) => s.title.split(":")[0]).filter((t, i, all) => all.indexOf(t) === i).join(", ")}
                </p>
            )}
            {message.error && <p className="chat-error" role="alert">{message.error}</p>}

            {!message.streaming && message.messageId && (
                <div className="chat-feedback">
                    <button
                        type="button"
                        aria-label="Helpful answer"
                        aria-pressed={message.feedback === 1}
                        disabled={Boolean(message.feedback)}
                        onClick={() => onRate(message.id, 1)}
                    >
                        <ThumbsUp size={14} />
                    </button>
                    <button
                        type="button"
                        aria-label="Not helpful"
                        aria-pressed={message.feedback === -1}
                        disabled={Boolean(message.feedback)}
                        onClick={() => onRate(message.id, -1)}
                    >
                        <ThumbsDown size={14} />
                    </button>
                    {message.feedback && <span>Thanks for the feedback</span>}
                </div>
            )}
        </li>
    );
};

export default ChatMessage;
