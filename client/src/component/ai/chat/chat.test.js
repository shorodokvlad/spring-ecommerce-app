import React from "react";
import { render, screen } from "@testing-library/react";
import { createSseParser } from "../../../service/AiService";
import { applyChatEvent } from "../../context/AiChatContext";
import { formatText } from "./formatText";

jest.mock("axios", () => ({ get: jest.fn(), post: jest.fn() }));
// CRA's Jest can't resolve react-router v7's package exports; these tests don't need routing.
jest.mock("react-router-dom", () => ({ useLocation: () => ({ pathname: "/" }) }), { virtual: true });
jest.mock("../../../service/ApiService", () => ({
    __esModule: true,
    default: { BASE_URL: "http://api.test", isAuthenticated: () => false },
}));

describe("createSseParser", () => {
    it("parses events split across chunks", () => {
        const events = [];
        const parser = createSseParser((name, data) => events.push([name, data]));

        parser.push('event: session\ndata: {"session_id":"s1"}\n\nevent: tok');
        parser.push('en\ndata: {"text":"Hel');
        parser.push('lo"}\r\n\r\nevent: done\ndata: {"message_id":7}');
        parser.flush();

        expect(events).toEqual([
            ["session", { session_id: "s1" }],
            ["token", { text: "Hello" }],
            ["done", { message_id: 7 }],
        ]);
    });

    it("skips malformed events and keeps going", () => {
        const events = [];
        const parser = createSseParser((name) => events.push(name));
        parser.push("event: token\ndata: {broken\n\n: comment\n\nevent: done\ndata: {}\n\n");
        expect(events).toEqual(["done"]);
    });
});

describe("applyChatEvent", () => {
    const start = { text: "", blocks: [], sources: [], streaming: true, activity: null };

    it("builds the assistant message from the stream", () => {
        let m = applyChatEvent(start, "tool", { name: "search_products" });
        expect(m.activity).toBe("search_products");
        m = applyChatEvent(m, "products", { items: [{ id: 1 }] });
        m = applyChatEvent(m, "token", { text: "Here " });
        m = applyChatEvent(m, "token", { text: "you go." });
        m = applyChatEvent(m, "sources", { items: [{ title: "Returns: X", slug: "returns" }] });
        m = applyChatEvent(m, "done", { message_id: 9 });

        expect(m).toMatchObject({
            text: "Here you go.",
            activity: null,
            streaming: false,
            messageId: 9,
            blocks: [{ type: "products", items: [{ id: 1 }] }],
            sources: [{ title: "Returns: X", slug: "returns" }],
        });
    });

    it("keeps the block type for add-to-cart actions", () => {
        const m = applyChatEvent(start, "action", { type: "add_to_cart", product: { id: 1 }, quantity: 1 });
        expect(m.blocks).toEqual([{ type: "action", action: "add_to_cart", product: { id: 1 }, quantity: 1 }]);
    });

    it("stops on error and ignores unknown events", () => {
        expect(applyChatEvent(start, "unknown", {})).toBe(start);
        expect(applyChatEvent(start, "error", { message: "busy" })).toMatchObject({ streaming: false, error: "busy" });
    });
});

describe("formatText", () => {
    it("renders paragraphs, lists and bold without HTML injection", () => {
        render(<div data-testid="out">{formatText("Two options:\n- **Phone A**: €900\n- Phone B\n\n<img src=x onerror=alert(1)>")}</div>);
        const out = screen.getByTestId("out");

        expect(out.querySelectorAll("li")).toHaveLength(2);
        expect(out.querySelector("strong").textContent).toBe("Phone A");
        expect(out.querySelector("img")).toBeNull();
        expect(out.textContent).toContain("<img src=x onerror=alert(1)>");
    });

    it("numbers ordered lists", () => {
        render(<div data-testid="ol">{formatText("1. First\n2. Second")}</div>);
        expect(screen.getByTestId("ol").querySelectorAll("ol li")).toHaveLength(2);
    });
});
