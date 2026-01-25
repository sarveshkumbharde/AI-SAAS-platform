🚀 QuickAI – AI SaaS Platform

QuickAI is a full-stack AI SaaS platform built for learning real-world production architecture.
It implements custom authentication, subscription billing, and usage enforcement without relying on third-party auth providers like Clerk.

This project focuses on how real SaaS products are built, not shortcuts.

✨ Features
🔐 Authentication

Google OAuth 2.0 (Authorization Code Flow)

Custom JWT-based authentication

No Clerk / no Auth0

Secure backend-controlled identity

💳 Subscriptions & Billing

Stripe Checkout (test mode)

Yearly Premium plan

Stripe Webhooks (source of truth)

Lazy expiry using expires_at

Local testing with Stripe CLI

🤖 AI Tools

Article generation

Blog title generation

Image generation

Background removal

Object removal

Resume review (PDF)

Community gallery with likes

⚙️ Architecture Highlights

JWT is a session snapshot, DB is the source of truth

Webhooks update DB, frontend refreshes state

No cron jobs needed for plan expiry

Rate limiting for protected routes

Redis caching for performance

🧠 Tech Stack
Frontend

React (Vite)

React Router

Axios (with interceptors)

Tailwind CSS

Context API (AuthContext)

Backend

Node.js

Express

PostgreSQL (Neon)

Stripe API

Redis

Cloudinary

Google OAuth

JWT

🗂️ Project Structure

quickai/
├── client/              # React frontend
│   ├── src/
│   │   ├── context/     # AuthContext (JWT-based)
│   │   ├── pages/
│   │   ├── components/
│   │   └── utils/axios.js
│   └── .env
│
├── server/              # Express backend
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── configs/
│   └── server.js
│
└── README.md

🔑 Authentication Flow (Google OAuth)

User clicks Get Started

Frontend redirects to /api/user/google

Backend redirects to Google OAuth

Google redirects back to /api/user/google/callback

Backend:

Exchanges code for token

Creates / finds user

Issues JWT

Backend redirects to frontend /oauth-success

Frontend stores JWT and enters app

💳 Subscription Flow (Stripe)

User clicks Upgrade to Premium

Frontend calls /billing/create-checkout-session

Stripe Checkout opens

Payment succeeds

Stripe Webhook fires

Backend updates:
plan = 'premium'
expires_at = now() + interval '1 year'

plan = 'premium'
expires_at = now() + interval '1 year'

Frontend hits /api/user/me to refresh plan

UI updates instantly

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
  type TEXT NOT NULL,
  publish BOOLEAN DEFAULT FALSE,
  likes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

🔔 Stripe Webhooks (Local Development)

Stripe webhooks are handled via Stripe CLI.

Start Stripe CLI
stripe listen --forward-to http://127.0.0.1:3000/billing/webhook

Copy the generated whsec_... and set:
STRIPE_WEBHOOK_SECRET=whsec_...

⚠️ Restart backend after updating webhook secret.

🔐 Environment Variables

Backend (server/.env)

PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/user/google/callback

STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

FRONTEND_URL=http://localhost:5174
REDIS_URL=...
CLOUDINARY_URL=...


Frontend (client/.env)
VITE_API_URL=http://localhost:3000

▶️ Running the Project Locally
Backend
cd server
npm install
npm run server

Frontend
cd client
npm install
 npm run dev

 Stripe CLI
 stripe listen --forward-to http://127.0.0.1:3000/billing/webhook

🧪 Test Cards (Stripe)
Use:
4242 4242 4242 4242

🎯 Learning Outcomes

This project teaches:

Real OAuth flow

JWT limitations & refresh strategies

Webhook-based billing

Proper route protection

Frontend–backend responsibility separation

SaaS-grade architecture decisions

📌 Future Improvements

Refresh tokens

Cancel subscription flow

Stripe customer portal

Usage analytics

Deployment (Docker / Fly.io / Railway)

👤 Author

Built by you as a learning-first SaaS project.
Focused on correctness, not shortcuts.