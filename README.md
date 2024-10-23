# Messaging App Backend

<p align="center">
  <img src="https://res.cloudinary.com/dy0av590l/image/upload/v1729663614/Screenshot_from_2024-10-23_08-06-43_r9np75.png" alt="Messaging App screenshot" width="800"/>
</p>

A messaging app inspired by Telegram and WhatsApp, featuring real-time updates with sockets, secure authentication, media uploads, and customizable profiles.

## 🔗 Links

- **Live Demo:** [https://messaging-app-frontend-gamma.vercel.app/chats](https://messaging-app-frontend-gamma.vercel.app)
- **Frontend Repository:** [https://github.com/SamuelFerfort/messaging-app-frontend](https://github.com/SamuelFerfort/messaging-app-frontend)

## 🚀 Technologies

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JSON Web Tokens (JWT)
- **File Uploads:** Cloudinary

## 🌟 Features

- **User Authentication:** Secure registration and login using JWT.
- **Post Management:** Create, read, update, and delete posts with media attachments.
- **Media Uploads:** Handle image uploads via Cloudinary.
- **Create groups:** Enable users to create groups with multiple users.
- **Database Management:** Efficient data handling with Prisma ORM and PostgreSQL.
- **API Security:** Protect routes and ensure secure data transactions.

## 🔧 Setup

### 1. **Clone the Repository:**

```bash
git clone https://github.com/SamuelFerfort/x-clone-backend.git
cd x-clone-backend
```

### 2. **Install Dependencies:**

```bash
npm install
```

### 3. **Configure Environment Variables:**

```
DATABASE_URL=your_database_key
CLOUDINARY_API_KEY=cloudinary_api_key
CLOUDINARY_CLOUD_NAME=cloudinary_cloud_name
CLOUDINARY_API_SECRET=cloudinary_api_secret
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=your_client_url
```

### 4. **Set up the Database:**

```bash
npx prisma migrate dev --name init
```

### 5. **Start the Server:**

```bash
npm run devStart
```

The server should now be running on http://localhost:3000.

## 🎯 Goals

 The goal of this project is to practice building scalable APIs with Node.js and Express, integrating real-time communication with sockets, and implementing secure authentication and database schema and management for CRUD operations using Prisma ORM and PostgreSQL.


 ## 📄 License

This project is licensed under the [MIT License](LICENSE).