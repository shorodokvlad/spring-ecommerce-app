import React, { useEffect, useRef, useState } from "react";
import { ArrowUp, RotateCcw, Sparkles, Square, X } from "lucide-react";
import { useAiChat } from "../../context/AiChatContext";
import ChatMessage from "./ChatMessage";
import "../../../style/aiChat.css";

const MAX_LENGTH = 1000;

const GENERAL_PROMPTS = [
    "Find a phone with a great camera under €800",
    "Which smartwatch is best for running?",
    "What's your return policy?",
    "How long does delivery take?",
];

const PRODUCT_PROMPTS = [
    "What do customers say about it?",
    "Show me similar products",
    "Is it a good choice for me?",
    "Can I return it if I don't like it?",
];

/**
 * SHV Assistant: a launcher button and a chat panel on the right. The panel doesn't block
 * the page on desktop, so shoppers can keep browsing while it answers; on phones it covers
 * the screen.
 */
const AiChatDrawer = () => {
    const chat = useAiChat();
    const [draft, setDraft] = useState("");
    const inputRef = useRef(null);
    const launcherRef = useRef(null);
    const listEndRef = useRef(null);
    const wasOpen = useRef(false);

    const isOpen = chat?.isOpen;
    const messages = chat?.messages || [];
    const lastMessage = messages[messages.length - 1];

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        } else if (wasOpen.current) {
            launcherRef.current?.focus();
        }
        wasOpen.current = Boolean(isOpen);
    }, [isOpen]);

    // Follow the answer as it streams in.
    useEffect(() => {
        if (isOpen) listEndRef.current?.scrollIntoView({ block: "end" });
    }, [isOpen, messages.length, lastMessage?.text, lastMessage?.blocks?.length]);

    if (!chat) return null;
    const { close, open, send, stop, newChat, rate, isStreaming, slowStart, pageProductId } = chat;

    const submit = (text) => {
        if (!text.trim() || isStreaming) return;
        send(text);
        setDraft("");
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit(draft);
        }
    };

    // On phones the panel covers the page, so following a product link closes it.
    const onNavigate = () => {
        if (window.matchMedia("(max-width: 640px)").matches) close();
    };

    const prompts = pageProductId ? PRODUCT_PROMPTS : GENERAL_PROMPTS;

    return (
        <>
            {!isOpen && (
                <button ref={launcherRef} type="button" className="chat-launcher" onClick={open}>
                    <Sparkles size={18} aria-hidden="true" />
                    <span>Ask SHV Assistant</span>
                </button>
            )}

            {isOpen && (
                <aside
                    className="chat-drawer"
                    aria-label="SHV Assistant"
                    onKeyDown={(e) => {
                        if (e.key === "Escape") close();
                    }}
                >
                    <header className="chat-head">
                        <span className="chat-head-mark" aria-hidden="true"><Sparkles size={16} /></span>
                        <div className="chat-head-text">
                            <h2>SHV Assistant</h2>
                            <p>AI shopping help. Answers can be wrong.</p>
                        </div>
                        {messages.length > 0 && (
                            <button type="button" className="chat-icon-btn" onClick={newChat} title="New chat" aria-label="Start a new chat">
                                <RotateCcw size={16} />
                            </button>
                        )}
                        <button type="button" className="chat-icon-btn" onClick={close} aria-label="Close the assistant">
                            <X size={18} />
                        </button>
                    </header>

                    <div className="chat-body">
                        {messages.length === 0 ? (
                            <div className="chat-empty">
                                <h3>{pageProductId ? "Questions about this product?" : "What are you shopping for?"}</h3>
                                <p>
                                    Describe what you need and I'll find products, compare them, sum up reviews or
                                    answer questions about delivery and returns.
                                </p>
                                <div className="chat-prompts">
                                    {prompts.map((prompt) => (
                                        <button type="button" key={prompt} onClick={() => submit(prompt)}>
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <ol className="chat-list" aria-live="polite" aria-relevant="additions text">
                                {messages.map((m) => (
                                    <ChatMessage
                                        key={m.id}
                                        message={m}
                                        slowStart={slowStart}
                                        onRate={rate}
                                        onNavigate={onNavigate}
                                    />
                                ))}
                            </ol>
                        )}
                        <div ref={listEndRef} />
                    </div>

                    <form
                        className="chat-form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            submit(draft);
                        }}
                    >
                        <textarea
                            ref={inputRef}
                            rows={1}
                            value={draft}
                            maxLength={MAX_LENGTH}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder={pageProductId ? "Ask about this product or anything else" : "Ask for a product, a comparison, delivery…"}
                            aria-label="Message to the assistant"
                        />
                        {isStreaming ? (
                            <button type="button" className="chat-send" onClick={stop} aria-label="Stop the answer">
                                <Square size={14} fill="currentColor" />
                            </button>
                        ) : (
                            <button type="submit" className="chat-send" disabled={!draft.trim()} aria-label="Send">
                                <ArrowUp size={18} />
                            </button>
                        )}
                    </form>
                </aside>
            )}
        </>
    );
};

export default AiChatDrawer;
