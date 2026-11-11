import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import AiService from "../../service/AiService";
import { getProductIdFromRoute } from "../../utils/productVariant";

/**
 * SHV Assistant chat: open/closed state, the conversation, and the page it's about.
 * The conversation survives navigation and reloads (localStorage); the server keeps the
 * history the model sees, keyed by the session id it returns in the "session" event.
 */
const AiChatContext = createContext(null);

const SESSION_KEY = "shv_chat_session";
const MESSAGES_KEY = "shv_chat_messages";
const MAX_STORED_MESSAGES = 40;
// No token after this long: the free AI service is probably waking up.
const SLOW_START_MS = 8000;

const readStorage = (key, fallback) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
};

const writeStorage = (key, value) => {
    try {
        if (value == null) localStorage.removeItem(key);
        else localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // storage full or blocked: the chat still works for this page view
    }
};

let nextId = 0;
const newId = () => `m${Date.now()}-${nextId++}`;

/** Applies one streamed event to the assistant message being written. */
export function applyChatEvent(message, name, data) {
    switch (name) {
        case "token":
            return { ...message, text: message.text + (data.text || ""), activity: null };
        case "tool":
            return { ...message, activity: data.name };
        case "products":
            return { ...message, blocks: [...message.blocks, { type: "products", items: data.items || [] }] };
        case "comparison":
            return { ...message, blocks: [...message.blocks, { ...data, type: "comparison" }] };
        case "action":
            // data.type is the action kind ("add_to_cart"); the block type must win.
            return { ...message, blocks: [...message.blocks, { ...data, action: data.type, type: "action" }] };
        case "sources":
            return { ...message, sources: [...(message.sources || []), ...(data.items || [])] };
        case "done":
            return { ...message, streaming: false, activity: null, messageId: data.message_id ?? null };
        case "error":
            return { ...message, streaming: false, activity: null, error: data.message || "Something went wrong." };
        default:
            return message;
    }
}

export const AiChatProvider = ({ children }) => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [sessionId, setSessionId] = useState(() => readStorage(SESSION_KEY, null));
    const [messages, setMessages] = useState(() =>
        readStorage(MESSAGES_KEY, []).map((m) => ({ ...m, streaming: false, activity: null }))
    );
    const [slowStart, setSlowStart] = useState(false);
    const abortRef = useRef(null);
    const sessionRef = useRef(sessionId);

    const pageProductId = location.pathname.startsWith("/product/")
        ? getProductIdFromRoute(location.pathname.split("/")[2])
        : null;

    useEffect(() => {
        writeStorage(MESSAGES_KEY, messages.filter((m) => !m.streaming).slice(-MAX_STORED_MESSAGES));
    }, [messages]);

    useEffect(() => () => abortRef.current?.abort(), []);

    const isStreaming = messages.some((m) => m.streaming);

    const updateMessage = useCallback((id, change) => {
        setMessages((list) => list.map((m) => (m.id === id ? change(m) : m)));
    }, []);

    const send = useCallback(
        async (rawText) => {
            const text = (rawText || "").trim();
            if (!text || isStreaming) return;
            setIsOpen(true);
            const userMessage = { id: newId(), role: "user", text };
            const assistantId = newId();
            const assistantMessage = {
                id: assistantId,
                role: "assistant",
                text: "",
                blocks: [],
                sources: [],
                streaming: true,
                activity: null,
            };
            setMessages((list) => [...list, userMessage, assistantMessage]);

            const controller = new AbortController();
            abortRef.current = controller;
            setSlowStart(false);
            const slowTimer = setTimeout(() => setSlowStart(true), SLOW_START_MS);
            AiService.wake();

            const onEvent = (name, data) => {
                if (name !== "session") clearTimeout(slowTimer);
                if (name !== "session") setSlowStart(false);
                if (name === "session") {
                    const previous = sessionRef.current;
                    sessionRef.current = data.session_id;
                    setSessionId(data.session_id);
                    writeStorage(SESSION_KEY, data.session_id);
                    // The server started over (e.g. another account): drop the old conversation.
                    if (previous && previous !== data.session_id) {
                        setMessages((list) => list.filter((m) => m.id === userMessage.id || m.id === assistantId));
                    }
                    return;
                }
                updateMessage(assistantId, (m) => applyChatEvent(m, name, data));
            };

            try {
                await AiService.streamChat(
                    { message: text, sessionId: sessionRef.current, productId: pageProductId },
                    onEvent,
                    controller.signal
                );
                // A stream that ended without "done" (connection dropped) still stops loading.
                updateMessage(assistantId, (m) =>
                    m.streaming ? { ...m, streaming: false, activity: null, error: m.text ? null : "The answer was cut off. Please try again." } : m
                );
            } catch (err) {
                const stopped = err.name === "AbortError";
                updateMessage(assistantId, (m) => ({
                    ...m,
                    streaming: false,
                    activity: null,
                    error: stopped ? (m.text ? null : "Stopped.") : err.message,
                }));
            } finally {
                clearTimeout(slowTimer);
                setSlowStart(false);
                if (abortRef.current === controller) abortRef.current = null;
            }
        },
        [isStreaming, pageProductId, updateMessage]
    );

    const stop = useCallback(() => abortRef.current?.abort(), []);

    const newChat = useCallback(() => {
        abortRef.current?.abort();
        sessionRef.current = null;
        setSessionId(null);
        writeStorage(SESSION_KEY, null);
        setMessages([]);
    }, []);

    const rate = useCallback(
        async (id, rating) => {
            const message = messages.find((m) => m.id === id);
            if (!message?.messageId || !sessionRef.current || message.feedback) return;
            updateMessage(id, (m) => ({ ...m, feedback: rating }));
            try {
                await AiService.sendChatFeedback(sessionRef.current, message.messageId, rating);
            } catch {
                updateMessage(id, (m) => ({ ...m, feedback: null }));
            }
        },
        [messages, updateMessage]
    );

    const open = useCallback(() => {
        setIsOpen(true);
        AiService.wake();
    }, []);
    const close = useCallback(() => setIsOpen(false), []);

    const value = useMemo(
        () => ({ isOpen, open, close, messages, send, stop, newChat, rate, isStreaming, slowStart, pageProductId, sessionId }),
        [isOpen, open, close, messages, send, stop, newChat, rate, isStreaming, slowStart, pageProductId, sessionId]
    );

    return <AiChatContext.Provider value={value}>{children}</AiChatContext.Provider>;
};

export const useAiChat = () => useContext(AiChatContext);
