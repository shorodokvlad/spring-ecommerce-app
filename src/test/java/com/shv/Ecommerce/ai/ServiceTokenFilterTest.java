package com.shv.Ecommerce.ai;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ServiceTokenFilterTest {

    private static final String TOKEN = "test-service-token";

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    private Authentication runFilter(AiProperties properties, String uri, String headerValue) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", uri);
        if (headerValue != null) {
            request.addHeader(ServiceTokenFilter.HEADER, headerValue);
        }
        final Authentication[] seen = new Authentication[1];
        MockFilterChain chain = new MockFilterChain() {
            @Override
            public void doFilter(jakarta.servlet.ServletRequest req, jakarta.servlet.ServletResponse res) {
                seen[0] = SecurityContextHolder.getContext().getAuthentication();
            }
        };
        new ServiceTokenFilter(properties).doFilter(request, new MockHttpServletResponse(), chain);
        return seen[0];
    }

    @Test
    void validTokenOnInternalPathAuthenticatesAsAiService() throws Exception {
        Authentication auth = runFilter(new AiProperties("http://ai", TOKEN), "/internal/ai/products", TOKEN);

        assertThat(auth).isNotNull();
        assertThat(auth.getAuthorities()).extracting(Object::toString).containsExactly(ServiceTokenFilter.AUTHORITY);
    }

    @Test
    void wrongTokenLeavesRequestUnauthenticated() throws Exception {
        assertThat(runFilter(new AiProperties("http://ai", TOKEN), "/internal/ai/products", "nope")).isNull();
    }

    @Test
    void missingConfiguredTokenRejectsEvenEmptyHeader() throws Exception {
        assertThat(runFilter(new AiProperties("http://ai", ""), "/internal/ai/products", "")).isNull();
    }

    @Test
    void userJwtAuthenticationIsDroppedOnInternalPaths() throws Exception {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                "admin@shv.ro", null, List.of(new SimpleGrantedAuthority("ADMIN"))));

        assertThat(runFilter(new AiProperties("http://ai", TOKEN), "/internal/ai/products", null)).isNull();
    }

    @Test
    void otherPathsAreLeftAlone() throws Exception {
        var userAuth = new UsernamePasswordAuthenticationToken(
                "user@shv.ro", null, List.of(new SimpleGrantedAuthority("USER")));
        SecurityContextHolder.getContext().setAuthentication(userAuth);

        assertThat(runFilter(new AiProperties("http://ai", TOKEN), "/product/get-all", TOKEN)).isSameAs(userAuth);
    }
}
