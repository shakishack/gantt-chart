# Smart Gantt Chart App (Full-Stack)

A full-stack, mobile-responsive **Smart Gantt Chart Application** built with **React (Vite)**, **Express.js**, **PostgreSQL** (via `pg-promise`), and clean **plain CSS**.

---

## 📁 Project Structure

```text
gantt-chart/
├── client/                     # Frontend (React + Vite + TypeScript)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # GanttChart, GanttHeader, GanttRow, Modals, ProgressBar
│   │   ├── services/           # api.ts (fetch client for Express API)
│   │   ├── styles/             # gantt.css (plain CSS + dark mode)
│   │   ├── types/              # gantt.ts
│   │   ├── utils/              # dateUtils.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example            # VITE_API_BASE_URL
│   └── package.json
│
├── server/                     # Backend (Node.js + Express + pg-promise)
│   ├── src/
│   │   ├── controllers/        # taskController, divisionController, projectController
│   │   ├── db/                 # db.js (pg-promise connection), seed.js (runner)
│   │   ├── routes/             # taskRoutes, divisionRoutes, projectRoutes
│   │   └── server.js           # Main Express server entry point
│   ├── schema.sql              # Database table definitions
│   ├── seed.sql                # Initial seed data
│   ├── .env.example            # PORT, DATABASE_URL, CLIENT_ORIGIN
│   └── package.json
│
├── package.json                # Root package.json (run scripts & Heroku deployment)
└── README.md                   # Documentation & Setup Guide
```

---

## 🗄️ Step 1: Create Database in PostgreSQL

You can create the PostgreSQL database using either **Method A (Terminal / SQL Shell)** or **Method B (pgAdmin GUI)**:

### Method A: Using SQL Shell (psql) or Terminal

1. Open your terminal or search for **SQL Shell (psql)** in your Windows Start menu.
2. Log in using your PostgreSQL credentials (default user is usually `postgres`).
3. Run the following SQL command to create the database:

```sql
CREATE DATABASE gantt_chart_db;
```

4. Verify it was created by running:
```sql
\l
```
*(You should see `gantt_chart_db` in the list of databases).*

---

### Method B: Using pgAdmin 4 (GUI)

1. Open **pgAdmin 4**.
2. Connect to your PostgreSQL server.
3. Right-click on **Databases** > **Create** > **Database...**.
4. Type `gantt_chart_db` in the **Database** field and click **Save**.

---

## ⚙️ Step 2: Configure Environment Variables

### 1. Server Environment (`server/.env`)
Create a `.env` file inside the `server/` directory (or copy from `server/.env.example`):

```env
PORT=5000
NODE_ENV=development

# Adjust with your local PostgreSQL password:
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/gantt_chart_db

CLIENT_ORIGIN=http://localhost:5173
```

### 2. Client Environment (`client/.env`)
Create a `.env` file inside the `client/` directory (or copy from `client/.env.example`):

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🌱 Step 3: Run Database Schema & Seeds

Once your database is created and your `server/.env` is set, run the automated seed script from your terminal:

```bash
# From the root folder:
yarn seed
```
*(Or inside `server/` run: `node src/db/seed.js`)*

This script automatically executes `schema.sql` and `seed.sql` to create:
- `divisions` table
- `tasks` table (with task title as primary key, progress, start_date, end_date, by_month, by_week)
- `project_info` table
- Initial sample data matching the design.

---

## 🚀 Step 4: Running Locally

### Option 1: Run Backend & Frontend in separate terminals

**Terminal 1 (Backend Server):**
```bash
cd server
yarn dev
```
Server will start on `http://localhost:5000`.

**Terminal 2 (Frontend Client):**
```bash
cd client
yarn dev
```
Client will start on `http://localhost:5173`. Open this URL in your browser!

---

## 🌟 Features Included

- **Task Management**: Add new tasks, edit existing tasks, delete tasks with live database synchronization.
- **Draggable Progress Bar**: Drag the progress bar with cursor/touch; updates the database and reflects immediately on the timeline.
- **Dynamic Timeline**: Shows real month names and 4 weekly columns per month based on the project start/end dates.
- **Zoom Controls**:
  - `+` and `-` zoom buttons on the toolbar.
  - **Cursor Zoom**: Hover over the timeline and use `Ctrl + Mouse Wheel` (or touchpad pinch) to zoom in and out smoothly.
- **Dark Mode Toggle**: Persistent dark theme saved to `localStorage` with cohesive olive dark palette.
- **Mobile Responsive**: Smooth horizontal scroll and stacked metadata layout on mobile viewports.

---

## 🚢 Heroku Deployment (One Push)

The app is pre-configured to build both frontend and backend for a single-dyno Heroku deployment:

1. **Login to Heroku CLI:**
   ```bash
   heroku login
   heroku create your-gantt-app-name
   ```

2. **Add Heroku Postgres:**
   ```bash
   heroku addons:create heroku-postgresql:essential-0
   ```

3. **Deploy with Git:**
   ```bash
   git add .
   git commit -m "Deploy full-stack Gantt Chart to Heroku"
   git push heroku main
   ```

4. **Run Seed on Heroku:**
   ```bash
   heroku run yarn seed
   ```

5. **Open App:**
   ```bash
   heroku open
   ```
