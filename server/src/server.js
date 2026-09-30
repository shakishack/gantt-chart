import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import taskRoutes from './routes/taskRoutes.js';
import divisionRoutes from './routes/divisionRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import { db } from './db/db.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration supporting dynamic localhost development ports and CLIENT_ORIGIN
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
    if (process.env.CLIENT_ORIGIN && origin === process.env.CLIENT_ORIGIN) return callback(null, true);
    callback(null, true);
  },
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check route
app.get('/api/health', async (req, res) => {
  try {
    const dbCheck = await db.one('SELECT 1 AS status');
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      database: dbCheck.status === 1 ? 'connected' : 'unknown'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Database connection error',
      error: error.message
    });
  }
});

// Base API Info route
app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Smart Gantt Chart API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      project: '/api/project',
      tasks: '/api/tasks',
      divisions: '/api/divisions'
    }
  });
});

// API Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/division', divisionRoutes);
app.use('/api/divisions', divisionRoutes); // Support plural as alias
app.use('/api/project', projectRoutes);

// Production deployment: Serve static frontend files from client/dist
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));

  // Catch-all route to serve React index.html for client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Friendly dev welcome route
  app.get('/', (req, res) => {
    res.send({
      message: 'Smart Gantt Chart Express API is running in development mode.',
      documentation: 'Visit frontend on Vite dev server (usually http://localhost:5173)'
    });
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`Smart Gantt Chart Server running on port ${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`API available at http://localhost:${PORT}/api`);
    if (process.env.CLIENT_ORIGIN) {
      console.log(`Allowed CORS Origin: ${process.env.CLIENT_ORIGIN}`);
    }
  }
});
