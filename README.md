# LastLap

LastLap is a full-stack assignment planner for students. It helps students decide what to work on next by ranking assignments using due date, importance, and estimated effort.

## Product and core workflows

- Create assignments with a course, due date, effort estimate, and importance.
- Search assignments by name or course, sort by priority, due date, or effort, and see active work ranked by urgency, importance, and estimated effort.
- Filter assignments due today or already completed.
- Browse a monthly planner, inspect deadlines for a selected date, and add an assignment directly to that day.
- Browse courses inferred from assignment subjects, see completion progress, and jump to a course's assignments.
- Review insights including completion rate, overdue work, remaining effort, and course workload.
- Mark assignments complete, restore them to active work, or delete them.
- Run a 25- or 50-minute focus timer.
- Persist assignments in MongoDB, with backend-side validation and clear API errors.

Priority is a transparent heuristic: deadlines closer to today increase urgency, importance adds weight, and a larger effort estimate slightly reduces the score to help surface manageable next steps. It is a planning aid, not an objective measure.

## MERN architecture

- **MongoDB** stores assignment documents with due dates, effort, importance, completion state, and timestamps.
- **Express + Node.js** exposes account, task, and health endpoints; validates requests; enforces per-account task ownership; and connects to MongoDB through Mongoose.
- **React** renders separate Dashboard, Planner, Courses, and Insights screens with separate direct routes (`/`, `/planner`, `/courses`, and `/insights`), priority ordering, assignment search and sorting, form validation messages, loading/error states, and the 25- and 50-minute focus timer.
- **Vite** serves the React frontend during development and builds static assets for deployment. The Express backend can serve the built frontend in production when deployed as one service.

Email and password accounts keep each student's assignments private from other accounts. Passwords are hashed with bcryptjs; the API issues short-lived signed tokens, and task reads and changes are scoped to the authenticated account. Tokens are stored in browser local storage for this demo, so keep the frontend free of unsafe HTML injection and use HTTPS when deployed.

## Prerequisites

- Node.js 20.19+ or 22.12+ and npm.
- A MongoDB database, either local or MongoDB Atlas.

## Local setup

1. Open this `lastlap` folder in VS Code.
2. Install dependencies for the project scripts, frontend, and backend:

   ```bash
   npm install
   npm --prefix frontend install
   npm --prefix backend install
   ```

3. Copy `backend/.env.example` to `backend/.env`. Replace `MONGODB_URI` with your database connection string. Generate a signing secret with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` and put that value in `JWT_SECRET`. Keep `backend/.env` out of Git. For local MongoDB, a URI such as `mongodb://127.0.0.1:27017/lastlap` works. For Atlas, use your cluster's URI and allow your current IP. URL-encode special characters in the database username or password.
4. Start both the API and React development servers:

   ```bash
   npm run dev
   ```

5. Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The API runs on port `5000`; Vite forwards `/api` requests to it.

On first use, create an account in LastLap (passwords are hashed and assignments are scoped to that account). If the page reports a database or authentication configuration problem, check both values in `backend/.env` and restart `npm run dev`. Atlas requires a database user and an allowed IP address before an application can connect; see the [Atlas connection guide](https://www.mongodb.com/docs/atlas/driver-connection/) and [IP access list guide](https://www.mongodb.com/docs/atlas/security/ip-access-list/).

## Environment variables

### Backend (`backend/.env`)

- `PORT` — API port, defaults to `5000`.
- `MONGODB_URI` — required MongoDB connection string. Keep it secret.
- `JWT_SECRET` — required private signing key with at least 32 characters.
- `CLIENT_ORIGIN` — allowed browser origin(s), comma-separated. Local default: `http://localhost:5173`.

### Frontend (`frontend/.env`, only for a separately hosted API)

- `VITE_API_URL` — public base URL of the API, without a trailing slash. Leave unset for local development or a single-service deployment. Values embedded in frontend variables are public, so never put secrets here.

## Production build

```bash
npm install
npm --prefix frontend install
npm --prefix backend install
npm run build
npm start
```

The Node service serves `frontend/dist` after the build and serves API routes under `/api`. Configure `MONGODB_URI` in the hosting provider's secret settings and set `CLIENT_ORIGIN` to the deployed website origin. The hosting provider must support a long-running Node service and MongoDB outbound connections. If hosting the frontend and API separately, set `VITE_API_URL` for the frontend and set `CLIENT_ORIGIN` for the API.

Deployment URL: **Not deployed yet**.

## Demo video outline (3–5 minutes)

1. Introduce the student workload problem, target user, and account sign-up.
2. Create assignments with different due dates, effort, and importance; show the priority ordering and monthly Planner.
3. Browse Courses and Insights, filter due-today work, complete an assignment, and show it in Completed.
4. Refresh to demonstrate MongoDB persistence; start, pause, and reset the 25- and 50-minute focus timer.
5. Briefly explain the React frontend, Express API, and MongoDB data model.

## Submission details

- **Project name:** LastLap
- **Student name:** Add your name
- **Problem statement:** Students need a clear way to prioritize assignments across courses using urgency, importance, and estimated effort.
- **GitHub repository:** Add the public repository URL
- **Deployed application:** Add the public deployment URL
- **Demo video:** Add the accessible video URL
- **Tech stack:** MongoDB, Express, React, Node.js, Vite
- **Major features:** Account registration/login, private assignment lists, assignment search and sorting, priority scoring, calendar planner, course progress, insights, filters, completion tracking, MongoDB persistence, server-side validation, API error handling, focus timers.

Official submission form from the supplied guidelines: https://forms.gle/sBy4sfqyiRG2Zpom9










