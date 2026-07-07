# Employee Daily Log Tracker

## Overview
A full-stack tracker where employees submit a single daily work log and managers read every entry with optional filters. The backend exposes a JWT-protected API backed by Prisma/SQLite and the frontend is a Create React App that communicates via Axios so the whole stack can run locally.

## Tech stack
- **Frontend**: React (Create React App), Axios for HTTP, modern CSS for the layout.
- **Backend**: Node.js + Express, Prisma ORM with SQLite, JWT and bcrypt-powered authentication, role-based access control.

## Repository structure
- `backend/` – Express API, Prisma schema, seed script, helper env template and scripts.
- `frontend/` – Create React App code with reusable components, hooks, and style utilities.

## Backend setup
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` and update `JWT_SECRET`, `DATABASE_URL`, and `FRONTEND_ORIGIN` if needed.
4. `npx prisma generate`
5. `npx prisma migrate dev --name init`
6. `npm run seed`
7. `npm start`

## Frontend setup
1. `cd frontend`
2. `npm install`
3. Copy `.env.example` to `.env` (adjust `REACT_APP_API_BASE_URL` if the backend runs on another host/port).
4. `npm start`

## Sample accounts
- Manager: `manager@example.com` / `manager123`
- Employees: `alice@example.com` / `employee123`, `marcus@example.com` / `employee123`

## API surface
| Route | Method | Description | Access |
| --- | --- | --- | --- |
| `/auth/login` | POST | Authenticate and return JWT + profile | Public |
| `/logs` | POST | Submit today's log (one per day) | Employee |
| `/logs` | GET | Employees: own logs. Managers: any logs with optional `employeeId`/`date` filters. | Authenticated |
| `/users` | GET | List of employees to populate filters | Manager |

## Notes
- JWT tokens expire in 8 hours. Re-login to refresh.
- Backend ships with SQLite (`DATABASE_URL="file:./dev.db"`) so no extra database is needed for the sample.
