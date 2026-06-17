# Bước 1: Sử dụng Maven kết hợp JDK 21 để biên dịch mã nguồn
FROM maven:3.9.6-eclipse-temurin-21-jammy AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Bước 2: Sử dụng JRE/JDK 21 gọn nhẹ phiên bản Alpine để chạy ứng dụng thương mại
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
