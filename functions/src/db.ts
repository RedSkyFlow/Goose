
import { Pool, PoolConfig } from 'pg';
import { config } from './config';

const dbConfig: PoolConfig = {
  user: config.dbUser,
  database: config.dbName,
  password: config.dbPass,
  port: config.dbPort,
};

// If INSTANCE_CONNECTION_NAME is provided (e.g., for Cloud Functions deployment), 
// use the Unix socket connection. Otherwise, fallback to TCP (local dev).
// Note: In this specific environment, we prioritize the socket if it looks like we are in a Google Cloud environment,
// but usually locally you'd use TCP. Given the user provided a connection name, we'll set logic to use it if NODE_ENV is production
// or if we force it. For now, we will assume TCP 'localhost' for local dev unless deployed.

if (process.env.NODE_ENV === 'production' && config.instanceConnectionName) {
  dbConfig.host = `/cloudsql/${config.instanceConnectionName}`;
} else {
  // For local development or if using public IP
  dbConfig.host = config.dbHost; 
}

export const pool = new Pool(dbConfig);

export const query = (text: string, params?: any[]) => pool.query(text, params);
