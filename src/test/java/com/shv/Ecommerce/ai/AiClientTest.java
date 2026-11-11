package com.shv.Ecommerce.ai;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

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

    @Test
    void openChatReturnsTheLiveStreamAndSendsTheToken() throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        List<String> seen = new ArrayList<>();
        server.createContext("/chat", exchange -> {
            seen.add(exchange.getRequestHeaders().getFirst("X-Service-Token"));
            seen.add(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            exchange.getResponseHeaders().add("Content-Type", "text/event-stream");
            exchange.sendResponseHeaders(200, 0);
            try (OutputStream out = exchange.getResponseBody()) {
                out.write("event: token\ndata: {\"text\":\"Hi\"}\n\n".getBytes(StandardCharsets.UTF_8));
            }
        });
        server.start();
        try {
            String base = "http://127.0.0.1:" + server.getAddress().getPort();
            AiClient client = new AiClient(new AiProperties(base, "secret"));

            try (InputStream stream = client.openChat(Map.of("message", "hi"))) {
                assertThat(new String(stream.readAllBytes(), StandardCharsets.UTF_8))
                        .isEqualTo("event: token\ndata: {\"text\":\"Hi\"}\n\n");
            }
            assertThat(seen).containsExactly("secret", "{\"message\":\"hi\"}");

            server.removeContext("/chat");
            server.createContext("/chat", exchange -> {
                byte[] body = "{\"detail\":\"bad\"}".getBytes(StandardCharsets.UTF_8);
                exchange.sendResponseHeaders(422, body.length);
                exchange.getResponseBody().write(body);
                exchange.close();
            });
            assertThatThrownBy(() -> client.openChat(Map.of("message", "")))
                    .isInstanceOf(AiServiceException.class)
                    .satisfies(e -> assertThat(((AiServiceException) e).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
        } finally {
            server.stop(0);
        }
    }
}
