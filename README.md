Visitor System
This is a web application for managing guests, visits and access cards.

Technologies
Node.js + Express, Prisma, PostgreSQL, React (Vite), JWT

How to run
Clone the project: git clone https://github.com/Vollinoomik/Test.git cd Test/visitor-backend

Install backend: npm install

Create .env file in visitor-backend: DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/visitor" JWT_SECRET="supersecret"

Run database: npx prisma migrate dev npx prisma generate

Start backend: npm run dev

Open new terminal and start frontend: cd visitor-frontend npm install npm run dev

Open browser: http://localhost:5173

Login
Create user via API: POST /api/auth/register

Example: { "username": "admin", "password": "admin123", "role": "administraator" }

Then login: POST /api/auth/login

API testing
Open Postman Import Visitor_System_API.postman_collection.json Run Auth → Login Then test endpoints

Features
Guests can be created and viewed Visits can be created, finished and deleted Cards can be assigned to guests and freed Purpose (eesmärk) can be added when assigning card Roles: administraator and employee

Notes
Backend runs on http://localhost:5000 Frontend runs on http://localhost:5173
