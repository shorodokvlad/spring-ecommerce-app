import React from "react";

/**
 * Renders the assistant's plain-text answers: paragraphs, "- " / "* " / "1. " lists and
 * **bold**. Builds React elements (never HTML strings), so nothing in an answer can inject
 * markup.
 */
const renderInline = (text, keyPrefix) =>
    text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
            <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>
        ) : (
            part
        )
    );

const LIST_ITEM = /^\s*(?:[-*•]|\d+[.)])\s+/;

export function formatText(text) {
    const blocks = [];
    let list = null;
    let paragraph = [];

    const flushParagraph = () => {
        if (paragraph.length) {
            const key = `p${blocks.length}`;
            blocks.push(<p key={key}>{renderInline(paragraph.join(" "), key)}</p>);
            paragraph = [];
        }
    };
    const flushList = () => {
        if (list) {
            const key = `l${blocks.length}`;
            const Tag = list.ordered ? "ol" : "ul";
            blocks.push(
                <Tag key={key}>
                    {list.items.map((item, i) => (
                        <li key={i}>{renderInline(item, `${key}-${i}`)}</li>
                    ))}
                </Tag>
            );
            list = null;
        }
    };

    for (const rawLine of (text || "").split("\n")) {
        const line = rawLine.trim();
        if (!line) {
            flushParagraph();
            flushList();
        } else if (LIST_ITEM.test(line)) {
            flushParagraph();
            const ordered = /^\d/.test(line);
            if (!list || list.ordered !== ordered) {
                flushList();
                list = { ordered, items: [] };
            }
            list.items.push(line.replace(LIST_ITEM, ""));
        } else {
            flushList();
            paragraph.push(line);
        }
    }
    flushParagraph();
    flushList();
    return blocks;
}
