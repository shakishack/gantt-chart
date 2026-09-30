-- Database Schema for Smart Gantt Chart App

-- 1. Project Information Table
CREATE TABLE IF NOT EXISTS project_info (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) DEFAULT '',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Divisions Table (Linked to project_info)
CREATE TABLE IF NOT EXISTS divisions (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES project_info(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Gantt Chart Tasks Table (Linked to project_info and divisions)
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL UNIQUE,
  title VARCHAR(255) PRIMARY KEY,
  project_id INTEGER REFERENCES project_info(id) ON DELETE CASCADE,
  division_id INTEGER REFERENCES divisions(id) ON DELETE SET NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  by_month VARCHAR(50),
  by_week VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure project_id column exists if tables were previously created without it
ALTER TABLE divisions ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES project_info(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES project_info(id) ON DELETE CASCADE;