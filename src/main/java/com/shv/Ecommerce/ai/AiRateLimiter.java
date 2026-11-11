package com.shv.Ecommerce.ai;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Fixed-window rate limit in Redis (INCR + EXPIRE). Protects the free LLM quota from one
 * visitor using it all. Fails open: if Redis is down, requests are allowed.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AiRateLimiter {

    static final Duration WINDOW = Duration.ofMinutes(10);
    static final int GUEST_LIMIT = 10;
    static final int USER_LIMIT = 30;

    private final StringRedisTemplate redis;

    /** @return true if the caller may make another request in the current window. */
    public boolean tryAcquire(String action, Long userId, String clientIp) {
        String who = userId != null ? "u:" + userId : "ip:" + clientIp;
        int limit = userId != null ? USER_LIMIT : GUEST_LIMIT;
        String key = "ai:rl:" + action + ":" + who;
        try {
            Long count = redis.opsForValue().increment(key);
            if (count != null && count == 1L) {
                redis.expire(key, WINDOW);
            }
            return count == null || count <= limit;
        } catch (RuntimeException e) {
            log.warn("Rate limiter unavailable, allowing request: {}", e.getMessage());
            return true;
        }
    }
}
