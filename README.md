# AI SaaS Platform - QuickAI

A full-stack AI SaaS platform that provides both free and premium AI-powered tools for content creation and image editing. Built using the **PERN stack (PostgreSQL, Express, React, Node.js)** with role-based access control and Google Sign-In via Clerk.

---

## 🚀 Features

- **Role-Based Access Control:** Users and Admins with Google Sign-In using Clerk
- **AI Tools:**
  - Background Remover
  - Object Remover
  - Image Generator
  - Blog Generator
  - Article Generator
- **Free & Paid Tools:** Some tools are free while premium tools require subscription
- **API Integrations:**
  - Gemini API for AI content generation
  - Cloudinary for image storage and processing
  - ClipDrop API for image editing
- **Responsive React Frontend:** Clean, user-friendly dashboard and tool interface
- **Subscription Management:** Paid tools are restricted based on user subscription

---

## 🛠️ Tech Stack

- **Frontend:** React, Tailwind CSS, JavaScript, HTML
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Authentication:** Clerk (Role-based access control, Google Sign-In)
- **AI & Media APIs:** Gemini, Cloudinary, ClipDrop

---

## 🔧 Installation
cd server
npm install

cd ../client
npm install

1. Clone the repository:
```bash
git clone https://github.com/sarveshkumbharde/AI-SaaS-Platform.git
cd AI-SaaS-Platform

PORT=5000
POSTGRE_URI=your_postgresql_connection_string
CLIPDROP_API_KEY=your_clipdrop_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_api_key


AI-SaaS-Platform/
├── server/             # Node.js & Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
├── client/            # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
