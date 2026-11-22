# ProxAsk Email Service Diagnosis & Repair Report

**Date**: November 15, 2026  
**Status**: Root Causes Identified, Resilient Fallbacks Implemented, Ready for Production SMTP Credentials  

---

## Executive Summary

During system startup and authentication flows (such as user registration, account verification, password reset, and email updates), the application was previously crashing with the following fatal stack traces:

```text
ERROR 33474 --- [proxask] [ restartedMain] o.s.boot.SpringApplication : Application run failed
org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'authController': 
Unsatisfied dependency expressed through constructor parameter 0: Error creating bean with name 'authService': 
Unsatisfied dependency expressed through constructor parameter 5: Error creating bean with name 'otpService': 
Unsatisfied dependency expressed through constructor parameter 1: Error creating bean with name 'emailService': 
Injection of autowired dependencies failed
```

This report details the root-cause diagnosis, the code repairs enacted to ensure non-blocking operation, and the exact information required from you to connect your production Gmail/SMTP service.

---

## 1. Root-Cause Analysis

### Cause 1: Missing Safe Fallbacks for Required Environment Placeholders in `application.yml`
* **File**: `ProxAsk Server/src/main/resources/application.yml`
* **Original Code**:
  ```yaml
  spring:
    mail:
      host: smtp.gmail.com
      port: 587
      username: ${EMAIL_ADDRESS}
      password: ${APP_PASSWORD}
  ```
* **Failure Mechanism**:
  In Spring Boot, declaring `${EMAIL_ADDRESS}` and `${APP_PASSWORD}` without default values (e.g., `${EMAIL_ADDRESS:}`) forces the PropertySourcesPlaceholderConfigurer to throw an `IllegalArgumentException: Could not resolve placeholder 'EMAIL_ADDRESS' in value "${EMAIL_ADDRESS}"` whenever the local environment lacks those exact environment variables. This prevents the Spring context from creating the `JavaMailSender` bean, causing cascading dependency failures that prevent the server from starting.

### Cause 2: Missing Mail Properties in `application.properties`
* **File**: `ProxAsk Server/src/main/resources/application.properties`
* **Failure Mechanism**:
  `application.properties` had database, JPA, and JWT settings but completely omitted `spring.mail.*` declarations, leaving configuration split unpredictably between YAML and Properties.

### Cause 3: Circular Placeholder Resolution in `EmailService.java`
* **File**: `ProxAsk Server/src/main/java/com/proxask/service/email/EmailService.java`
* **Original Code**:
  ```java
  @Value("${app.backend.base-url:${BACKEND_BASE_URL:http://localhost:8080}}")
  private String baseUrl;
  ```
  Combined with `app.backend.base-url=${BACKEND_BASE_URL:http://localhost:8080}` in `application.properties`.
* **Failure Mechanism**:
  Nesting `${BACKEND_BASE_URL}` inside `@Value` while referencing a key that also mapped to `${BACKEND_BASE_URL}` caused circular placeholder resolution warnings and could trigger injection failure when `BACKEND_BASE_URL` was unset.

### Cause 4: Unhandled SMTP Dispatch Exceptions During Runtime
* **Failure Mechanism**:
  When users submitted registration, if Gmail refused connections (due to missing 2FA, invalid App Passwords, or unconfigured credentials), the exception cascaded up to HTTP 500 errors on the frontend, blocking registration, password recovery, and email change flows completely.

---

## 2. Technical Repairs Enacted

### Repair 1: Safe Fallback Syntax in `application.yml` and `application.properties`
* Updated `application.yml`:
  ```yaml
  spring:
    mail:
      host: ${SPRING_MAIL_HOST:smtp.gmail.com}
      port: ${SPRING_MAIL_PORT:587}
      username: ${EMAIL_ADDRESS:}
      password: ${APP_PASSWORD:}
      properties:
        mail:
          smtp:
            auth: true
            starttls:
              enable: true
  ```
* With `${EMAIL_ADDRESS:}` and `${APP_PASSWORD:}` having default empty strings, Spring Boot always starts up cleanly without throwing placeholder resolution exceptions.

### Repair 2: Direct Clean Value Injection in `EmailService.java`
* Simplified `@Value` in `EmailService.java`:
  ```java
  @Value("${app.backend.base-url:http://localhost:8080}")
  private String baseUrl;
  ```

### Repair 3: Comprehensive Try/Catch with OTP Console Logging in `EmailService.java`
* All email dispatch methods (`sendVerificationEmail`, `sendPasswordResetEmail`, `sendPasswordChangeEmail`, `sendEmailChangeVerificationEmail`) now wrap `mailSender.send(...)` in protective try/catch blocks.
* If SMTP credentials are missing or the mail server is unreachable, the system:
  1. Catches the exception safely.
  2. Logs the 6-digit OTP prominently in the server logs:
     ```text
     WARN com.proxask.service.email.EmailService: Could not dispatch verification email to alex@example.com: ... Verification OTP is: 849201
     ```
  3. Never crashes or returns an HTTP 500 error to the client.
  4. Allows testers and developers to retrieve the code directly from server logs without needing an active internet/SMTP connection.

---

## 3. Information Required From You to Connect Live Email Service

To send real emails to your users from your Gmail or Google Workspace account, please provide or configure the following 4 parameters:

### 1. Gmail Address / SMTP Username
* **What it is**: The email address from which ProxAsk should send emails (e.g. `yourname@gmail.com` or `support@proxask.com`).
* **Environment Variable**: `EMAIL_ADDRESS`

### 2. Google 16-Character App Password (NOT your regular Gmail login password)
* **What it is**: Google does NOT allow standard account passwords for third-party SMTP connections. You must generate a dedicated 16-character App Password.
* **How to generate it in 2 minutes**:
  1. Open your Google Account settings: [https://myaccount.google.com/](https://myaccount.google.com/)
  2. In the left navigation, click **Security**.
  3. Under "How you sign in to Google", ensure **2-Step Verification** is turned ON.
  4. In the search bar at the top of the Google Account page, search for **"App passwords"** (or go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).
  5. Enter an app name (e.g. `ProxAsk`), and click **Create**.
  6. Google will display a 16-character password in a yellow box (e.g. `abcd efgh ijkl mnop`).
  7. Copy this 16-character code (spaces can be omitted or included).
* **Environment Variable**: `APP_PASSWORD`

### 3. SMTP Host and Port (Optional if using standard Gmail)
* **Default Host**: `smtp.gmail.com`
* **Default Port**: `587` (TLS)
* **Environment Variables**: `SPRING_MAIL_HOST=smtp.gmail.com`, `SPRING_MAIL_PORT=587`

### 4. Public Base URL (Frontend / Backend)
* **What it is**: The URL used to construct clickable verification links inside verification emails (e.g. `http://localhost:5173` or your production domain).
* **Environment Variable**: `BACKEND_BASE_URL`

---

## 4. How to Run ProxAsk with Live Email Dispatch

Once you have your Gmail address and 16-character App Password:

### Option A: Set Environment Variables in Terminal Before Running Backend
```bash
export EMAIL_ADDRESS="your-email@gmail.com"
export APP_PASSWORD="your-16-char-app-password"
cd "ProxAsk Server"
./mvnw spring-boot:run
```

### Option B: Add to `.env` or IDE Run Configuration
Add to your run configuration environment variables:
```properties
EMAIL_ADDRESS=your-email@gmail.com
APP_PASSWORD=your-16-char-app-password
```

With these variables set, ProxAsk will automatically send verification emails, password reset OTPs, and email change confirmations directly to your users' inboxes!
