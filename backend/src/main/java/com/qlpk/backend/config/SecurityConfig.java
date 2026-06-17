package com.qlpk.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // Thêm JWT filter TRƯỚC UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> auth
                // Public endpoints - không cần xác thực
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html", "/api-docs/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/taikhoan/login", "/api/taikhoan/forgot-password/**", "/api/taikhoan/first-time-change-password").permitAll()
                .requestMatchers("/ws/**", "/api/payment/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/appointments/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/appointments/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/appointments/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/appointments/**").authenticated()
                // Endpoint thay đổi mật khẩu cần xác thực
                .requestMatchers(HttpMethod.PUT, "/api/taikhoan/*/change-password").authenticated()
                // Admin endpoints
                .requestMatchers("/api/taikhoan/**", "/api/nhan-vien/**").hasRole("QUAN_TRI_VIEN")
                // Cashier endpoints - thanh toán
                .requestMatchers(HttpMethod.POST, "/api/hoa-don/*/thanh-toan").hasAnyRole("THU_NGAN", "QUAN_TRI_VIEN", "LE_TAN")
                // Receptionist endpoints - full check-in
                .requestMatchers(HttpMethod.POST, "/api/phieu-kham/full-check-in").authenticated()
                // Assistant endpoints - accept patient (dùng authority để hỗ trợ TRO_LY_RHM, TRO_LY_TMH...)
                .requestMatchers(HttpMethod.POST, "/api/phieu-kham/accept-patient/**").authenticated()
                // Doctor/Assistant endpoints
                .requestMatchers(HttpMethod.POST, "/api/phieu-kham/**").authenticated()
                // Tất cả các API còn lại cần xác thực
                .anyRequest().authenticated()
            )
            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable());
        return http.build();
    }
}