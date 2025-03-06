FROM openjdk:21-jdk AS builder

WORKDIR /app

RUN microdnf install findutils

COPY build.gradle.kts settings.gradle.kts gradlew /app/

COPY gradle /app/gradle

RUN ./gradlew dependencies --no-daemon || true

COPY src /app/src

RUN ./gradlew build --no-daemon

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /app/build/libs/graph-news-0.0.1-SNAPSHOT.jar /app/app.jar

CMD ["java", "-jar", "app.jar"]