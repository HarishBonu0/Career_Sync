# Career Sync - AI-Powered Career Development Platform

Career Sync is an intelligent platform designed to help individuals accelerate their career growth through AI-powered personalized learning pathways, career roadmaps, and skill assessments.

## 📌 What is Career Sync?

Career Sync helps users discover, plan, and master the skills needed for their desired careers. By combining AI-generated courses, interactive career visualizations, and skill evaluations, it creates a comprehensive career development experience.

### Core Capabilities
- **Personalized Learning Paths** - AI generates courses tailored to career goals
- **Career Roadmapping** - Visualize and plan career progression with skill gaps
- **Skill Evaluation** - Assess knowledge and track progress through tests
- **Unified Experience** - Seamless authentication and navigation across modules

## 🎯 Use Cases

- Job seekers planning their next career move
- Professionals upskilling in emerging technologies
- Career changers mapping transition paths
- Learners seeking personalized course recommendations

## 🚀 Getting Started

```bash
# Install dependencies
npm run install:all

# Start backend (Terminal 1)
npm run start:backend

# Start frontends (Terminal 2)
cd frontend && npm run dev
```

Access at:
- Landing Page: `http://localhost:4173`
- Course Builder: `http://localhost:3002`
- Career Roadmap: `http://localhost:5173`
- Skill Evaluator: `http://localhost:3001`

## 📋 Setup Requirements

Create `.env` in `backend/main-app/backend/`:
```env
MONGODB_URI=your-connection-string
JWT_SECRET=your-secret-key
EMAILJS_SERVICE_ID=your-service-id
EMAILJS_TEMPLATE_ID=your-template-id
EMAILJS_PUBLIC_KEY=your-public-key
EMAILJS_PRIVATE_KEY=your-private-key
```

## 🏗️ Architecture

**Backend:** Node.js + Express + MongoDB  
**Frontend:** Next.js, React, Vite  
**Auth:** JWT + Email OTP  

## 📦 Deployment

```bash
# Automatic deployment via Render
# Push to main branch to trigger
```

---

**Version:** 1.0.0 | **Last Updated:** January 2026
