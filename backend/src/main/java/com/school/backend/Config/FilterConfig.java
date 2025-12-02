package com.school.backend.Config;

import com.school.backend.Util.JwtUtil;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.security.core.userdetails.UserDetailsService;

@Configuration
public class FilterConfig {

    // ON CRÉE LES FILTRES COMME DES BEANS ICI
    @Bean
    public RateLimitingFilter rateLimitingFilter() {
        return new RateLimitingFilter();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        return new JwtAuthenticationFilter(jwtUtil, userDetailsService);
    }

    // ET ON LES ENREGISTRE AVEC L'ORDRE
    @Bean
    public FilterRegistrationBean<RateLimitingFilter> rateLimitingFilterRegistration(RateLimitingFilter rateLimitingFilter) {
        FilterRegistrationBean<RateLimitingFilter> registrationBean = new FilterRegistrationBean<>(rateLimitingFilter);
        registrationBean.setOrder(Ordered.HIGHEST_PRECEDENCE); // = -2147483648 → le premier
        return registrationBean;
    }

    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> jwtAuthenticationFilterRegistration(JwtAuthenticationFilter jwtAuthenticationFilter) {
        FilterRegistrationBean<JwtAuthenticationFilter> registrationBean = new FilterRegistrationBean<>(jwtAuthenticationFilter);
        registrationBean.setOrder(Ordered.HIGHEST_PRECEDENCE + 1); // juste après rate limiting
        return registrationBean;
    }
}