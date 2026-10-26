# ====================================================================
# Roomly Backend - Multi-stage Dockerfile
# Optimized for Render Web Service deployment and local Docker Compose
# ====================================================================

# 1. Build Stage
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /workspace

# Copy Maven wrapper and POM first for efficient layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw

# Resolve dependencies offline
RUN ./mvnw dependency:go-offline -B || true

# Copy source code and build production jar
COPY src/ src/
RUN ./mvnw clean package -DskipTests -B

# 2. Runtime Stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Create unprivileged system user for security
RUN groupadd -r roomly && useradd -r -g roomly -s /bin/false roomly

# Copy compiled jar from build stage
COPY --from=builder /workspace/target/roomly-backend-*.jar app.jar
RUN chown -R roomly:roomly /app

USER roomly

# Default port expected by Render (dynamically overridden by Render via $PORT)
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

# Production JVM options and startup command
ENTRYPOINT ["sh", "-c", "java -XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -Dserver.port=${PORT} -jar app.jar"]
