# Samagama FAQ Portal

Samagama FAQ Portal is a full-stack community FAQ and question-answer platform. Users can browse FAQs, ask questions, answer community questions, upvote content, report inappropriate content, and track their activity. Admins can moderate reports, edit/remove content, suspend/reactivate users, manage FAQ eligibility settings, and view analytics.

## Tech Stack

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT with role-based admin routes
- Uploads: Multer + Cloudinary for image attachments
- Styling: CSS in `client/src/app.css`

## Project Structure

```text
FAQ-PRJ/
  client/        React/Vite frontend
  server/        Express/MongoDB backend
```

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB database URI, local or hosted
- Cloudinary account, only required if you want question image attachments

## Backend Setup

1. Go to the backend folder:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster.example.mongodb.net/faq-db
JWT_SECRET=replace-with-a-long-random-secret

FAQ_MIN_VIEWS=100
FAQ_MIN_AGE_DAYS=7
FAQ_UPVOTE_THRESHOLD=5

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Cloudinary variables are optional for browsing, asking text questions, answering, voting, and moderation. They are required when uploading attachments.

4. Start the backend:

```bash
npm run dev
```

For production-style startup:

```bash
npm start
```

The API runs at:

```text
http://localhost:5000/api
```

## Frontend Setup

1. Open a second terminal and go to the frontend folder:

```bash
cd client
```

2. Install dependencies:

```bash
npm install
```

3. Start the frontend:

```bash
npm run dev
```

The app usually runs at:

```text
http://localhost:5173
```

The frontend API base URL is currently hardcoded in `client/src/services/api.js`:

```js
baseURL: "http://localhost:5000/api"
```

Update that value if your backend runs somewhere else.

## Admin Account

The backend seed script ensures the admin account exists. Current credentials are defined in `server/config/adminCredentials.js`:

```text
Email: admin@samagama.local
Password: seedpass123
```

For a real deployment, change these credentials before deploying.

## Seed and Cleanup Script

Run this from `server/`:

```bash
npm run seed
```

Current behavior:

- ensures the seed admin exists
- removes seed questions
- removes all non-admin users
- removes questions, answers, and reports related to removed non-admin users
- does not recreate FAQ seed questions

Because `server/server.js` calls the seed function during startup, this cleanup also runs when the backend starts.

## Main App Pages

- `/` - FAQ page
- `/questions` - community questions
- `/questions/:id` - question detail and answers
- `/ask` - ask a question, login required
- `/my-activity` - logged-in user activity
- `/leaderboard` - SP points leaderboard
- `/login` - login/register
- `/admin/moderation` - admin moderation dashboard

## API Overview

Base URL:

```text
http://localhost:5000/api
```

Common routes:

- `POST /auth/register`
- `POST /auth/login`
- `GET /users/me`
- `GET /users/me/questions`
- `GET /users/me/answers`
- `GET /questions`
- `GET /questions/:id`
- `POST /questions`
- `PATCH /questions/:id`
- `DELETE /questions/:id`
- `PATCH /questions/:id/upvote`
- `GET /questions/:questionId/answers`
- `POST /questions/:questionId/answers`
- `PATCH /answers/:id`
- `DELETE /answers/:id`
- `PATCH /answers/:id/upvote`
- `POST /questions/:id/report`
- `POST /answers/:id/report`
- `GET /faqs`
- `GET /leaderboard`
- `GET /categories`
- `GET /config`

Admin routes require a JWT for an admin user:

- `GET /admin/analytics`
- `GET /admin/audit`
- `GET /admin/reports`
- `PATCH /admin/reports/:id`
- `GET /admin/question-reports`
- `PATCH /admin/question-reports/:id`
- `PATCH /admin/questions/:id`
- `DELETE /admin/questions/:id`
- `PATCH /admin/answers/:id`
- `DELETE /admin/answers/:id`
- `POST /admin/users/:userId/warn`
- `PATCH /admin/users/:userId/suspend`
- `PATCH /admin/users/:userId/reactivate`
- `GET /admin/users`
- `GET /admin/faq-config`
- `PATCH /admin/faq-config`

## Useful Commands

Backend:

```bash
cd server
npm run dev
npm start
npm run seed
```

Frontend:

```bash
cd client
npm run dev
npm run build
npm run preview
npm run lint
```

## Notes on Tests and Linting

The backend currently has no real test script. `server/package.json` contains a placeholder `npm test` command.

The frontend has an ESLint setup:

```bash
cd client
npm run lint
```

At the time this README was written, the frontend lint command reports existing React hook and unused-variable issues in several files. Fix those before treating lint as a clean CI gate.

## Troubleshooting

MongoDB connection fails:

- Check `MONGO_URI` in `server/.env`.
- Make sure your MongoDB Atlas IP allowlist permits your machine.
- Make sure the database user and password are correct.

JWT errors:

- Set `JWT_SECRET` in `server/.env`.
- Use a long random string.
- Log in again after changing the secret.

Attachment upload fails:

- Set all three Cloudinary variables in `server/.env`.
- Only PNG, JPG, and JPEG files are supported.
- A maximum of 5 attachments is allowed per question.

Frontend cannot reach backend:

- Confirm the backend is running on port `5000`.
- Confirm `client/src/services/api.js` points to the correct backend URL.
- Check browser console/network tab for CORS or connection errors.

## Deployment Checklist

- Replace the default admin credentials.
- Use a strong `JWT_SECRET`.
- Set production MongoDB and Cloudinary credentials.
- Update the frontend API base URL for the deployed backend.
- Run `npm run build` in `client`.
- Do not commit `.env` files or real secrets.
