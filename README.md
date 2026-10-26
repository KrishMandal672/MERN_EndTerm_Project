# LastLap

**Make the next hour count.** LastLap is a small study desk for students who need help choosing what to work on next. It keeps assignments together and turns due dates, effort, and importance into a useful priority order.

## Problem and users

Students often track work across course pages, notes, and memory. When several deadlines overlap, it can be hard to decide what deserves attention first. LastLap is for students who want one quick view of their workload and a gentle nudge toward the next action.

## What it does

- Add an assignment with a course, due date, estimated effort, and importance.
- Automatically rank active work using deadline urgency, importance, and estimated effort. Overdue work and work due today rise to the top.
- Filter the list to active work, assignments due today, or completed work.
- Mark work complete or move it back to active work; remove an assignment when it is no longer needed.
- Run a 25-minute focus timer with pause, resume, reset, and completion feedback.
- Keep assignments in browser local storage so they remain after a refresh on the same device.

A few example assignments are included the first time the app opens so the priority view is easy to explore. They can be completed or removed like any other assignment.

## Technology and design

- HTML, CSS, and modern browser JavaScript; no build step or server required.
- Browser `localStorage` stores the user's assignment list. No account or personal data is sent to a server.
- The interface is divided into a workload view, a task-entry dialog, and a focus corner. `app.js` owns the data, priority calculation, persistence, filters, and timer; `styles.css` provides responsive layouts for desktop and mobile.
- Priority is a simple, explainable score: urgency increases as a due date approaches, importance adds weight, and larger estimated effort slightly reduces the score to favor achievable next steps. The labels are guidance, not a promise of an objectively correct decision.

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a current browser. No package installation or environment variables are required.
3. Add, complete, filter, or delete assignments. Refresh the page to confirm assignments persist on that browser and device.

The Google Fonts link is an optional visual enhancement; the browser falls back to system fonts if it cannot reach Google Fonts.

## Deployment

This is a static app and can be hosted by any static site provider. Publish the contents of this folder with `index.html` as the entry page. No API keys or environment variables are needed. Add the public URL here after deployment: **Not deployed yet**.

## Demo video outline (3–5 minutes)

1. Introduce the student deadline problem and who LastLap is for.
2. Add an assignment and show how due date, importance, and effort affect its position.
3. Show the due-today filter, complete an assignment, then show it in Completed.
4. Refresh to demonstrate local persistence and start/pause/reset the focus timer.
5. Close with the chosen architecture and where the app is deployed.

## Submission details to fill in

- **Project name:** LastLap
- **Student name:** Add your name
- **Problem statement:** Students need a clear way to prioritize assignments across courses using urgency, importance, and estimated effort.
- **GitHub repository:** Add the public repository URL
- **Deployed application:** Add the public deployment URL
- **Demo video:** Add the accessible video URL
- **Tech stack:** HTML, CSS, JavaScript, browser local storage
- **Major features:** Priority scoring, assignment workflow, filters, completion tracking, local persistence, focus timer

The official submission form is linked in the provided guidelines: https://forms.gle/sBy4sfqyiRG2Zpom9. Complete it yourself after replacing the placeholders and checking that your links are public.
