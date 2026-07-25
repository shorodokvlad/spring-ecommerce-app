package com.shv.Ecommerce.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class MailService {
    private final JavaMailSender mailSender;

    @Value("${app.mail.from-address:${spring.mail.username:spring-boot-ecommerce@shorodokvlad.eu}}")
    private String fromAddress;

    public void send(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        String sender = (fromAddress != null && !fromAddress.isBlank())
                ? fromAddress
                : "spring-boot-ecommerce@shorodokvlad.eu";
        message.setFrom(sender);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
        log.info("Email sent to {} with subject '{}' from '{}'", to, subject, sender);
    }

    /** Send asynchronously without letting mail network latency freeze the calling HTTP thread. */
    @Async
    public void sendQuietly(String to, String subject, String body) {
        try {
            send(to, subject, body);
        } catch (Exception e) {
            log.warn("Failed to send email to {}: {}", to, e.getMessage());
            log.info("=== EMAIL SENDING FAILED (SMTP NOT CONFIGURED?) ===");
            log.info("To: {}", to);
            log.info("Subject: {}", subject);
            log.info("Body:\n{}", body);
            log.info("==================================================");
        }
    }
}
