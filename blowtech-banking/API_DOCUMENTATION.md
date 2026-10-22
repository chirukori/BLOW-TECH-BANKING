# Blowtech Banking API Documentation

This backend provides a clean RESTful API designed to be consumed by both web clients (e.g., HTML/JS) and mobile clients (e.g., React Native, iOS, Android). 

## Base URL
`http://localhost:3000/api`

## Authentication
Protected routes require a JSON Web Token (JWT) sent in the `Authorization` header.
- **Header format:** `Authorization: Bearer <token>`

---

## 1. Authentication

### Register a new user
- **Endpoint:** `/auth/register`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "fullName": "Jordan Davis",
    "email": "jordan@example.com",
    "password": "password123"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "message": "User created successfully",
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "fullName": "Jordan Davis",
      "email": "jordan@example.com",
      "balance": 1000,
      "savingsGoal": 5000,
      "savingsAmount": 0,
      "createdAt": "2026-09-22T08:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```
- **Error Response (400 Bad Request):** `{ "error": "Email already exists" }`

### Login
- **Endpoint:** `/auth/login`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "jordan@example.com",
    "password": "password123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Login successful",
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```
- **Error Response (401 Unauthorized):** `{ "error": "Invalid credentials" }`

---

## 2. Account

### Get Balance & Savings
- **Endpoint:** `/account/:userId/balance`
- **Method:** `GET`
- **Auth Required:** Yes
- **Response (200 OK):**
  ```json
  {
    "balance": 12840.50,
    "savingsGoal": 5000,
    "savingsAmount": 3450
  }
  ```

### Add Money (Deposit)
- **Endpoint:** `/account/add-money`
- **Method:** `POST`
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "amount": 500.00
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Money added successfully",
    "balance": 13340.50
  }
  ```

---

## 3. Transactions

### Get Transaction History
- **Endpoint:** `/transactions/:userId`
- **Method:** `GET`
- **Auth Required:** Yes
- **Response (200 OK):**
  ```json
  [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
      "merchant": "Deposit",
      "category": "Income",
      "amount": 500,
      "icon": "plus",
      "date": "2026-09-22T08:05:00Z"
    }
  ]
  ```

### Send Money (Transfer)
- **Endpoint:** `/transactions/send`
- **Method:** `POST`
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "recipient": "alex@example.com",
    "amount": 150.00,
    "note": "Dinner last night"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "message": "Transaction successful",
    "transaction": {
      "merchant": "Alex Smith",
      "category": "Transfer",
      "amount": -150.00,
      "icon": "send"
    },
    "newBalance": 13190.50
  }
  ```
- **Error Response (400 Bad Request):** `{ "error": "Insufficient funds" }` or `{ "error": "Cannot send money to yourself" }`
- **Error Response (404 Not Found):** `{ "error": "Recipient email not found in system" }`

---

## 4. Notifications

### Get User Notifications
- **Endpoint:** `/notifications/:userId`
- **Method:** `GET`
- **Auth Required:** Yes
- **Response (200 OK):**
  ```json
  [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
      "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
      "title": "Welcome!",
      "message": "Welcome to Blowtech Banking!",
      "isRead": false,
      "createdAt": "2026-09-22T08:00:00Z"
    }
  ]
  ```

---

## React Native Mobile Component Mapping
When porting to React Native, map the existing web UI elements as follows:
- **`DashboardGrid` (Web) → `ScrollView` + `View`s (Mobile)**
- **`AuthOverlay` (Web) → `StackNavigator` Modals (Mobile)**
- **`Sidebar` (Web) → `createBottomTabNavigator` (Mobile)**
- **`TransactionsList` (Web) → `FlatList` (Mobile)**
- **Modals (Web) → Native `Modal` component or React Navigation sheets (Mobile)**
- **CSS classes** can be almost directly translated to React Native `StyleSheet` objects, keeping the same color palette.
