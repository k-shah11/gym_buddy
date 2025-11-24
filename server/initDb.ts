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
          `CREATE TABLE IF NOT EXISTS users (
            id VARCHAR PRIMARY KEY,
            email VARCHAR NOT NULL UNIQUE,
            first_name VARCHAR,
            last_name VARCHAR,
            profile_image_url VARCHAR,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )`,
          
          `CREATE TABLE IF NOT EXISTS pairs (
            id VARCHAR PRIMARY KEY,
            user_a_id VARCHAR NOT NULL REFERENCES users(id),
            user_b_id VARCHAR NOT NULL REFERENCES users(id),
            pot_balance INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )`,
          
          `CREATE TABLE IF NOT EXISTS workouts (
            id VARCHAR PRIMARY KEY,
            user_id VARCHAR NOT NULL REFERENCES users(id),
            date DATE NOT NULL,
            status VARCHAR NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )`,
          
          `CREATE TABLE IF NOT EXISTS settlements (
            id VARCHAR PRIMARY KEY,
            pair_id VARCHAR NOT NULL REFERENCES pairs(id),
            week_start_date DATE NOT NULL,
            winner_user_id VARCHAR NOT NULL REFERENCES users(id),
            loser_user_id VARCHAR NOT NULL REFERENCES users(id),
            amount INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )`,
          
          `CREATE TABLE IF NOT EXISTS buddy_invitations (
            id VARCHAR PRIMARY KEY,
            inviter_user_id VARCHAR NOT NULL REFERENCES users(id),
            invitee_email VARCHAR NOT NULL,
            invitee_name VARCHAR,
            status VARCHAR DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            accepted_at TIMESTAMP
          )`,
          
          `CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, date)`,
          `CREATE INDEX IF NOT EXISTS idx_settlements_pair ON settlements(pair_id)`,
          `CREATE INDEX IF NOT EXISTS idx_pairs_users ON pairs(user_a_id, user_b_id)`,
          `CREATE INDEX IF NOT EXISTS idx_buddy_invitations_email ON buddy_invitations(invitee_email)`,
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
