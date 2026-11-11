import axios from "axios";
import ApiService from "./ApiService";

/**
 * Storefront AI (SHV Assistant). All calls go to Spring's /ai gateway, which forwards
 * to the AI service. Guests can use them; logged-in users get a higher Q&A limit.
 */
// The AI service runs on Render's free plan and sleeps after ~15 minutes idle. Render only
// wakes it for outside traffic, not for calls from the Spring backend, so the storefront
// pings it directly; Spring then retries until it's up. Override per environment if needed.
const AI_WAKE_URL = process.env.REACT_APP_AI_WAKE_URL || "https://shv-ai.onrender.com/health";
const WAKE_INTERVAL_MS = 5 * 60 * 1000;
const WAKE_STORAGE_KEY = "shv_ai_woken_at";

/**
 * Incremental Server-Sent Events parser: feed it decoded text chunks as they arrive and it
 * calls onEvent(name, data) for every complete event. Chunks may split events anywhere.
 */
export function createSseParser(onEvent) {
    let buffer = "";
    const dispatch = (block) => {
        let name = "message";
        const data = [];
        for (const line of block.split("\n")) {
            if (line.startsWith("event:")) name = line.slice(6).trim();
            else if (line.startsWith("data:")) data.push(line.slice(5).replace(/^ /, ""));
        }
        if (data.length === 0) return;
        try {
            onEvent(name, JSON.parse(data.join("\n")));
        } catch {
            // ignore a malformed event rather than breaking the whole answer
        }
    };
    return {
        push(text) {
            buffer += text.replace(/\r\n?/g, "\n");
            let end;
            while ((end = buffer.indexOf("\n\n")) !== -1) {
                dispatch(buffer.slice(0, end));
                buffer = buffer.slice(end + 2);
            }
        },
        flush() {
            if (buffer.trim()) dispatch(buffer);
            buffer = "";
        },
    };
}

export default class AiService {
    /** Fire-and-forget wake-up ping, at most once every 5 minutes per tab. */
    static wake() {
        if (!AI_WAKE_URL) return;
        try {
            const last = Number(sessionStorage.getItem(WAKE_STORAGE_KEY) || 0);
            if (Date.now() - last < WAKE_INTERVAL_MS) return;
            sessionStorage.setItem(WAKE_STORAGE_KEY, String(Date.now()));
        } catch {
            // sessionStorage unavailable (private mode): ping anyway
        }
        // no-cors: we don't need the response, only the request reaching Render
        fetch(AI_WAKE_URL, { mode: "no-cors", cache: "no-store" }).catch(() => {});
    }

    static authHeaders() {
        return ApiService.isAuthenticated() ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {};
    }

    static async getOverview(productId) {
        const response = await axios.get(`${ApiService.BASE_URL}/ai/products/${productId}/overview`);
        return response.data;
    }

    static async getReviewSummary(productId) {
        const response = await axios.get(`${ApiService.BASE_URL}/ai/products/${productId}/review-summary`);
        return response.data;
    }

    static async ask(productId, question) {
        const response = await axios.post(
            `${ApiService.BASE_URL}/ai/products/${productId}/ask`,
            { question },
            { headers: { ...this.authHeaders(), "Content-Type": "application/json" } }
        );
        return response.data;
    }

    /**
     * Send a chat message and stream the answer. onEvent(name, data) gets every event:
     * session, token, tool, products, comparison, action, sources, done, error.
     * Rejects with an Error whose message is shown to the shopper.
     */
    static async streamChat({ message, sessionId, productId }, onEvent, signal) {
        let response;
        try {
            response = await fetch(`${ApiService.BASE_URL}/ai/chat`, {
                method: "POST",
                headers: { ...this.authHeaders(), "Content-Type": "application/json", Accept: "text/event-stream" },
                body: JSON.stringify({ message, sessionId: sessionId || null, productId: productId || null }),
                signal,
            });
        } catch (err) {
            if (err.name === "AbortError") throw err;
            throw new Error("Can't reach the assistant. Check your connection and try again.");
        }
        if (!response.ok || !response.body) {
            let text = "The assistant isn't available right now. Please try again.";
            try {
                text = (await response.json()).message || text;
            } catch {
                // keep the default text
            }
            throw new Error(text);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        const parser = createSseParser(onEvent);
        for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            parser.push(decoder.decode(value, { stream: true }));
        }
        parser.push(decoder.decode());
        parser.flush();
    }

    static async sendChatFeedback(sessionId, messageId, rating) {
        await axios.post(
            `${ApiService.BASE_URL}/ai/chat/feedback`,
            { sessionId, messageId, rating },
            { headers: { ...this.authHeaders(), "Content-Type": "application/json" } }
        );
    }

    /** Human-readable message for a failed AI call. */
    static errorMessage(error, fallback = "The AI assistant isn't available right now.") {
        return error?.response?.data?.message || fallback;
    }
}
