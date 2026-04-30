🚀 QuickAI – AI SaaS Platform

QuickAI is a full-stack AI SaaS platform built for learning real-world production architecture.
It implements custom authentication, subscription billing, and usage enforcement without relying on third-party auth providers like Clerk.

This project focuses on how real SaaS products are built, with a heavy emphasis on horizontal scalability and state management.

✨ Features
🔐 Authentication
- Google OAuth 2.0 (Authorization Code Flow)
- Custom JWT-based authentication
- **Real-time Identity Verification**: JWT serves as a session snapshot, but the backend performs real-time database lookups for plan state and permissions.

💳 Subscriptions & Billing
- Stripe Checkout integration
- Yearly Premium plan
- Stripe Webhooks (source of truth for billing events)
- Lazy expiry management using `expires_at`

🤖 AI Tools
- **Article Generation**: Generate long-form content using AI.
- **Image Generation**: Create stunning visuals from text prompts.
- **Background Removal**: Professional-grade image background extraction.
- **Resume Review**: AI-powered feedback on PDF resumes.
- **Community Gallery**: Showcase public creations with a social "like" system.

⚙️ Architecture Highlights
- **Stateless Authentication with Stateful Verification**: Issues JWTs for sessions, but verifies user status (plan, expiry, bans) against the database on every protected request for maximum security.
- **Distributed Rate Limiting**: Implemented via Redis to ensure consistent usage enforcement across multiple server instances (horizontally scalable).
- **Webhook-Driven State**: Stripe webhooks serve as the authoritative source for subscription state, ensuring the local database is always synced with billing.
- **Zero-Cron Expiry**: Plan expiration is handled via comparison logic (`expires_at`), eliminating the need for complex background workers for basic billing enforcement.

🧠 Tech Stack
Frontend
- React (Vite)
- React Router & Axios (with interceptors)
- Tailwind CSS
- Context API (Auth & Plan State)

Backend
- Node.js & Express
- PostgreSQL (Neon) for persistent storage
- Redis for distributed caching and rate limiting
- Stripe API for payment processing
- Cloudinary for media storage
- Google OAuth & JWT for identity

🗂️ Project Structure

quickai/
├── client/              # React frontend
│   ├── src/
│   │   ├── context/     # AuthContext (Real-time state)
│   │   ├── pages/       # Tool-specific pages
│   │   ├── components/  # Reusable UI components
│   │   └── utils/axios.js
│   └── .env
│
├── server/              # Express backend
│   ├── controllers/     # AI and User logic
│   ├── routes/          # API endpoints
│   ├── middlewares/     # Auth & Redis-backed rate limiters
│   ├── configs/         # DB, Redis, and Stripe configs
│   └── server.js
│
└── README.md

🔑 Authentication Flow (Google OAuth)
1. User clicks "Get Started"
2. Frontend redirects to `/api/user/google`
3. Backend initiates Google OAuth 2.0 flow
4. Google redirects back to `/api/user/google/callback` with a code
5. Backend:
   - Exchanges code for user info
   - Synchronizes user in PostgreSQL
   - Issues a JWT containing core user ID
6. Backend redirects to frontend `/oauth-success`
7. Frontend stores JWT and hydrates application state

💳 Subscription Flow (Stripe)
1. User clicks "Upgrade to Premium"
2. Frontend calls `/billing/create-checkout-session`
3. Stripe Checkout handles the payment securely
4. Upon success, Stripe Webhook notifies the backend
5. Backend updates:
   - `plan = 'premium'`
   - `expires_at = now() + 1 year`
6. Frontend refreshes user state via `/api/user/me` for instant UI update

🧾 Database Schema

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  provider TEXT NOT NULL,
  provider_id TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE creations (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  prompt TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL, -- 'article', 'image', etc.
  publish BOOLEAN DEFAULT FALSE,
  likes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

🔔 Stripe Webhooks (Local Development)
Stripe webhooks are handled via Stripe CLI.
1. Start Stripe CLI:
   `stripe listen --forward-to http://127.0.0.1:3000/billing/webhook`
2. Copy the generated `whsec_...` and set it in your `.env`.

🔐 Environment Variables

Backend (server/.env)
PORT=3000
DATABASE_URL=postgresql://...
REDIS_URL=redis://... # Required for rate limiting
JWT_SECRET=your_secret

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/user/google/callback

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

CLOUDINARY_URL=...

Frontend (client/.env)
VITE_API_URL=http://localhost:3000

▶️ Running the Project Locally
**Backend**
cd server
npm install
npm run server

**Frontend**
cd client
npm install
npm run dev

**Stripe CLI**
stripe listen --forward-to http://127.0.0.1:3000/billing/webhook

🎯 Learning Outcomes
This project demonstrates:
- **Production-Grade Auth**: Moving beyond simple JWTs to real-time database-backed session verification.
- **Horizontal Scalability**: Using Redis to synchronize state (like rate limits) across multiple app instances.
- **Reliable Billing**: Implementing the "Source of Truth" pattern with webhooks.
- **Resource Management**: Tiered rate limiting for different services (Text AI vs. Image AI).
- **Clean Architecture**: Separation of concerns between controllers, middlewares, and service configurations.

👤 Author

Built by you as a learning-first SaaS project.
Focused on correctness, not shortcuts.