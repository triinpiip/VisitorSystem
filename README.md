# Visitor System

Visitor System is a full-stack web application for managing guests, visits and access cards.

## Technologies

- Backend: Node.js + Express
- Database ORM: Prisma
- Database: PostgreSQL
- Frontend: React + Vite
- Routing: React Router
- State management: Context API (`AuthContext`)
- Authentication: JWT + bcrypt
- API style: REST
- API documentation/testing: Postman Collection

## Main features

- User registration and login
- JWT authentication
- Private frontend routes with `ProtectedRoute`
- Role-based backend authorization with `roleMiddleware`
- At least two user roles, for example `administraator` and employee/user roles
- Guests CRUD
- Visits CRUD
- Access card listing, assigning and freeing
- Department and employee data loading
- Error handling with HTTP status codes and JSON error messages
- Basic form validation in backend routes

## How to run

Clone the project:

```bash
git clone https://github.com/triinpiip/VisitorSystem.git
cd VisitorSystem
```

Install backend dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL=...
JWT_SECRET=...

Run database migrations and generate Prisma client:

```bash
npx prisma migrate dev
npx prisma generate
```

Start backend:

```bash
npm run dev
```

Open a new terminal and start frontend:

```bash
cd visitor-frontend
npm install
npm run dev
```

Open frontend:

```text
http://localhost:5173
```

Backend runs on:

```text
http://localhost:5000
```

## Authentication

Create a user:

```http
POST /api/auth/register
```

Example body:

```json
{
  "username": "admin3",
  "password": "Admin123",
  "role": "administraator",
  "email": "admin@example.com"
}
```

Login:

```http
POST /api/auth/login
```

Example body:

```json
{
  "username": "admin3",
  "password": "Admin123"
}
```

The login response returns a JWT token. Protected API requests must include:

```http
Authorization: Bearer <token>
```

## API documentation

Import this file into Postman:

```text
Visitor_System_API.postman_collection.json
```

Recommended testing order:

1. Auth → Register
2. Auth → Login
3. Guests / Cards / Visits endpoints

## Requirement coverage

| Requirement | Covered by |
|---|---|
| Authentication | `/api/auth/register`, `/api/auth/login`, JWT |
| Authorization | `authMiddleware`, `roleMiddleware` |
| Private routes | `ProtectedRoute` |
| ORM | Prisma |
| Database | PostgreSQL |
| CRUD API | Guests, visits, cards |
| Reactive UI | React components |
| State management | Context API |
| API requests | REST API calls from frontend |
| Error handling | Centralized error handler middleware |
| Form validation | Required-field checks in backend routes |
| User roles | Role table and role middleware |
| API docs | Postman collection |