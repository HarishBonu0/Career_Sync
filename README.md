# CareerOS - AI-Powered Career Evolution Platform

## Quick Start (Development)

### Prerequisites
- Node.js 16+ and npm
- MongoDB Atlas account (or local MongoDB)
- Email service configured (EmailJS for OTP)

### 1. Install Dependencies

```bash
# Install proxy server dependencies
npm install http-proxy-middleware express

# Install backend dependencies
cd backend/main-app/backend
npm install

# Install frontend dependencies
cd ../../../frontend/landing-page
npm install

cd ../course-generation
npm install

cd ../roadmap
npm install

cd ../test-generation
npm install
```

### 2. Configure Environment

Create `.env` file in `backend/main-app/backend/`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
MONGODB_URI=your-mongodb-atlas-connection-string

# EmailJS for OTP
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key
```

### 3. Start All Services

Option A - Use the deployment script:
```bash
node deploy.js
```

Option B - Manual startup:
```bash
# Terminal 1: Backend API
cd backend/main-app/backend
npm start

# Terminal 2: Landing Page
cd frontend/landing-page
npm run dev

# Terminal 3: Course Generator
cd frontend/course-generation
npm run dev

# Terminal 4: Roadmap
cd frontend/roadmap
npm run dev

# Terminal 5: Evaluator
cd frontend/test-generation
npm run dev

# Terminal 6: Reverse Proxy (Production-like routing)
node proxy-server.js
```

### 4. Access the Application

**Development (with individual ports):**
- Landing Page: http://localhost:4173
- Course Generator: http://localhost:3002
- Roadmap: http://localhost:5173
- Evaluator: http://localhost:3001
- Backend API: http://localhost:5000

**Production-like (with reverse proxy):**
- Main Application: http://localhost:8080
- All modules accessible via clean paths:
  - `/` - Landing page
  - `/auth` - Authentication
  - `/course-generator` - Course generation
  - `/roadmap` - Career roadmaps
  - `/evaluator` - Skill evaluator
  - `/api/*` - Backend API

## Features

### Authentication
- ✅ Email/Password sign up and login
- ✅ OTP-based email verification
- ✅ Password reset via email OTP
- ✅ Persistent sessions across modules
- 🔄 Social login (Google, LinkedIn) - Coming soon

### Core Modules
- **Course Generator**: AI-powered course creation
- **Roadmap**: Career path visualization and planning
- **Skill Evaluator**: Knowledge testing and assessment
- **Landing Page**: Main navigation and user dashboard

### User Experience
- ✅ Unified header/footer across all modules
- ✅ Consistent authentication state
- ✅ Fast OTP delivery (async email sending)
- ✅ Mobile-responsive design
- ✅ Clean, deployment-ready routing

## Project Structure

```
Project Expo/
├── backend/
│   └── main-app/backend/       # Express API server
│       ├── routes/             # API routes
│       ├── models/             # MongoDB models
│       ├── services/           # Business logic
│       └── db/                 # Database config
├── frontend/
│   ├── landing-page/           # Main landing page (Vite)
│   ├── course-generation/      # Course generator (Next.js)
│   ├── roadmap/                # Career roadmaps (Vite + React)
│   ├── test-generation/        # Skill evaluator (Vite)
│   └── shared-header.js        # Shared navigation component
├── proxy-server.js             # Reverse proxy for clean routing
├── deploy.js                   # Automated deployment script
└── README.md                   # This file
```

## Deployment

### Production Build

1. Build all frontend modules:
```bash
cd frontend/landing-page && npm run build
cd ../course-generation && npm run build
cd ../roadmap && npm run build
cd ../test-generation && npm run build
```

2. Configure reverse proxy (Nginx or Node.js proxy-server.js)

3. Set production environment variables

4. Deploy to your hosting platform (Vercel, Netlify, AWS, etc.)

### Environment Variables (Production)

```env
PORT=5000
NODE_ENV=production
JWT_SECRET=strong-random-secret
MONGODB_URI=mongodb+srv://...
EMAILJS_SERVICE_ID=...
EMAILJS_TEMPLATE_ID=...
EMAILJS_PUBLIC_KEY=...
EMAILJS_PRIVATE_KEY=...
```

## Tech Stack

- **Frontend**: React, Next.js, Vite, TypeScript
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas
- **Authentication**: JWT, bcrypt
- **Email**: EmailJS
- **Styling**: CSS, Tailwind CSS

## Development Roadmap

### Completed ✅
- Unified authentication across modules
- OTP verification page
- Password reset flow
- Reverse proxy for clean routing
- Async OTP email sending for better performance

### In Progress 🔄
- Progress tracking for courses/roadmaps/tests
- User roles (admin, student, guest)
- Course enrollment and certificates
- Mobile responsiveness improvements
- Accessibility enhancements (WCAG)

### Planned 📋
- Social login (Google, LinkedIn)
- API rate limiting and security
- User feedback and ratings
- Real-time notifications
- Analytics dashboard

## Support

For issues, feature requests, or questions:
1. Check the documentation in each module's folder
2. Review the troubleshooting section below
3. Contact the development team

## Troubleshooting

### MongoDB Connection Issues
- Ensure your IP is whitelisted in MongoDB Atlas Network Access
- Verify connection string in `.env`
- Check MongoDB Atlas cluster status

### OTP Not Received
- Verify EmailJS credentials in `.env`
- Check spam/junk folder
- Ensure email template is correctly configured in EmailJS dashboard

### Port Already in Use
- Change ports in respective `package.json` or `.env` files
- Kill processes using the ports: `npx kill-port 5000 4173 3002 5173 3001`

## License

© 2026 CareerOS. All rights reserved.
