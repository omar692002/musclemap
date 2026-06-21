package com.musclemap.config;

import com.musclemap.auth.AppUserDetailsService;
import com.musclemap.auth.JwtAuthenticationEntryPoint;
import com.musclemap.auth.JwtAuthenticationFilter;
import com.musclemap.auth.RestAccessDeniedHandler;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * EM2 security: stateless JWT authentication + role-based authorization.
 *
 * <p>The chain is sessionless. A {@link JwtAuthenticationFilter} authenticates
 * bearer tokens ahead of the username/password filter; the
 * {@link DaoAuthenticationProvider} (BCrypt) backs the email/password login.
 * Public endpoints (auth, meta, health, Swagger) are permitted; everything else
 * requires authentication, with {@code /coach/**} and {@code /admin/**} gated by
 * role. 401/403 are rendered as the uniform {@code ApiError} envelope.</p>
 */
@Configuration
@EnableConfigurationProperties(MuscleMapProperties.class)
public class SecurityConfig {

    private final MuscleMapProperties properties;

    public SecurityConfig(MuscleMapProperties properties) {
        this.properties = properties;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            DaoAuthenticationProvider daoAuthenticationProvider,
            JwtAuthenticationEntryPoint authenticationEntryPoint,
            RestAccessDeniedHandler accessDeniedHandler) throws Exception {

        String base = properties.getApi().basePath();

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // CORS preflight is always allowed.
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Public auth endpoints (sign up / sign in).
                        .requestMatchers(
                                base + "/auth/register",
                                base + "/auth/login",
                                base + "/auth/google").permitAll()
                        // Public platform metadata.
                        .requestMatchers(base + "/meta").permitAll()
                        // Public reference data: the exercise + muscle catalogue (EM13).
                        .requestMatchers(HttpMethod.GET, base + "/catalog/**").permitAll()
                        // Public reference data: the program-generator config (EM13).
                        .requestMatchers(HttpMethod.GET, base + "/generator/**").permitAll()
                        // Health + docs.
                        .requestMatchers("/actuator/health", "/actuator/health/**", "/actuator/info").permitAll()
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs", "/v3/api-docs/**").permitAll()
                        // Role-gated areas (controllers land here in later milestones).
                        .requestMatchers(base + "/admin/**").hasRole("ADMIN")
                        .requestMatchers(base + "/coach/**").hasAnyRole("COACH", "ADMIN")
                        // Everything else needs a valid token.
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .authenticationProvider(daoAuthenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider(
            AppUserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        // Don't leak whether it was the email or the password that was wrong.
        provider.setHideUserNotFoundExceptions(true);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(properties.getCors().allowedOrigins());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
