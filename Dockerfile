# Build frontend first (multi-stage)
FROM node:18-bullseye AS frontend-builder
WORKDIR /build/frontend

# Install frontend dependencies and build (support both with/without lock file)
COPY frontend/package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install --legacy-peer-deps --no-audit --no-fund
COPY frontend/ ./
RUN npm run build


FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build

COPY pom.xml .

RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline -B

# Copy Java sources
COPY src ./src

# Copy frontend build output into Spring Boot static resources so it is packaged in the jar
COPY --from=frontend-builder /build/frontend/dist ./src/main/resources/static

RUN --mount=type=cache,target=/root/.m2 \
    mvn package -DskipTests -B

FROM eclipse-temurin:17-jre-focal
WORKDIR /app
COPY --from=builder /build/target/FedEx-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]