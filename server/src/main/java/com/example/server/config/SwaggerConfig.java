package com.mysite.server.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        Info info = new Info()
                .title("오픈소스개발프로젝트 API")
                .version("v0.0.1")
                .description("오픈소스개발프로젝트의 API 명세서");
        return new OpenAPI()
                .info(info);
    }
}
