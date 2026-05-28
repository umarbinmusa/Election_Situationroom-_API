# Election Situation Room API

A GraphQL-based backend system for monitoring, reporting, and managing election incidents in real time.

This platform is designed for election observers, coordinators, analysts, media personnel, and administrators to track election-related activities securely and efficiently.

---

# Features

* User Authentication with JWT
* Role-Based Access Control (RBAC)
* Incident Reporting System
* Incident Status Management
* Secure Password Hashing using Argon2
* GraphQL API with Apollo Server
* MongoDB Database Integration
* Protected Queries and Mutations
* User Management for Admins

---

# User Roles

The system supports multiple user roles:

* ADMIN
* COORDINATOR
* OBSERVER
* SECURITY
* ANALYST
* MEDIA

---

# Tech Stack

## Backend

* Node.js
* Express.js
* Apollo Server
* GraphQL
* MongoDB
* Mongoose

## Authentication & Security

* JWT (JSON Web Token)
* Argon2 Password Hashing

---

# Project Structure

```bash
src/
│
├── graphql/
│   ├── resolvers/
│   │   └── index.js
│   │
│   └── typeDefs/
│       └── index.js
│
├── middleware/
│   └── auth.js
│
├── models/
│   ├── user.js
│   └── incident.js
│
├── app.js
├── server.js
└── .env
```

---

# Installation

## Clone the Repository

```bash
git clone https://github.com/yourusername/election-situation-room-api.git
```

## Navigate into the project

```bash
cd election-situation-room-api
```

## Install Dependencies

```bash
npm install
```

---

# Environment Variables

Create a `.env` file in the root directory.

```env
PORT=4000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET_KEY=your_secret_key
```

---

# Running the Server

## Development Mode

```bash
npm run dev
```

## Production Mode

```bash
npm start
```

Server runs on:

```bash
http://localhost:4000/graphql
```

---

# GraphQL Operations

# Authentication

## Signup

```graphql
mutation {
  signup(
    username: "admin"
    password: "123456"
    role: "ADMIN"
    email: "admin@gmail.com"
    full_name: "System Admin"
  ) {
    token
    user {
      id
      username
      role
    }
  }
}
```

---

## Login

```graphql
mutation {
  login(
    username: "admin"
    password: "123456"
  ) {
    token
    user {
      username
      role
    }
  }
}
```

---

# Incident Management

## Create Incident

```graphql
mutation {
  createIncident(
    title: "Violence at Polling Unit"
    description: "Fight between party agents"
    category: "VIOLENCE"
    location: "Lagos"
  ) {
    id
    title
    status
  }
}
```

---

## Get All Incidents

```graphql
query {
  getIncidents {
    id
    title
    description
    category
    status
    location
  }
}
```

---

## Update Incident Status

```graphql
mutation {
  updateIncidentStatus(
    id: "INCIDENT_ID"
    status: "VERIFIED"
  ) {
    id
    status
  }
}
```

---

## Delete Incident

```graphql
mutation {
  deleteIncident(id: "INCIDENT_ID")
}
```

---

# Security Features

* JWT Authentication
* Role-Based Authorization
* Password Hashing with Argon2
* Protected Admin Routes
* Secure GraphQL Context Authentication

---

# Future Improvements

* Real-Time GraphQL Subscriptions
* WebSocket Notifications
* Live Election Dashboard
* File/Image Uploads
* Geo-location Tracking
* SMS & Email Alerts
* Polling Unit Management
* Analytics Dashboard
* AI-Based Incident Detection
* Audit Logging

---

# API Architecture

The API follows a modular architecture:

* Models → Database Structure
* TypeDefs → GraphQL Schema
* Resolvers → Business Logic
* Middleware → Authentication & Authorization

---

# Author

Developed by Musa Umar

---

# License

This project is licensed under the MIT License.
