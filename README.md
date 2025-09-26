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

- Client: React + Vite SPA consumes REST API
- Server: Express + MongoDB (Mongoose)
- Auth: JWT (participants + judges)
- CORS: configurable origins


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
  The .env.Example file have all env details

2) Install and run:

```
cd server
npm install
npm run dev
```

The API starts at http://localhost:5000/api

### Frontend (client)

1) Create client/.env (optional):

```
VITE_API_URL=http://localhost:5000/api
```

2) Install and run:

```
cd client
npm install
npm run dev
```

Open http://localhost:5173


## Workflows

Participant flow
1. Sign in at /auth
2. Create a team or join via invite code
3. Create a project, add tasks, track progress
4. Submit the project: Live link + GitHub repo
5. Share the public showcase link with others

Judge flow
1. Go to /judge/login
2. Register with a valid code (JUDGE_CODES) or sign in
3. Browse/search submissions, open details
4. Score with criteria 0–10 and submit
5. Optionally award badges; view leaderboard


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
- The client uses VITE_API_URL; when unset it falls back to http://localhost:5000/api
- CORS_ORIGINS supports comma‑separated origins for local multi‑port setups
- Projects use title (not name); keep naming consistent in the UI

### Troubleshooting
- 401 Unauthorized (client): token missing/expired; sign in again
- CORS error: verify CORS_ORIGINS and VITE_API_URL
- Mongo connection error: check MONGODB_URI and ensure MongoDB is running
- “Completed” count is 0: a project is completed only when status === "completed"
- Vite port in use: change dev port (e.g., set VITE_PORT or run vite --port 5174)


## API Overview

Auth (participants)
- POST /api/auth/register — name, email, password
- POST /api/auth/login — email, password
- GET  /api/auth/me — current user

Judge
- POST /api/judge/register — name, email, password, judgeCode
- POST /api/judge/login — email, password
- GET  /api/judge/submissions — all submissions
- POST /api/judge/submissions/:id/score — submit score
- POST /api/judge/submissions/:id/badge — award badge
- DELETE /api/judge/submissions/:id/badge/:index — remove badge

Teams
- GET/POST /api/teams
- GET /api/teams/:id
- POST /api/teams/:id/members

Projects
- GET/POST /api/projects
- GET/PUT/DELETE /api/projects/:id

Showcase & Submissions
- POST /api/submissions — submit project
- GET  /api/showcase — public list + filters
- GET  /api/showcase/:id — project details
- GET  /api/submissions/leaderboard — ranked winners

All protected routes expect Authorization: Bearer <token>


## Roadmap
- Admin view and custom award categories
- Team chat and notifications
- File uploads (images, docs) per project
- Tests (unit/e2e) and CI


## License

MIT — see LICENSE if present.

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








