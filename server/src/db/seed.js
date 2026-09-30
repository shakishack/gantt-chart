import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, pgp } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeed() {
  console.log('🔄 Initializing database schema and seed data...');
  try {
    const schemaPath = path.resolve(__dirname, '../../schema.sql');
    const seedPath = path.resolve(__dirname, '../../seed.sql');

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log('📦 Creating tables...');
    await db.none(schemaSql);
    console.log('✅ Tables created successfully.');

    console.log('🌱 Inserting seed data...');
    await db.none(seedSql);
    console.log('✅ Seed data inserted successfully!');

    // Show summary
    const divisionsCount = await db.one('SELECT count(*) FROM divisions');
    const tasksCount = await db.one('SELECT count(*) FROM tasks');
    console.log(`📊 Current Database Summary: ${divisionsCount.count} divisions, ${tasksCount.count} tasks.`);

  } catch (err) {
    console.error('❌ Error seeding database:', err.message || err);
    process.exitCode = 1;
  } finally {
    pgp.end();
  }
}

runSeed();
