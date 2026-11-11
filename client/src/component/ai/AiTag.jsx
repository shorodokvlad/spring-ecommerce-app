import React from "react";
import { Sparkles } from "lucide-react";

/** Small label marking content written by the AI. */
const AiTag = ({ children = "AI summary", title }) => (
    <span className="ai-tag" title={title}>
        <Sparkles size={12} aria-hidden="true" />
        {children}
    </span>
);

export default AiTag;
