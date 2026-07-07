import 'dotenv/config'; // This automatically loads your .env file
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
// import { DATABASE_URL } from '$app/env/private';
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = new Database(process.env.DATABASE_URL);

export const db = drizzle(client, { schema });
