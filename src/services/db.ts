import { Database } from "bun:sqlite";
import { createTablesIfNotExist } from "src/models/website";

// Initialize the SQLite database
export const db = new Database("voyant.sqlite", { create: true });

export async function connect() {
	try {
		// Create your tables here
		createTablesIfNotExist();
		console.info("Connected to SQLite database");
	} catch (error) {
		console.error("Error connecting to SQLite:", error);
		await disconnect();
	}
}

export async function disconnect() {
	try {
		db.close();
		console.info("Disconnected from SQLite database");
	} catch (error) {
		console.error("Error disconnecting from SQLite:", error);
	}
}

// Export the database instance
export default db;
