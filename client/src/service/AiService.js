import axios from "axios";
import ApiService from "./ApiService";

/**
 * Storefront AI (SHV Assistant). All calls go to Spring's /ai gateway, which forwards
 * to the AI service. Guests can use them; logged-in users get a higher Q&A limit.
 */
export default class AiService {
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
