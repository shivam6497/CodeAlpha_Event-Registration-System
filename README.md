# ◈ Evently — Event Registration System

A full-stack Event Registration System built with **Express.js + TypeScript**, **MongoDB**, and **React + Vite + TypeScript**.

---

## 📁 Project Structure

```
event-registration/
├── server/                        # Express + TypeScript backend
│   ├── src/
│   │   ├── types/index.ts         # Shared TypeScript interfaces
│   │   ├── models/
│   │   │   ├── User.ts            # User schema (name, email, password, role)
│   │   │   ├── Event.ts           # Event schema (title, date, capacity, etc.)
│   │   │   └── Registration.ts    # Registration schema (user ↔ event link)
│   │   ├── middleware/auth.ts     # JWT protect + adminOnly middleware
│   │   ├── routes/
│   │   │   ├── auth.ts            # /api/auth (register, login, me)
│   │   │   ├── events.ts          # /api/events (CRUD)
│   │   │   └── registrations.ts   # /api/registrations (register, cancel, list)
│   │   └── index.ts               # Express app entry point
│   ├── tsconfig.json
│   ├── .env.example
│   └── package.json
├── client/                        # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── api/axios.ts           # Axios instance with JWT interceptor
│   │   ├── context/AuthContext.tsx # Global auth state (login/register/logout)
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── EventCard.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/
│   │   │   ├── Events.tsx         # Browse & search events
│   │   │   ├── EventDetail.tsx    # Event details + register button
│   │   │   ├── MyRegistrations.tsx # View & cancel registrations
│   │   │   ├── AdminPanel.tsx     # Create & manage events (admin only)
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

---

## ⚙️ Prerequisites

- **Node.js** v16+
- **MongoDB** running locally on port 27017
  - Install: https://www.mongodb.com/docs/manual/installation/
  - Or use MongoDB Atlas (free cloud tier)

---

## 🚀 Setup & Run

### 1. Configure environment

```bash
cd server
cp .env.example .env
# Edit .env — change JWT_SECRET to something secret!
```

`.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eventregistration
JWT_SECRET=change_this_to_a_random_secret
JWT_EXPIRES_IN=7d
```

### 2. Install dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 3. Run

**Terminal 1 — Backend:**
```bash
cd server
npm run dev       # ts-node-dev → http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev       # Vite → http://localhost:3000
```

---

## 👑 Creating an Admin User

1. Register via the UI or `POST /api/auth/register`
2. Promote to admin via MongoDB shell:

```js
// in mongosh
use eventregistration
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

3. Log out and log back in — the **Admin** link appears in the navbar.

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | User | Get own profile |

### Events
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/events` | — | List events (search, category, paginate) |
| GET | `/api/events/categories` | — | Get distinct categories |
| GET | `/api/events/:id` | — | Get event details |
| POST | `/api/events` | Admin | Create event |
| PUT | `/api/events/:id` | Admin | Update event |
| DELETE | `/api/events/:id` | Admin | Deactivate event (soft delete) |

### Registrations
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/registrations` | User | Register for an event |
| GET | `/api/registrations/my` | User | Get my registrations |
| DELETE | `/api/registrations/:id` | User | Cancel a registration |
| GET | `/api/registrations/admin/all` | Admin | All registrations |
| GET | `/api/registrations/admin/event/:id` | Admin | Registrations for specific event |

---

## 🎨 Features

- **JWT Authentication** — secure login/register with role-based access
- **Event Browsing** — search by title, filter by category, paginated grid
- **Registration Flow** — register/cancel with capacity enforcement
- **Click-to-track** — real-time capacity bar on each event
- **Admin Panel** — create events, view all events, deactivate events
- **My Tickets** — users see confirmed/cancelled registrations
- **Dark UI** — Space Grotesk + Space Mono, fully responsive
