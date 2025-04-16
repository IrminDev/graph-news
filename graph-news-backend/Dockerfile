# Stage 1: Build the application
FROM openjdk:21-jdk AS builder

WORKDIR /app

RUN microdnf install findutils

COPY build.gradle settings.gradle gradlew /app/

COPY gradle /app/gradle

RUN ./gradlew dependencies --no-daemon || true

COPY src /app/src

RUN ./gradlew build --no-daemon

# Stage 2: Run the application with Selenium
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Install dependencies for Chrome and ChromeDriver
RUN apk add --no-cache \
    chromium \
    chromium-chromedriver \
    tzdata \
    && rm -rf /var/cache/apk/*

# Set Chrome and ChromeDriver paths
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_DRIVER=/usr/bin/chromedriver

# Copy the built JAR from the builder stage
COPY --from=builder /app/build/libs/graph-news-0.0.1-SNAPSHOT.jar /app/app.jar

CMD ["java", "-Xms2g", "-Xmx4g", "-jar", "app.jar"]