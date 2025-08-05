
# 🟢 Proxask – Where questions meet conversations

**ProxAsk** is a social web application that lets users create profiles, receive anonymous questions, follow others, and chat in real time. With follower notifications and interactive Q&A features, it blends curiosity with connection in a secure and user-friendly way.

---

## 📌 Features

- 🧑‍💼 User Registration & Login (JWT-based authentication)
- 🔐 Secure endpoints with Spring Security
- 🙋 Anonymous question submission
- 📨 Real-time chat system (MongoDB-based)
- 🔔 Notification system for followers
- 👥 Follower and following system
- 🌐 Public profile view for any user
- 🧹 Clean separation of concerns (Controller → Service → Repository)
- 🔄 Refresh token support (optional)

---

## 🛠 Tech Stack

### 🔷 Backend (Spring Boot)
- Java 17
- Spring Boot 3.x
- Spring Security + JWT
- Spring Data JPA (MySQL)
- Spring Data MongoDB
- Lombok
- Maven

### 🔶 Frontend (Planned)
- React.js
- Axios
- React Router
- Redux Toolkit (optional)

### 🗃️ Database
- MySQL (for relational data like users, questions, followers)
- MongoDB (for unstructured data like chat, messages, notifications)

---

## 🧾 Folder Structure (Backend)

```

proxask-backend/
├── src/
│   ├── main/
│   │   ├── java/com/proxask/
│   │   │   ├── ProxaskApplication.java
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   ├── entity/
│   │   │   ├── model/
│   │   │   ├── repository/
│   │   │   ├── service/
│   │   │   └── exception/
│   │   └── resources/
│   │       ├── application.properties
├── pom.xml

````

---

## ⚙️ Modules & Structure Overview

### 1. `config/`
- JWT filter and utility
- Spring Security configuration
- CORS config

### 2. `controller/`
- All REST endpoints:
  - `AuthController`
  - `UserController`
  - `QuestionController`
  - `FollowController`
  - `ChatController`
  - `NotificationController`

### 3. `entity/` (MySQL)
- `User`, `Role`, `Question`, `Follow`, `RefreshToken`

### 4. `model/` (MongoDB)
- `Chat`, `Message`, `Notification`

### 5. `dto/`
- Structured Request and Response classes per module

### 6. `repository/`
- `JpaRepository` and `MongoRepository` interfaces

### 7. `service/`
- Business logic layer for each module

### 8. `exception/`
- Global exception handler and custom exceptions

---
## 🚀 Future Enhancements

* React frontend (UI/UX for all features)
* WebSocket support for real-time messaging
* Profile image upload (Cloud storage)
* Email verification and password reset
* Admin dashboard for moderation

---

## 🤝 Contributing

Contributions are welcome! Please open issues or submit PRs with improvements or bug fixes.

---

## 🙋 Contact

Have questions or suggestions? Reach out to:

* 📧 Email: rajprince031@gmail.com
* 🌐 GitHub: https://github.com/rajprince031/proxask

