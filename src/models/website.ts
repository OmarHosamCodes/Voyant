import db from "src/services/db";

export function createTablesIfNotExist() {
	// Create analyses table
	db.query(`
		CREATE TABLE IF NOT EXISTS analyses (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			website_id INTEGER,
			timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
			performance REAL,
			accessibility REAL,
			best_practices REAL,
			seo REAL,
			first_contentful_paint REAL,
			largest_contentful_paint REAL,
			total_blocking_time REAL,
			cumulative_layout_shift REAL,
			status TEXT,
			FOREIGN KEY(website_id) REFERENCES websites(id)
		)
	`).run();

	// Create websites table
	db.query(`
		CREATE TABLE IF NOT EXISTS websites (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT UNIQUE NOT NULL,
			url TEXT NOT NULL
		)
	`).run();
}

// Helper class to manage websites
// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class Website {
	static create(data: { name: string; url: string }) {
		return db
			.query(`
			INSERT INTO websites (name, url)
			VALUES ($name, $url)
		`)
			.run(data);
	}

	static findById(id: number) {
		return db.query("SELECT * FROM websites WHERE id = $id").get({ id });
	}

	static getAnalyses(websiteId: number) {
		return db
			.query("SELECT * FROM analyses WHERE website_id = $id")
			.all({ id: websiteId });
	}
}
