import pgPromise from 'pg-promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from server root or parent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // Fallback to current working directory .env

// Initialize pg-promise
const pgp = pgPromise({
  // Helpful query logging in development
  query(e) {
    if (process.env.NODE_ENV !== 'production' && process.env.DEBUG_SQL === 'true') {
      console.log('QUERY:', e.query);
    }
  },
  error(err, e) {
    console.error('DATABASE ERROR:', err.message || err);
    if (e.query) {
      console.error('FAILED QUERY:', e.query);
    }
  }
});

// Build database connection options
const isProduction = process.env.NODE_ENV === 'production';
let connectionConfig;

if (process.env.DATABASE_URL) {
  connectionConfig = {
    connectionString: process.env.DATABASE_URL,
    // Heroku PostgreSQL requires SSL with rejectUnauthorized: false
    ssl: isProduction ? { rejectUnauthorized: false } : false
  };
} else {
  connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'gantt_chart_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: isProduction ? { rejectUnauthorized: false } : false
  };
}

const db = pgp(connectionConfig);

export { db, pgp };
