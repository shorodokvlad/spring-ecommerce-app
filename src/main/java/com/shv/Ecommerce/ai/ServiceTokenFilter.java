package com.shv.Ecommerce.ai;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

/**
 * Authenticates the Python AI service on /internal/ai/** with a shared secret.
 * <p>
 * Not a {@code @Component} on purpose: it is added only to the security chain
 * (see SecurityConfig), so the servlet container doesn't register it a second time.
 * A missing or wrong token leaves the request unauthenticated, and the security
 * chain answers 401.
 */
public class ServiceTokenFilter extends OncePerRequestFilter {

    public static final String HEADER = "X-Service-Token";
    public static final String AUTHORITY = "AI_SERVICE";
    public static final String PATH_PREFIX = "/internal/ai/";

    private final AiProperties aiProperties;

    public ServiceTokenFilter(AiProperties aiProperties) {
        this.aiProperties = aiProperties;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith(PATH_PREFIX);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        // Internal endpoints never accept user JWTs: drop whatever JwtAuthFilter set.
        SecurityContextHolder.clearContext();

        String provided = request.getHeader(HEADER);
        if (aiProperties.hasServiceToken() && provided != null && tokensMatch(provided, aiProperties.serviceToken())) {
            var authentication = new UsernamePasswordAuthenticationToken(
                    "ai-service", null, List.of(new SimpleGrantedAuthority(AUTHORITY)));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        filterChain.doFilter(request, response);
    }

    private static boolean tokensMatch(String provided, String expected) {
        // Constant-time comparison so the token can't be guessed byte by byte from timing.
        return MessageDigest.isEqual(
                provided.getBytes(StandardCharsets.UTF_8),
                expected.getBytes(StandardCharsets.UTF_8));
    }
}
