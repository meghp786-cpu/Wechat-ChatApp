# WeChat Chat App

A full-stack real-time chat application built with React and Node.js. The project includes account authentication, chat routes, real-time communication, and a chat-summary endpoint.

> **Project note:** The repository is named `Wechat-ChatApp`, while some internal configuration and API messages use the name `Nexus3D`. The README uses the repository name so visitors can identify the project clearly.

## Tech stack

- **Frontend:** React 18, Vite, React Router, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT and password hashing with bcrypt
- **Real-time communication:** Socket.IO
- **UI:** React Hot Toast, Framer Motion, Lucide icons
- **Additional packages:** Firebase / Firebase Admin and Google Generative AI SDK are included in the project dependencies

## Current features

- Login and sign-up pages
- Protected chat routes
- Chat and message API routes
- Real-time communication using Socket.IO
- Broadcast dashboard and broadcast API routes
- Chat-summary endpoint
- Cookie-based authentication flow

The current `server/services/aiService.js` implementation builds a lightweight summary from participants and frequent keywords. Do not assume that this particular endpoint is generating an LLM-written summary unless the implementation is updated.

## Repository structure

```text
.
├── client/       # React + Vite application
└── server/       # Express API, database models, routes and Socket.IO
```

## Getting started

### Prerequisites

- Node.js and npm
- MongoDB running locally or a MongoDB Atlas database
- Git

### 1. Clone the repository

```bash
git clone https://github.com/meghp786-cpu/Wechat-ChatApp.git
cd Wechat-ChatApp
```

### 2. Configure the backend

Create a `.env` file in `server/` and configure the values required by your environment. Typical settings used by the code include:

```dotenv
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
ALLOWED_ORIGINS=http://localhost:5173
```

Keep secrets out of Git. Use your own database connection string and a strong, unique JWT secret. Review any additional environment variables referenced by the feature or authentication code before running the application.

### 3. Install dependencies and start the backend

```bash
cd server
npm install
npm run dev
``

The backend defaults to port `5000` unless `PORT` is set.

### 4. Start the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
``

Open the local URL printed by Vite in the terminal. Ensure the frontend API configuration, backend URL, and `ALLOWED_ORIGINS` match your local setup.

## Before deploying

- Set production environment variables in your hosting provider; never commit `.env` files or credentials.
- Restrict CORS to the exact frontend origin(s).
- Confirm that uploaded files are stored appropriately and that access is controlled.
- Review authentication, authorization, input validation, and rate limiting.
- Add automated tests and document any required AI-provider credentials if those features are enabled.

## Status

This repository is a development project. Setup and deployment may require adjustments to match your local environment.

## Author

**Megh P.** — [GitHub profile](https://github.com/meghp786-cpu)
