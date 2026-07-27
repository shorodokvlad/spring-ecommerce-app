package com.shv.Ecommerce.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
@Slf4j
public class MailService {

    @Value("${resend.api.key:${RESEND_API_KEY:}}")
    private String resendApiKey;

    @Value("${resend.from:${RESEND_FROM:onboarding@resend.dev}}")
    private String fromAddress;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public void send(String to, String subject, String body) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            log.warn("RESEND_API_KEY is not configured in properties or environment variables.");
            log.info("=== SIMULATED EMAIL TO {} ===", to);
            log.info("Subject: {}", subject);
            log.info("Body:\n{}", body);
            log.info("===============================");
            return;
        }

        try {
            String sender = (fromAddress != null && !fromAddress.isBlank()) ? fromAddress : "onboarding@resend.dev";

            // Format body into HTML with clean typography
            String htmlBody = buildHtmlBody(subject, body);

            // Construct JSON payload
            String jsonPayload = String.format(
                    "{\"from\":\"%s\",\"to\":[\"%s\"],\"subject\":\"%s\",\"text\":\"%s\",\"html\":\"%s\"}",
                    escapeJson(sender),
                    escapeJson(to),
                    escapeJson(subject),
                    escapeJson(body),
                    escapeJson(htmlBody)
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + resendApiKey.trim())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Successfully sent email to {} via Resend API (status {})", to, response.statusCode());
            } else {
                log.error("Failed to send email via Resend API to {}. Status: {}, Body: {}", to, response.statusCode(), response.body());
                throw new RuntimeException("Resend API error: " + response.body());
            }
        } catch (Exception e) {
            log.error("Error sending email via Resend to {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    /** Converts text to clean HTML format */
    private String buildHtmlBody(String subject, String body) {
        String formattedContent = body.replace("\n", "<br>");

        return "<div style=\"font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;\">"
                + "<h2 style=\"color: #1f4e63; margin-top: 0; font-size: 1.4rem;\">" + escapeHtml(subject) + "</h2>"
                + "<div style=\"font-size: 0.95rem; line-height: 1.6; color: #475569;\">" + formattedContent + "</div>"
                + "<hr style=\"border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 16px 0;\" />"
                + "<p style=\"font-size: 0.8rem; color: #94a3b8; margin: 0;\">SHV Store — Automated Notification</p>"
                + "</div>";
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    /** Send asynchronously without blocking the calling HTTP request thread. */
    @Async
    public void sendQuietly(String to, String subject, String body) {
        try {
            send(to, subject, body);
        } catch (Exception e) {
            log.warn("Failed to send email quietly to {}: {}", to, e.getMessage());
        }
    }
}
