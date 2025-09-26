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
- Screenshots
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


## Screenshots

Place your screenshots in docs/screenshots and update paths below:

- Landing: docs/screenshots/landing.png
- Dashboard: docs/screenshots/dashboard.png
- Showcase: docs/screenshots/showcase.png
- Judge: docs/screenshots/judge.png


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

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hackathon-hub
JWT_SECRET=change_me
CORS_ORIGINS=http://localhost:5173
# Comma‑separated judge codes allowed to register
JUDGE_CODES=JUDGE2024,HACKJUDGE
```

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
