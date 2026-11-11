package com.shv.Ecommerce.ai;

import com.shv.Ecommerce.dto.Response;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
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
}
