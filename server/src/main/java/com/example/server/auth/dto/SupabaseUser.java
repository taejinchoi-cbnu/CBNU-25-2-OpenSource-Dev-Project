package com.example.server.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
public class SupabaseUser {
    private String id;
    private String aud;
    private String role;
    private String email;
    @JsonProperty("email_confirmed_at")
    private OffsetDateTime emailConfirmedAt;
    @JsonProperty("phone")
    private String phone;
    @JsonProperty("confirmed_at")
    private OffsetDateTime confirmedAt;
    @JsonProperty("last_sign_in_at")
    private OffsetDateTime lastSignInAt;
    @JsonProperty("created_at")
    private OffsetDateTime createdAt;
    @JsonProperty("updated_at")
    private OffsetDateTime updatedAt;
}
