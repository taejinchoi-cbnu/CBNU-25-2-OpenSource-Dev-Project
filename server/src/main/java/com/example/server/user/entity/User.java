package com.example.server.user.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.persistence.Column;
import jakarta.persistence.Id;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

public class User {
    @Id
    private UUID id;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_user_meta_data")
    private JsonNode rawUserMetaData;

    public String getNickname() {
        if (this.rawUserMetaData != null && this.rawUserMetaData.has("nickname")) {
            return this.rawUserMetaData.get("nickname").asText();
        }

        return "익명";
    }

    public void updateNickname(String newNickname) {
        if (this.rawUserMetaData instanceof ObjectNode) {
            ((ObjectNode) this.rawUserMetaData).put("nickname", newNickname);
        }
    }

}
