package com.example.server.user.entity;

import com.example.server.board.entity.Comment;
import com.example.server.board.entity.Post;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.persistence.*;
import lombok.Getter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users", schema = "auth")
@Getter
public class User {

    @Id
    private UUID id;

    private String email;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_user_meta_data")
    private JsonNode rawUserMetaData;

    @OneToMany(mappedBy = "author", fetch = FetchType.LAZY)
    private List<Post> posts;

    @OneToMany(mappedBy = "author", fetch = FetchType.LAZY)
    private List<Comment> comments;

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
