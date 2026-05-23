# Ancienne ligne : FROM openjdk:17-jdk-slim
FROM eclipse-temurin:17-jdk

WORKDIR /app
COPY target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]