# ---- Build Stage ----
FROM eclipse-temurin:23-jdk AS builder
WORKDIR /app

COPY gradlew .
COPY ./gradle ./gradle/
COPY build.gradle .
COPY settings.gradle .
COPY src ./src

RUN chmod +x ./gradlew
RUN ./gradlew build --no-daemon -x test

# ---- Production Stage ----
FROM eclipse-temurin:23-jre-alpine
WORKDIR /app

COPY --from=builder /app/build/libs/server-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
