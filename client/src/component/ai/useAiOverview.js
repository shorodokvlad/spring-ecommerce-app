import { useEffect, useState } from "react";
import AiService from "../../service/AiService";

/**
 * Fetches the AI overview once per product. The page shows parts of it in two places
 * (summary under the title, highlights above the specs), so the fetch lives here.
 * status: "loading" | "ready" | "empty" (not enough product info) | "error" (AI unavailable)
 */
export default function useAiOverview(productId) {
    const [state, setState] = useState({ status: "loading", overview: null });

    useEffect(() => {
        if (!productId) return undefined;
        let active = true;
        setState({ status: "loading", overview: null });
        AiService.getOverview(productId)
            .then((data) => {
                if (!active) return;
                const ready = data?.status === "ready" && data.overview;
                setState({ status: ready ? "ready" : "empty", overview: ready ? data.overview : null });
            })
            .catch(() => active && setState({ status: "error", overview: null }));
        return () => {
            active = false;
        };
    }, [productId]);

    return state;
}
