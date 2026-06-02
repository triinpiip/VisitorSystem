# Visitor System

A full-stack visitor management system for registering, tracking, and managing visitors and employees.

## Features

### Authentication & Security

* JWT authentication
* Password hashing with bcrypt
* Protected API routes
* Role-based access control

### Visitor Management

* Register new visitors
* View visitor information
* Manage visitor records

### Visit Tracking

* Create and track visits
* Associate visitors with employees
* Monitor visit history

### Employee Management

* Employee directory
* Employee assignment for visits
* Employee record management

### Backend

* REST API built with Express
* Prisma ORM integration
* PostgreSQL database
* Centralized error handling
* Request validation using express-validator

---

## Tech Stack

### Frontend

* React
* React Router
* Vite

### Backend

* Node.js
* Express.js
* Prisma ORM

### Database

* PostgreSQL

### Authentication

* JWT
* bcrypt

---

## Project Structure

```text
VisitorSystem/
├── docs/
│   └── Visitor_System_API.postman_collection.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── prisma/
│
├── src/
│   ├── lib/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
├── .env.example
├── package.json
├── prisma.config.ts
└── README.md
```

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/triinpiip/VisitorSystem.git
cd VisitorSystem
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

---

## Environment Variables

Create a `.env` file in the project root.

Example:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/visitorsystem
JWT_SECRET=your_jwt_secret
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

---

## Database Setup

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Generate Prisma client:

```bash
npx prisma generate
```

---

## Running the Application

### Start backend

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:3000
```

### Start frontend

```bash
cd frontend
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## API Testing

A Postman collection is included:

```text
docs/Visitor_System_API.postman_collection.json
```

Import the collection into Postman to test the API endpoints.

---

## Authors

Triin Piip ja Johanna Jõerand
