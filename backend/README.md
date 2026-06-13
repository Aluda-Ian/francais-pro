# 🇫🇷 Français Pro — Backend API

Node.js + Express + MongoDB backend for the Français Pro French learning platform.

## Features
- JWT + Google OAuth2 authentication
- Google Calendar API v3 integration (create Meet sessions, add to student calendar)
- Live class booking system with email confirmations (Nodemailer)
- Real-time spot updates via Socket.io
- MongoDB Atlas via Mongoose

## Quick Start

### 1. Copy environment variables
```bash
cp .env.example .env
```
Fill in all values in `.env` (MongoDB URI, Google credentials, SMTP settings).

### 2. Google Cloud Setup (Required for Meet/Calendar)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (e.g., `francais-pro`)
3. Enable **Google Calendar API** and **Google Meet API**
4. Create **OAuth 2.0 credentials** (Web application type):
   - Authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
5. Create a **Service Account** for server-side Calendar operations:
   - Download JSON key → save as `backend/config/service-account-key.json`

### 3. Install and run
```bash
cd backend
npm install
npm run dev   # Development with nodemon
npm start     # Production
```

### 4. Verify
```
GET http://localhost:5000/api/health
```
Should return: `{"status":"ok","platform":"Français Pro API",...}`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register with email/password |
| POST | `/api/auth/login` | Login with email/password |
| GET | `/api/auth/google` | Start Google OAuth flow |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| GET | `/api/auth/me` | Get current user (JWT required) |
| GET | `/api/auth/google-url` | Get Google OAuth URL (for frontend JS) |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | List courses (filter by curriculum, level) |
| GET | `/api/courses/featured` | Featured courses for homepage |
| GET | `/api/courses/:id` | Course details |
| POST | `/api/courses` | Create course (instructor/admin) |
| PATCH | `/api/courses/:id` | Update course |

### Live Classes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/live-classes` | Browse upcoming classes |
| GET | `/api/live-classes/:id` | Class details |
| POST | `/api/live-classes` | Create class + Google Meet (instructor) |
| DELETE | `/api/live-classes/:id` | Cancel class + notify students |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Book a live class |
| GET | `/api/bookings/my` | Student's bookings |
| GET | `/api/bookings/:id/join` | Get Meet link (15 min before class) |
| DELETE | `/api/bookings/:id` | Cancel booking |

### Calendar
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/calendar/slots/:instructorId` | Instructor availability |
| GET | `/api/calendar/upcoming` | Student's upcoming classes |

### Contact
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact` | Send contact form |

## MongoDB Schemas
- **User** — students, instructors, admins with Google OAuth tokens
- **Course** — French courses with IB/IGCSE/CBSE curriculum fields and module/lesson nesting
- **LiveClass** — scheduled sessions with Google Meet link and calendar event IDs
- **Booking** — student↔class relationship with payment, attendance, and reminder tracking
- **Enrollment** — student↔course with progress tracking and certificate issuance

## Deployment (Railway / Render)
1. Connect your GitHub repo to Railway or Render
2. Add all `.env` variables in the platform dashboard
3. Set start command: `node server.js`
4. Update `FRONTEND_URL` and `GOOGLE_REDIRECT_URI` to production URLs

## Tech Stack
- Node.js 18+ / Express 4
- MongoDB Atlas / Mongoose 8
- Google APIs (googleapis, google-auth-library)
- JWT (jsonwebtoken) + bcryptjs
- Nodemailer (Gmail SMTP)
- Socket.io (real-time updates)
- Helmet + express-rate-limit (security)
