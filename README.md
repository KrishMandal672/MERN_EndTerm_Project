# LastLap

**A personal assignment planner that helps students decide what to work on next.** LastLap brings deadlines, course workload, and focused work sessions into one place.

## Project Name

**LastLap — Student Assignment Planner**

## Problem Statement

Students often manage assignments across several courses using scattered notes, calendars, and reminders. It can be difficult to see which deadline needs attention first, estimate the effort involved, and track progress in one place.

## Target Users

LastLap is built for students who want a simple way to organize coursework, keep track of deadlines, and make steady progress on assignments.

## Solution

LastLap gives each student a private workspace for assignments. It brings due dates, importance, and estimated effort together to suggest what may need attention next. A calendar, course summaries, progress insights, and a focus timer help students plan and follow through.

The priority score is a transparent planning aid: nearer deadlines and higher importance raise an assignment's score, while larger effort estimates slightly lower it to help surface manageable next steps. It is not an objective measure of academic importance.

## Key Features

- Create an account and sign in to a private assignment list.
- Add assignments with a course, due date, importance, and effort estimate.
- See assignments prioritized by urgency, importance, and effort.
- Search by assignment or course, and sort by priority, due date, or effort.
- Filter assignments due today and review completed work.
- Use the monthly Planner to view deadlines and add work for a selected date.
- Browse course summaries and completion progress.
- Review insights such as completion rate, overdue work, remaining effort, and workload by course.
- Mark assignments complete, restore them to active work, or delete them.
- Use a 25- or 50-minute focus timer.
- Keep assignment data in MongoDB across sessions.

## Tech Stack

- **Frontend:** React, Vite, JavaScript, CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Authentication:** bcryptjs password hashing and JSON Web Tokens

## Architecture

LastLap is organized as a MERN application with separate frontend and backend folders.

- `frontend/` contains the React interface. Vite runs the development server and builds production assets. The app has Dashboard, Planner, Courses, and Insights routes.
- `backend/` contains the Express API, Mongoose models, authentication, and assignment routes. It validates assignment data and scopes assignment operations to the signed-in user.
- MongoDB stores user accounts and assignments. Passwords are hashed before storage; signed tokens authenticate API requests.
- In production, the Express service serves the built frontend and API from one web service. API routes are under `/api`.

## Local Setup

### Prerequisites

- Node.js 20.19+ or 22.12+ and npm
- MongoDB running locally or a MongoDB Atlas cluster

### Run the app

1. Clone the repository and open its folder in a terminal:

   ~~~bash
   git clone https://github.com/soham25bcs10010-png/LastLap.git
   cd LastLap
   ~~~

2. Install dependencies from the project root:

   ~~~bash
   npm install
   npm --prefix frontend install
   npm --prefix backend install
   ~~~

3. Create `backend/.env` and configure the variables listed below.
4. Start the frontend and backend in development mode:

   ~~~bash
   npm run dev
   ~~~

5. Open the Vite address printed in the terminal, normally `http://localhost:5173`.

Vite forwards `/api` requests to the backend at `http://localhost:5000` during local development.

## Environment Variables

Create `backend/.env` on your computer. Do not commit this file or share its values.

~~~env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/lastlap
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters-long
CLIENT_ORIGIN=http://localhost:5173
~~~

- `PORT` — backend port; defaults to `5000`.
- `MONGODB_URI` — MongoDB connection string. For Atlas, use the cluster connection string and ensure its network access settings allow the application to connect.
- `JWT_SECRET` — private signing key of at least 32 characters. Use a unique random value.
- `CLIENT_ORIGIN` — allowed frontend origin for local development. With the single-service deployment, frontend and API share an origin.

For a separately hosted frontend, `VITE_API_URL` can be set in `frontend/.env` to the public API base URL. Frontend environment variables are public; never put secrets there.

## Deployment

The root-level `render.yaml` configures a single Render web service for the frontend and backend. Connect this GitHub repository to Render as a Blueprint, provide `MONGODB_URI` as a secret, and deploy. Render generates `JWT_SECRET` from the Blueprint configuration.

- **GitHub repository:** [soham25bcs10010-png/LastLap](https://github.com/soham25bcs10010-png/LastLap)
- **Live application:** Add the public `.onrender.com` URL from the Render dashboard here.
