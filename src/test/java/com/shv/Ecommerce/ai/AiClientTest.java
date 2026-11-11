package com.shv.Ecommerce.ai;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AiClientTest {

    @Test
    void baseUrlIsTrimmedAndLosesTrailingSlashes() {
        assertThat(AiClient.normalizeBaseUrl(" https://shv-ai.onrender.com// ")).isEqualTo("https://shv-ai.onrender.com");
        assertThat(AiClient.normalizeBaseUrl(null)).isEqualTo("http://localhost:8000");
        assertThat(AiClient.normalizeBaseUrl("  ")).isEqualTo("http://localhost:8000");
    }

    @Test
    void longHtmlErrorPagesAreShortenedToOneLine() {
        String html = "<html>\n  <body>\n" + "x".repeat(500) + "</body></html>";

        String shortened = AiClient.shorten(html);

        assertThat(shortened).startsWith("<html> <body> xxx").endsWith("…").doesNotContain("\n");
        assertThat(shortened.length()).isEqualTo(201);
        assertThat(AiClient.shorten("{\"detail\":\"Invalid service token\"}")).isEqualTo("{\"detail\":\"Invalid service token\"}");
        assertThat(AiClient.shorten(null)).isEmpty();
    }
}
