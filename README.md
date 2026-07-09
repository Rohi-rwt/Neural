# ⚡ NeuralPath — AI Smart Learning & Career Preparation Platform

A full-stack AI-powered EdTech SaaS platform combining LeetCode-style DSA practice, ChatGPT-style AI tutoring, mock test engine, DSA visualizer, interview prep, and gamification.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, Framer Motion, Three.js |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + Google OAuth |
| AI | Anthropic Claude API (claude-sonnet-4-6) |
| Cache | Redis |
| Real-time | Socket.io |
| Payments | Razorpay / Stripe |

## 📁 Project Structure

```
neuralpath/
├── frontend/          # React + Vite SPA
│   └── src/
│       ├── components/
│       │   ├── layout/       # Sidebar, Topbar, Layout
│       │   ├── ai/           # AI Tutor chat, code panel
│       │   ├── dsa/          # Problem list, visualizer
│       │   ├── aptitude/     # Aptitude solver
│       │   ├── interview/    # Interview simulator
│       │   ├── test/         # Mock test engine
│       │   ├── progress/     # Dashboard, analytics
│       │   ├── admin/        # Admin panel
│       │   └── common/       # Shared UI components
│       ├── pages/            # Route-level page components
│       ├── hooks/            # Custom React hooks
│       ├── services/         # API service layer
│       ├── store/            # Zustand state management
│       └── utils/            # Helpers, constants
│
├── backend/           # Node.js + Express API
│   └── src/
│       ├── controllers/      # Route handlers (MVC)
│       ├── models/           # Mongoose schemas
│       ├── routes/           # Express routers
│       ├── middleware/       # Auth, rate-limit, error handlers
│       ├── services/         # AI, email, payment services
│       ├── config/           # DB, Redis, env config
│       └── utils/            # Helpers
│
└── shared/            # Shared types/constants
```

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (optional, for caching)
- Anthropic API key

### 1. Clone & Install

```bash
git clone <repo-url>
cd neuralpath

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Environment Variables

**Backend** — copy `backend/.env.example` → `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/neuralpath
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
REDIS_URL=redis://localhost:6379
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend** — copy `frontend/.env.example` → `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Seed Database

```bash
cd backend
npm run seed        # Seeds questions, topics, test templates
npm run seed:admin  # Creates default admin user
```

### 4. Run Development

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:5000/api  
API Docs: http://localhost:5000/api-docs

### 5. Production Build

```bash
cd frontend && npm run build
cd backend && npm start
```

## 🐳 Docker Setup

```bash
docker-compose up --build
```

## 🔑 Default Admin Credentials

```
Email: admin@neuralpath.in
Password: Admin@123
```

## 📡 API Endpoints

| Module | Base Route |
|--------|-----------|
| Auth | `/api/auth` |
| Users | `/api/users` |
| Problems | `/api/problems` |
| Topics | `/api/topics` |
| Tests | `/api/tests` |
| AI Tutor | `/api/ai` |
| Progress | `/api/progress` |
| Admin | `/api/admin` |
| Subscriptions | `/api/subscriptions` |

## 🎮 Features

- ✅ AI Tutor with 3 modes (Teacher, Interviewer, Hint)
- ✅ DSA Problem Bank (500+ problems)
- ✅ Aptitude Practice (Quant, Reasoning, Verbal)
- ✅ Mock Test Engine with timer + auto-scoring
- ✅ DSA Visualizer (Sorting, Trees, Graphs)
- ✅ Interview Simulator with AI scoring
- ✅ Progress tracking + heatmap
- ✅ XP & Leveling system
- ✅ Badges & Achievements
- ✅ Global Leaderboard
- ✅ AI-generated 7/30/90-day roadmaps
- ✅ Admin panel with analytics
- ✅ Subscription system (Free/Pro)
- ✅ PWA support
- ✅ Dark/Light mode
