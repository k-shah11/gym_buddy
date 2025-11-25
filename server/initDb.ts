import pg from 'pg';

let initialized = false;

// Timeout promise helper
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
    )
  ]);
}

export async function initializeDatabase() {
  if (initialized) return;
  
  try {
    const client = new pg.Client({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000,
    });
    
    // Connect with timeout
    await withTimeout(client.connect(), 10000);

    try {
      // Test if users table exists
      await client.query('SELECT 1 FROM users LIMIT 1');
      console.log("[DB] Schema already initialized");
    } catch (error: any) {
      if (error?.code === "42P01") {
        // Table doesn't exist, create schema
        console.log("[DB] Creating schema...");
        
        const statements = [
          `CREATE TABLE IF NOT EXISTS sessions (
            sid VARCHAR PRIMARY KEY,
            sess JSONB NOT NULL,
            expire TIMESTAMP NOT NULL
          )`,
          
          `CREATE TABLE IF NOT EXISTS users (
            id VARCHAR PRIMARY KEY,
            email VARCHAR NOT NULL UNIQUE,
            "firstName" VARCHAR,
            "lastName" VARCHAR,
            "profileImageUrl" VARCHAR,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )`,
          
          `CREATE TABLE IF NOT EXISTS pairs (
            id VARCHAR PRIMARY KEY,
            "userAId" VARCHAR NOT NULL REFERENCES users(id),
            "userBId" VARCHAR NOT NULL REFERENCES users(id),
            "potBalance" INTEGER DEFAULT 0,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )`,
          
          `CREATE TABLE IF NOT EXISTS workouts (
            id VARCHAR PRIMARY KEY,
            "userId" VARCHAR NOT NULL REFERENCES users(id),
            date DATE NOT NULL,
            status VARCHAR NOT NULL,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )`,
          
          `CREATE TABLE IF NOT EXISTS settlements (
            id VARCHAR PRIMARY KEY,
            "pairId" VARCHAR NOT NULL REFERENCES pairs(id),
            "weekStartDate" DATE NOT NULL,
            "winnerUserId" VARCHAR NOT NULL REFERENCES users(id),
            "loserUserId" VARCHAR NOT NULL REFERENCES users(id),
            amount INTEGER NOT NULL,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )`,
          
          `CREATE TABLE IF NOT EXISTS buddy_invitations (
            id VARCHAR PRIMARY KEY,
            "inviterUserId" VARCHAR NOT NULL REFERENCES users(id),
            "inviteeEmail" VARCHAR NOT NULL,
            "inviteeName" VARCHAR,
            status VARCHAR DEFAULT 'pending',
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "acceptedAt" TIMESTAMP
          )`,
          
          `CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts("userId", date)`,
          `CREATE INDEX IF NOT EXISTS idx_settlements_pair ON settlements("pairId")`,
          `CREATE INDEX IF NOT EXISTS idx_pairs_users ON pairs("userAId", "userBId")`,
          `CREATE INDEX IF NOT EXISTS idx_buddy_invitations_email ON buddy_invitations("inviteeEmail")`,
          `CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions(expire)`,
        ];

        for (const statement of statements) {
          try {
            await client.query(statement);
          } catch (err: any) {
            if (err?.code !== "42P07") { // Ignore "already exists" errors
              console.error("[DB] Error executing schema statement:", err);
              throw err;
            }
          }
        }
        
        console.log("[DB] Schema created successfully");
      } else {
        throw error;
      }
    }
    
    await client.end();
    initialized = true;
  } catch (error) {
    console.error("[DB] Database initialization failed:", error);
    throw error;
  }
}
