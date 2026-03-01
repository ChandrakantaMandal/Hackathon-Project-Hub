<div align="center">

# Hackathon Project Hub

Collaborate. Build. Showcase. Judge.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=222)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-4-646CFF?logo=vite&logoColor=fff)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=fff)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express-4-000?logo=express&logoColor=fff)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-00ED64?logo=mongodb&logoColor=fff)](https://mongodb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

A full‑stack hackathon platform with teams, projects, tasks, public showcase, and a judge portal for submissions, scoring, and badges.


## Table of Contents

- Overview
- Features
- Architecture
- Project Structure
- Getting Started
  - Prerequisites
  - Backend (server)
  - Frontend (client)
  - Environment Variables
- Workflows
  - Participant flow
  - Judge flow
- Development
  - Scripts
  - Useful tips
  - Troubleshooting
- API Overview
- Roadmap
- License


## Overview

Hackathon Project Hub helps teams collaborate during hackathons, track progress and tasks, and publish their projects to a public showcase. Judges can search, review, score, and award badges to submissions. The UI is responsive and animated with framer‑motion and Tailwind.


## Features

Participant/Team
- Authentication and profile
- Create/join teams and manage members
- Create projects (title, description, category, tags, due date)
- Tasks with status and automatic project progress
- Submit project for judging (Live demo + GitHub)
- Public showcase with likes, views, and comments

Judge
- Judge registration/login (with code)
- Judge dashboard of all submissions
- Live search (title, team, submitter, tags, tech, links)
- Score per‑criteria (innovation, technical, design, presentation, overall)
- Award and remove badges

General
- Modern UI: Tailwind, framer‑motion
- API hardening: Helmet, rate‑limit, JWT auth
- Leaderboard (top scored submissions)


## Architecture

### Tech Stack

**Frontend**
- **React 18.2.0** - Modern UI library with hooks
- **Vite 4.5.0** - Lightning-fast build tool and dev server
- **Tailwind CSS 3.3.6** - Utility-first CSS framework
- **Framer Motion 10.16.5** - Animation library
- **Zustand** - Lightweight state management with persist middleware
- **React Router DOM 6.20.1** - Client-side routing
- **Axios** - HTTP client with credentials support
- **React Markdown** - Markdown rendering with syntax highlighting
- **Recharts 2.8.0** - Chart library for data visualization

**Backend**
- **Node.js 20+** - JavaScript runtime
- **Express 4.x** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM with schema validation and indexes
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing (10-12 rounds)
- **Mailtrap** - Email service for verification emails
- **Helmet** - Security middleware
- **Express Rate Limit** - API rate limiting
- **Compression** - Gzip compression middleware

### System Design

- **Client**: React SPA built with Vite, consumes REST API
- **Server**: Express REST API with MongoDB (Mongoose)
- **Authentication**:
  - Participants: JWT with HTTP-only cookies
  - Judges: JWT with localStorage
  - Email verification with OTP
- **Security**: CORS protection, rate limiting, helmet headers
- **Performance**: Code splitting, compression, database indexes, memoization
- **Email**: Mailtrap API for verification and notifications


## Project Structure

```
project/
├─ client/                # React app (Vite)
│  ├─ src/
│  │  ├─ components/      # UI components
│  │  ├─ layouts/         # Dashboard layout
│  │  ├─ pages/           # Route pages (Landing, Dashboard, Showcase, Judge)
│  │  ├─ store/           # Zustand store
│  │  └─ utils/           # helpers, API wrapper
│  └─ index.html
└─ server/                # Express API
   ├─ controller/         # route controllers
   ├─ middleware/         # auth/validation
   ├─ models/             # Mongoose schemas
   ├─ routes/             # API routers
   └─ index.js            # server entry
```


## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally or Atlas

### Backend (server)

1) Create server/.env with:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hackathon-hub
JWT_SECRET=change_me
CORS_ORIGINS=http://localhost:5173
# Comma‑separated judge codes allowed to register
JUDGE_CODES=JUDGE2024,HACKJUDGE
```

2) Install dependencies:

```bash
cd server
npm install
```

**Key Dependencies:**
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `compression` - Gzip compression
- `mailtrap` - Email service
- `cookie-parser` - Cookie parsing
- `cors` - CORS middleware
- `dotenv` - Environment variables

3) Run the server:

```bash
npm run dev  # Development with nodemon
# or
npm start    # Production
```

The API starts at **http://localhost:5000/api**

### Frontend (client)

1) Create `client/.env` (optional):

```env
VITE_API_URL=http://localhost:5000/api
```

2) Install dependencies:

```bash
cd client
npm install
```

**Key Dependencies:**
- `react` & `react-dom` - UI library
- `vite` - Build tool
- `tailwindcss` - CSS framework
- `framer-motion` - Animations
- `zustand` - State management
- `react-router-dom` - Routing
- `axios` - HTTP client
- `react-markdown` - Markdown rendering
- `react-syntax-highlighter` - Code highlighting
- `recharts` - Charts
- `react-hot-toast` - Notifications
- `lucide-react` - Icons

3) Run the development server:

```bash
npm run dev      # Start dev server
# or
npm run build    # Build for production
npm run preview  # Preview production build
```

Open **http://localhost:5173**

### Environment Variables

**Server (`server/.env`)**
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 5000 |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | - |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | Yes | - |
| `JUDGE_CODES` | Valid judge registration codes (comma-separated) | Yes | - |
| `MAILTRAP_TOKEN` | Mailtrap API token | Yes | - |
| `MAILTRAP_ENDPOINT` | Mailtrap API endpoint | No | https://send.api.mailtrap.io/ |

**Client (`client/.env`)**
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | No | http://localhost:5000/api |


## Workflows

### Participant Flow
1. **Sign Up** at `/auth`
   - Enter name, email, and password
   - Receive 6-digit OTP via email
   - Verify email with OTP code
   - Account created and auto-logged in
2. **Create or Join Team**
   - Create a new team with unique invite code
   - Or join existing team using invite code
   - View team members and projects
3. **Create Project**
   - Add title, description, category, tags
   - Set due date and track progress
   - Create tasks and mark them complete
   - Project progress auto-calculates from tasks
4. **Submit Project**
   - Add live demo link and GitHub repository
   - Submit for judging
   - Project appears in judge dashboard
5. **Public Showcase**
   - Share project publicly
   - Receive likes, views, and comments
   - View on leaderboard if scored

### Judge Flow
1. **Register/Login** at `/judge/login`
   - Register with valid judge code from `JUDGE_CODES`
   - Or sign in with existing judge account
2. **Browse Submissions**
   - View all submitted projects
   - Use live search to filter by title, team, tags, tech
   - Click to view detailed project information
3. **Score Projects**
   - Rate on 5 criteria (0-10 scale):
     - Innovation
     - Technical Complexity
     - Design & UX
     - Presentation
     - Overall Impression
   - Final score auto-calculated with weights
   - Submit scores
4. **Award Badges**
   - Add custom badges (e.g., "Best Design", "Most Innovative")
   - Remove badges if needed
5. **View Leaderboard**
   - See ranked submissions by final score
   - Track top performers


## Development

### Scripts

Client
- npm run dev — Vite dev server
- npm run build — production build
- npm run preview — preview the build

Server
- npm run dev — start with nodemon
- npm start — start API

### Useful tips
- The client uses `VITE_API_URL`; when unset it falls back to `http://localhost:5000/api`
- `CORS_ORIGINS` supports comma-separated origins for local multi-port setups
- Projects use `title` (not `name`); keep naming consistent in the UI
- Email verification codes expire after 10 minutes
- Temporary registrations are stored in-memory and cleared after 10 minutes
- Rate limiting: 100 requests per 15 minutes per IP
- Production builds automatically remove console.logs

### Performance Tips
- **Code Splitting**: Vendor libraries are split into separate chunks for better caching
- **Lazy Loading**: Images use `loading="lazy"` attribute
- **Memoization**: Components use `React.memo()`, `useMemo()`, and `useCallback()`
- **Database Indexes**: All models have optimized indexes for faster queries
- **Compression**: Gzip compression reduces response sizes by 70-90%
- **Build Optimization**: Terser minification and tree-shaking in production

### Troubleshooting

**Authentication Issues**
- `401 Unauthorized`: Token missing/expired; sign in again
- `Email verification failed`: Check if OTP is correct and not expired (10 min)
- `User already exists`: Email is already registered; try logging in

**Connection Issues**
- `CORS error`: Verify `CORS_ORIGINS` in server `.env` matches client URL
- `Network error`: Check if backend is running on correct port
- `MongoDB connection error`: Verify `MONGODB_URI` and ensure MongoDB is running

**Email Issues**
- `Error sending verification email`: Check `MAILTRAP_TOKEN` is valid
- `Mailtrap ENOTFOUND`: Verify internet connection and Mailtrap service status

**Build/Dev Issues**
- “Completed” count is 0: a project is completed only when status === "completed"
- `Vite port in use`: Change dev port with `vite --port 5174`
- `Module not found`: Run `npm install` in both client and server
- `Duplicate index warnings`: Already fixed - indexes optimized

**Data Issues**
- `Completed count is 0`: Project is completed only when `status === "completed"`
- `Tasks not updating`: Check if task status is being saved correctly
- `Leaderboard empty`: Projects must be scored by judges to appear


## API Overview

### Authentication (Participants)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user (name, email, password) | No |
| POST | `/api/auth/verify-email` | Verify email with OTP code | No |
| POST | `/api/auth/login` | Login user (email, password) | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/auth/check-auth` | Check authentication status | Yes |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password/:token` | Reset password with token | No |

### Judge Portal
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/judge/register` | Register judge (name, email, password, judgeCode) | No |
| POST | `/api/judge/login` | Login judge (email, password) | No |
| GET | `/api/judge/submissions` | Get all submissions | Yes (Judge) |
| POST | `/api/judge/submissions/:id/score` | Submit score for project | Yes (Judge) |
| POST | `/api/judge/submissions/:id/badge` | Award badge to project | Yes (Judge) |
| DELETE | `/api/judge/submissions/:id/badge/:index` | Remove badge from project | Yes (Judge) |

### Teams
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/teams` | Get all user's teams | Yes |
| POST | `/api/teams` | Create new team | Yes |
| GET | `/api/teams/:id` | Get team details | Yes |
| PUT | `/api/teams/:id` | Update team | Yes (Owner) |
| DELETE | `/api/teams/:id` | Delete team | Yes (Owner) |
| POST | `/api/teams/:id/members` | Add member to team | Yes |
| DELETE | `/api/teams/:id/members/:userId` | Remove member from team | Yes (Owner) |

### Projects
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/projects` | Get all user's projects | Yes |
| POST | `/api/projects` | Create new project | Yes |
| GET | `/api/projects/:id` | Get project details | Yes |
| PUT | `/api/projects/:id` | Update project | Yes (Owner) |
| DELETE | `/api/projects/:id` | Delete project | Yes (Owner) |

### Tasks
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks/project/:projectId` | Get all tasks for project | Yes |
| POST | `/api/tasks` | Create new task | Yes |
| PUT | `/api/tasks/:id` | Update task | Yes |
| DELETE | `/api/tasks/:id` | Delete task | Yes |

### Showcase & Submissions
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/submissions` | Submit project for judging | Yes |
| GET | `/api/showcase` | Get public projects (with filters) | No |
| GET | `/api/showcase/:id` | Get project details | No |
| POST | `/api/showcase/:id/like` | Like a project | Yes |
| POST | `/api/showcase/:id/comment` | Comment on project | Yes |
| GET | `/api/submissions/leaderboard` | Get ranked submissions | No |

### Notes
- All protected routes require `Authorization: Bearer <token>` header
- Participants use HTTP-only cookies for authentication
- Judges use localStorage for authentication
- Rate limiting: 100 requests per 15 minutes per IP
- All responses are gzip compressed


## Roadmap

### Planned Features
- [ ] **Admin Dashboard**
  - Admin view for managing users, teams, and projects
  - Custom award categories and badges
  - Analytics and reporting
- [ ] **Real-time Features**
  - Team chat and messaging
  - Real-time notifications
  - Live project updates with WebSockets
- [ ] **File Management**
  - File uploads (images, documents, presentations)
  - Project media gallery
  - Cloud storage integration (AWS S3, Cloudinary)
- [ ] **Enhanced Collaboration**
  - Code review and feedback system
  - Project milestones and deadlines
  - Team activity timeline
- [ ] **Testing & CI/CD**
  - Unit tests (Jest, Vitest)
  - Integration tests
  - End-to-end tests (Playwright, Cypress)
  - GitHub Actions CI/CD pipeline
- [ ] **Additional Features**
  - Export projects to PDF
  - Email notifications for important events
  - Social media sharing
  - Project templates
  - Advanced search and filtering

### Recent Updates
- ✅ Email verification with OTP
- ✅ Performance optimizations (code splitting, compression, indexes)
- ✅ Gzip compression middleware
- ✅ Database indexes for all models
- ✅ React component memoization
- ✅ Lazy loading for images
- ✅ Rate limiting
- ✅ Security headers with Helmet
- ✅ In-memory temporary registration storage

## Future Update

🚀 Core Platform Enhancements

1. Real-time Collaboration
•  Live Code Editor with syntax highlighting (Monaco Editor integration)
•  Real-time chat within teams/projects
•  Live cursor tracking when multiple people edit documents
•  Voice/Video calling integration for team meetings
•  Screen sharing for pair programming sessions

2. Advanced Project Management
•  Kanban boards with drag-and-drop functionality
•  Gantt charts for timeline visualization
•  Sprint planning tools
•  Time tracking with productivity analytics
•  Milestone tracking with progress visualization
•  Burndown charts and velocity metrics

🎮 Gamification & Engagement

3. Achievement System
•  Badges for different accomplishments (First project, Team player, etc.)
•  Leaderboards for most active users, best projects
•  Skill points system based on contributions
•  Streak counters for daily activity
•  Monthly challenges with rewards

4. Enhanced Judging System
•  Multi-criteria scoring (Innovation, Technical, Design, Impact)
•  Anonymous judging option
•  Judge dashboard with detailed analytics
•  Public voting feature for community choice awards
•  Live judging with real-time scores

🤖 AI-Powered Features

5. Smart Assistance
•  AI project suggestions based on skills and interests
•  Code review AI that suggests improvements
•  Team matching algorithm based on complementary skills
•  Smart task assignment based on member expertise
•  Automated project documentation generation

6. Content Generation
•  AI-powered README generator
•  Automatic commit message suggestions
•  Smart project tagging based on content analysis
•  Idea brainstorming assistant

📱 Mobile & Cross-Platform

7. Mobile App
•  React Native app for iOS/Android
•  Push notifications for team updates
•  Offline mode for basic functionality
•  Mobile-optimized judging interface
•  QR code sharing for quick team joining

8. Desktop Integration
•  Electron desktop app
•  VS Code extension for project sync
•  System tray notifications
•  Local file sync with cloud storage

🌐 Advanced Networking

9. Social Features
•  User profiles with skill showcases
•  Follow system for interesting developers
•  Project recommendations based on interests
•  Mentorship matching system
•  Alumni network for past participants

10. Event Management
•  Multiple hackathon support with different themes
•  Event calendar integration
•  Workshop scheduling system
•  Speaker management tools
•  Live streaming integration for presentations

🔧 Developer Tools Integration

11. Version Control
•  Git integration with commit tracking
•  Branch visualization
•  Code diff viewers
•  Automated deployment from repos
•  CI/CD pipeline integration

12. External APIs
•  GitHub/GitLab sync
•  Figma integration for design collaboration
•  Slack/Discord webhooks
•  Calendar sync (Google, Outlook)
•  Cloud storage integration (Drive, Dropbox)

📊 Analytics & Insights

13. Advanced Analytics
•  Team productivity metrics
•  Project success predictors
•  Skill gap analysis
•  Participation trends
•  Resource utilization tracking

14. Reporting System
•  Custom report builder
•  Export to PDF/Excel
•  Automated weekly summaries
•  Performance comparisons
•  ROI analysis for organizers

🎨 UI/UX Enhancements

15. Personalization
•  Custom themes and color schemes
•  Drag-and-drop dashboard customization
•  Widget-based interface
•  Accessibility improvements
•  Multi-language support

16. Advanced Visualization
•  Interactive charts with D3.js
•  3D project galleries
•  Timeline visualizations
•  Network graphs for team connections
•  Heat maps for activity tracking

🛡️ Security & Compliance

17. Enhanced Security
•  Two-factor authentication
•  RBAC (Role-Based Access Control)
•  API rate limiting
•  Data encryption at rest and in transit
•  Audit logging for all activities

18. Privacy Features
•  GDPR compliance tools
•  Data export/deletion options
•  Anonymous participation modes
•  Privacy settings management

🚀 Scalability Features

19. Enterprise Features
•  White-label solutions for organizations
•  Custom branding options
•  SSO integration
•  Enterprise analytics
•  Bulk user management

20. Marketplace
•  Template marketplace for projects
•  Plugin system for extensions
•  Third-party integrations store
•  Custom theme marketplace


## License

MIT — see LICENSE if present.

