import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Check if DATABASE_URL is available
const databaseUrl = process.env.DATABASE_URL;
let pool: Pool | null = null;
let db: any = null;

if (databaseUrl) {
  pool = new Pool({ connectionString: databaseUrl });
  db = drizzle({ client: pool, schema });
  console.log('✅ Database connected successfully');
} else {
  console.log('⚠️ DATABASE_URL not found, using in-memory storage');
}

export { pool, db };
