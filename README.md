# Blowtech Banking

A modern, full-stack digital banking solution featuring an Express & MongoDB backend, an interactive web dashboard, and a cross-platform React Native / Expo mobile app.

---

## 📁 Project Structure

```
├── blowtech-banking/         # Backend API server & Web Dashboard
│   ├── models/               # Mongoose data models (User, Transaction, Notification)
│   ├── routes/               # API routes
│   ├── server.js             # Express server entry point
│   ├── index.html            # Web dashboard interface
│   ├── style.css             # Dashboard styling
│   └── app.js                # Frontend client logic
│
├── blowtech-mobile/          # React Native (Expo) Mobile Application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── navigation/       # React Navigation stack & tabs
│   │   ├── screens/          # App screens (Auth, Dashboard, Analytics, Transfers, etc.)
│   │   ├── services/         # Axios API client
│   │   └── utils/            # Storage & helpers
│   ├── App.js                # Mobile app root
│   └── app.json              # Expo configuration
│
├── guidelines.md             # Design & UX guidelines
└── gemini.md                 # Product specifications
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB Atlas](https://www.mongodb.com/atlas) or local MongoDB instance
- [Expo Go](https://expo.dev/go) app (for testing on mobile)

---

### 2. Backend & Web App Setup

1. Navigate to the backend folder:
   ```bash
   cd blowtech-banking
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. Start the server:
   ```bash
   node server.js
   ```
   The backend API and web dashboard will be running at **http://localhost:5000**.

---

### 3. Mobile App Setup

1. Open a new terminal and navigate to the mobile folder:
   ```bash
   cd blowtech-mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npx expo start
   ```

4. Run the app:
   - **On Mobile:** Scan the QR code using the Expo Go app (Android) or Camera app (iOS).
   - **In Web Browser:** Press `w` in the terminal to open web mode at **http://localhost:8081**.
