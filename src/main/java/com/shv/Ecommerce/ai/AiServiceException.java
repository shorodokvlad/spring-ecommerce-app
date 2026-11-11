package com.shv.Ecommerce.ai;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/** The AI service failed or is unreachable; carries the status to return to the browser. */
@Getter
public class AiServiceException extends RuntimeException {
    private final HttpStatus status;

    public AiServiceException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public AiServiceException(HttpStatus status, String message, Throwable cause) {
        super(message, cause);
        this.status = status;
    }
}
