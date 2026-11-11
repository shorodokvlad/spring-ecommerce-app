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

    /** Human-readable message for a failed AI call. */
    static errorMessage(error, fallback = "The AI assistant isn't available right now.") {
        return error?.response?.data?.message || fallback;
    }
}
