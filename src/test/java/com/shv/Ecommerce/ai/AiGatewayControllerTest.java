package com.shv.Ecommerce.ai;

import com.shv.Ecommerce.dto.Response;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AiGatewayControllerTest {

    private final AiContentService contentService = mock(AiContentService.class);
    private final AiClient aiClient = mock(AiClient.class);
    private final AiRateLimiter rateLimiter = mock(AiRateLimiter.class);
    private final AiGatewayController controller = new AiGatewayController(contentService, aiClient, rateLimiter);

    @Test
    void askTrimsQuestionAndPassesThroughJson() {
        when(rateLimiter.tryAcquire(eq("ask"), any(), anyString())).thenReturn(true);
        when(aiClient.ask(12L, "Has it 5G?")).thenReturn("{\"answer\":\"Yes\"}");

        ResponseEntity<?> response = controller.ask(12L, new AiGatewayController.AskRequest("  Has it 5G?  "),
                null, new MockHttpServletRequest());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo("{\"answer\":\"Yes\"}");
    }

    @Test
    void askRejectsTooShortOrTooLongQuestionsWithoutCallingTheAi() {
        ResponseEntity<?> tooShort = controller.ask(1L, new AiGatewayController.AskRequest(" a "), null,
                new MockHttpServletRequest());
        ResponseEntity<?> tooLong = controller.ask(1L, new AiGatewayController.AskRequest("x".repeat(301)), null,
                new MockHttpServletRequest());
        ResponseEntity<?> missing = controller.ask(1L, null, null, new MockHttpServletRequest());

        assertThat(tooShort.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(tooLong.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(missing.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(aiClient, never()).ask(any(), any());
    }

    @Test
    void askIsRateLimited() {
        when(rateLimiter.tryAcquire(eq("ask"), any(), anyString())).thenReturn(false);

        ResponseEntity<?> response = controller.ask(1L, new AiGatewayController.AskRequest("Is it waterproof?"),
                null, new MockHttpServletRequest());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
        verify(aiClient, never()).ask(any(), any());
    }

    @Test
    void aiErrorsKeepTheirStatus() {
        ResponseEntity<Response> response = controller.handleAiError(
                new AiServiceException(HttpStatus.SERVICE_UNAVAILABLE, "waking up"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(response.getBody().getMessage()).isEqualTo("waking up");
    }

    @Test
    void clientIpUsesTheLastForwardedEntry() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("10.0.0.1");
        assertThat(AiGatewayController.clientIp(request)).isEqualTo("10.0.0.1");

        request.addHeader("X-Forwarded-For", "6.6.6.6, 203.0.113.7");
        assertThat(AiGatewayController.clientIp(request)).isEqualTo("203.0.113.7");
    }

    @Test
    @SuppressWarnings("unchecked")
    void chatStreamsTheAiServiceAndSendsTheGuestPayload() throws Exception {
        when(rateLimiter.tryAcquire(eq("chat"), any(), anyString())).thenReturn(true);
        byte[] sse = "event: token\ndata: {\"text\":\"Hi\"}\n\n".getBytes(StandardCharsets.UTF_8);
        ArgumentCaptor<Map<String, Object>> payload = ArgumentCaptor.forClass(Map.class);
        when(aiClient.openChat(payload.capture())).thenReturn(new ByteArrayInputStream(sse));

        ResponseEntity<?> response = controller.chat(
                new AiGatewayController.ChatRequest("  phones?  ", "123e4567-e89b-12d3-a456-426614174000", 7L),
                null, new MockHttpServletRequest());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getHeaders().getContentType()).isEqualTo(MediaType.TEXT_EVENT_STREAM);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ((StreamingResponseBody) response.getBody()).writeTo(out);
        assertThat(out.toByteArray()).isEqualTo(sse);

        assertThat(payload.getValue())
                .containsEntry("message", "phones?")
                .containsEntry("session_id", "123e4567-e89b-12d3-a456-426614174000")
                .containsEntry("user_id", null)
                .containsEntry("page", Collections.singletonMap("product_id", 7L));
    }

    @Test
    @SuppressWarnings("unchecked")
    void chatDropsMalformedSessionIdsAndBadProductIds() {
        when(rateLimiter.tryAcquire(eq("chat"), any(), anyString())).thenReturn(true);
        ArgumentCaptor<Map<String, Object>> payload = ArgumentCaptor.forClass(Map.class);
        when(aiClient.openChat(payload.capture())).thenReturn(new ByteArrayInputStream(new byte[0]));

        controller.chat(new AiGatewayController.ChatRequest("hi", "'; drop table", -3L), null, new MockHttpServletRequest());

        assertThat(payload.getValue())
                .containsEntry("session_id", null)
                .containsEntry("page", Collections.singletonMap("product_id", null));
    }

    @Test
    void chatValidatesAndRateLimitsBeforeCallingTheAi() {
        ResponseEntity<?> empty = controller.chat(new AiGatewayController.ChatRequest("   ", null, null), null,
                new MockHttpServletRequest());
        ResponseEntity<?> tooLong = controller.chat(new AiGatewayController.ChatRequest("x".repeat(1001), null, null),
                null, new MockHttpServletRequest());
        when(rateLimiter.tryAcquire(eq("chat"), any(), anyString())).thenReturn(false);
        ResponseEntity<?> limited = controller.chat(new AiGatewayController.ChatRequest("hi", null, null), null,
                new MockHttpServletRequest());

        assertThat(empty.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(tooLong.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(limited.getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
        verify(aiClient, never()).openChat(any());
    }

    @Test
    void feedbackIsValidatedAndForwarded() {
        String session = "123e4567-e89b-12d3-a456-426614174000";

        assertThat(controller.chatFeedback(new AiGatewayController.FeedbackRequest(session, 5L, 1)).getStatusCode())
                .isEqualTo(HttpStatus.NO_CONTENT);
        verify(aiClient).chatFeedback(Map.of("session_id", session, "message_id", 5L, "rating", 1));

        assertThat(controller.chatFeedback(new AiGatewayController.FeedbackRequest(session, 5L, 3)).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(controller.chatFeedback(new AiGatewayController.FeedbackRequest("nope", 5L, 1)).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);

        doThrow(new AiServiceException(HttpStatus.NOT_FOUND, "Product not found")).when(aiClient).chatFeedback(any());
        assertThat(controller.chatFeedback(new AiGatewayController.FeedbackRequest(session, 9L, -1)).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }
}
