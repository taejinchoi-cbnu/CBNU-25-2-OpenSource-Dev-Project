package com.example.server.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "supabase")
public class SupabaseProperties {
    private String url;
    private String anonKey;
    private String serviceRoleKey;
    private String jwksUrl;
    private boolean cookieSecure;

    public boolean isCookieSecure() {
        return cookieSecure;
    }
}