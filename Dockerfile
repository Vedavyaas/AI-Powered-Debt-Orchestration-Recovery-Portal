FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /build

COPY pom.xml .

RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline -B

COPY src ./src

RUN --mount=type=cache,target=/root/.m2 \
    mvn package -DskipTests -B

FROM eclipse-temurin:17-jre-focal

WORKDIR /app

COPY --from=builder /build/target/FedEx-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 4040

ENTRYPOINT ["java", "-jar", "app.jar"]