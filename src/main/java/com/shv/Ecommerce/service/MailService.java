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

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    @Value("${app.mail.from-address:${spring.mail.username:vlad.shorodoc@gmail.com}}")
    private String fromAddress;

    public void send(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        String sender = (fromAddress != null && !fromAddress.isBlank()) ? fromAddress : smtpUsername;
        if (sender == null || sender.isBlank()) {
            sender = "vlad.shorodoc@gmail.com";
        }
        message.setFrom(sender);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        
        try {
            mailSender.send(message);
            log.info("Email sent to {} with subject '{}' from '{}'", to, subject, sender);
        } catch (Exception e) {
            // If custom sender failed on Gmail SMTP (e.g. cloud IP domain restrictions), retry with authenticated account
            if (smtpUsername != null && !smtpUsername.isBlank() && !smtpUsername.equalsIgnoreCase(sender)) {
                log.warn("Sending with sender='{}' failed ({}), retrying with authenticated address '{}'", sender, e.getMessage(), smtpUsername);
                message.setFrom(smtpUsername);
                mailSender.send(message);
                log.info("Email sent to {} with fallback sender '{}'", to, smtpUsername);
            } else {
                throw e;
            }
        }
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
