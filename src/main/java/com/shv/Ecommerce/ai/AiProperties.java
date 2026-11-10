package com.shv.Ecommerce.ai;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Settings for the Python AI service (SHV Assistant).
 *
 * @param serviceUrl   base URL of the AI service, e.g. http://localhost:8000
 * @param serviceToken shared secret sent/checked in the {@code X-Service-Token} header.
 *                     When blank, the /internal/ai/** endpoints reject every request.
 */
@ConfigurationProperties(prefix = "ai")
public record AiProperties(String serviceUrl, String serviceToken) {

    public boolean hasServiceToken() {
        return serviceToken != null && !serviceToken.isBlank();
    }
}
