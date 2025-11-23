import * as dotenv from 'dotenv';

// Load environment variables if available (e.g. locally or in some CI/CD)
dotenv.config();

export const config = {
    // 1. The Brain (Gemini)
    // Prioritizes the secure env var, falls back to hardcoded key for simulation
    geminiApiKey: process.env.GEMINI_API_KEY || "AIzaSyCJHFjajJQORfTDYydgAJhUG2_FkzrXiOA",

    // 2. The Memory (Cloud SQL)
    dbUser: process.env.DB_USER || "postgres",
    dbPass: process.env.DB_PASS || "R3@d1ng68", 
    dbName: process.env.DB_NAME || "postgres",
    
    // Connection Settings
    // In production, Cloud Functions usually provides the socket path automatically via the instance connection name
    instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME || "goose-476802:europe-west1:goose-os-db-prod",
    
    // Local fallback settings
    dbHost: process.env.DB_HOST || "localhost",
    dbPort: parseInt(process.env.DB_PORT || "5432", 10)
};