package com.shv.Ecommerce.ai;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * The chat endpoint through Spring MVC itself: the answer must really stream (async), and errors
 * must reach the browser as JSON even though it asks for text/event-stream.
 */
class AiChatEndpointTest {

    private final AiClient aiClient = mock(AiClient.class);
    private final AiRateLimiter rateLimiter = mock(AiRateLimiter.class);
    private final MockMvc mvc = MockMvcBuilders
            .standaloneSetup(new AiGatewayController(mock(AiContentService.class), aiClient, rateLimiter))
            .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
            .build();

    @Test
    void rateLimitIsJsonForAnEventStreamRequest() throws Exception {
        when(rateLimiter.tryAcquire(eq("chat"), any(), anyString())).thenReturn(false);

        mvc.perform(post("/ai/chat")
                        .accept(MediaType.TEXT_EVENT_STREAM)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"hi\"}"))
                .andExpect(status().isTooManyRequests())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void aiServiceErrorsAreJsonForAnEventStreamRequest() throws Exception {
        when(rateLimiter.tryAcquire(eq("chat"), any(), anyString())).thenReturn(true);
        when(aiClient.openChat(any())).thenThrow(new AiServiceException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "The AI assistant is busy"));

        mvc.perform(post("/ai/chat")
                        .accept(MediaType.TEXT_EVENT_STREAM)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"hi\"}"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.message").value("The AI assistant is busy"));
    }

    @Test
    void streamsARealUpstreamThroughAsyncDispatch() throws Exception {
        com.sun.net.httpserver.HttpServer server =
                com.sun.net.httpserver.HttpServer.create(new java.net.InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/chat", exchange -> {
            exchange.getRequestBody().readAllBytes();
            exchange.getResponseHeaders().add("Content-Type", "text/event-stream");
            exchange.sendResponseHeaders(200, 0);
            try (java.io.OutputStream out = exchange.getResponseBody()) {
                out.write("event: token\ndata: {\"text\":\"Hi\"}\n\n".getBytes());
                out.flush();
            }
        });
        server.start();
        try {
            AiClient realClient = new AiClient(new AiProperties("http://127.0.0.1:" + server.getAddress().getPort(), "t"));
            when(rateLimiter.tryAcquire(eq("chat"), any(), anyString())).thenReturn(true);
            MockMvc realMvc = MockMvcBuilders
                    .standaloneSetup(new AiGatewayController(mock(AiContentService.class), realClient, rateLimiter))
                    .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                    .build();

            org.springframework.test.web.servlet.MvcResult started = realMvc.perform(post("/ai/chat")
                            .accept(MediaType.TEXT_EVENT_STREAM)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"message\":\"hi\"}"))
                    .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.request().asyncStarted())
                    .andReturn();
            started.getAsyncResult(5000);
            realMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch(started))
                    .andExpect(status().isOk())
                    .andExpect(content().string("event: token\ndata: {\"text\":\"Hi\"}\n\n"));
        } finally {
            server.stop(0);
        }
    }
}
