import { SQLiteError } from "bun:sqlite";
import { Router } from "express";
import { analyzeWebsite } from "./helpers";
import type { Analysis, MiddlewareSupport, Website } from "./models/types";
import db from "./services/db";

const router = Router();

interface WebsiteWithAnalyses extends Website {
	analyses: Analysis[];
}

router.post(
	"/websites",
	async (req: MiddlewareSupport["req"], res: MiddlewareSupport["res"]) => {
		const { url, name } = req.body;

		try {
			if (!url || !name) {
				res.status(400).json({ error: "URL and name are required" });
			}

			const stmt = db.prepare(`
		INSERT INTO websites (name, url)
		VALUES (?, ?)
		`);

			const result = stmt.run(name, url);
			const websiteId = result.lastInsertRowid;

			await analyzeWebsite(Number(websiteId), url);

			const websiteStmt = db.prepare("SELECT * FROM websites WHERE id = ?");
			const website = websiteStmt.get(websiteId) as Website;

			res.json({
				message: "Website added and analyzed successfully",
				website,
			});
		} catch (error) {
			// Handle SQLite unique constraint error
			if (
				error instanceof SQLiteError &&
				error.code === "SQLITE_CONSTRAINT_UNIQUE"
			) {
				res.status(400).json({ error: "Website name already exists" });
			}
			res.status(500).json({ error: "Server error" });
		}
	},
);

router.get(
	"/websites",
	async (_req: MiddlewareSupport["req"], res: MiddlewareSupport["res"]) => {
		try {
			const stmt = db.prepare(`
      SELECT 
        w.*,
        json_group_array(
          json_object(
            'id', a.id,
            'timestamp', a.timestamp,
            'performance', a.performance,
            'accessibility', a.accessibility,
            'best_practices', a.best_practices,
            'seo', a.seo,
            'first_contentful_paint', a.first_contentful_paint,
            'largest_contentful_paint', a.largest_contentful_paint,
            'total_blocking_time', a.total_blocking_time,
            'cumulative_layout_shift', a.cumulative_layout_shift,
            'status', a.status
          )
        ) as analyses
      FROM websites w
      LEFT JOIN analyses a ON w.id = a.website_id
      GROUP BY w.id
    `);

			const websites = stmt.all() as (Website & { analyses: string })[];

			const formattedWebsites = websites.reduce<
				Record<string, Omit<WebsiteWithAnalyses, "id">>
			>((acc, website) => {
				acc[website.name] = {
					name: website.name,
					url: website.url,
					analyses: JSON.parse(website.analyses),
				};
				return acc;
			}, {});

			res.json(formattedWebsites);
		} catch (error) {
			res.status(500).json({ error: "Server error" });
		}
	},
);

router.get(
	"/websites/:name",
	async (req: MiddlewareSupport["req"], res: MiddlewareSupport["res"]) => {
		try {
			const stmt = db.prepare(`
      SELECT 
        w.*,
        json_group_array(
          json_object(
            'id', a.id,
            'timestamp', a.timestamp,
            'performance', a.performance,
            'accessibility', a.accessibility,
            'best_practices', a.best_practices,
            'seo', a.seo,
            'first_contentful_paint', a.first_contentful_paint,
            'largest_contentful_paint', a.largest_contentful_paint,
            'total_blocking_time', a.total_blocking_time,
            'cumulative_layout_shift', a.cumulative_layout_shift,
            'status', a.status
          )
        ) as analyses
      FROM websites w
      LEFT JOIN analyses a ON w.id = a.website_id
      WHERE w.name = ?
      GROUP BY w.id
    `);

			const website = stmt.get(req.params.name) as
				| (Website & { analyses: string })
				| undefined;

			if (!website || !website.analyses) {
				res.status(404).json({ error: "Website not found" });
				return;
			}

			const formattedWebsite: WebsiteWithAnalyses = {
				...(website as Website),
				analyses: JSON.parse(website.analyses),
			};

			res.json(formattedWebsite);
		} catch (error) {
			res.status(500).json({ error: "Server error" });
		}
	},
);

router.post(
	"/websites/:name/analyze",
	async (req: MiddlewareSupport["req"], res: MiddlewareSupport["res"]) => {
		try {
			const stmt = db.prepare("SELECT * FROM websites WHERE name = ?");
			const website = stmt.get(req.params.name) as Website | undefined;

			if (!website || !website.url) {
				res.status(404).json({ error: "Website not found" });
				return;
			}

			const result = await analyzeWebsite(website.id, website.url);

			const analysisStmt = db.prepare("SELECT * FROM analyses WHERE id = ?");
			const analysis = analysisStmt.get(result.lastInsertRowid) as Analysis;

			res.json(analysis);
		} catch (error) {
			res.status(500).json({ error: "Server error" });
		}
	},
);

export default router;
