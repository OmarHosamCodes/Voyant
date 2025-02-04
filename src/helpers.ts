import * as ChromeLauncher from "chrome-launcher";
import { config } from "dotenv";
import lighthouse from "lighthouse";
import type { Website } from "src/models/types";
import db from "src/services/db";

config();

export async function runLighthouseAnalysis(url: string) {
	const chrome = await ChromeLauncher.launch({
		chromePath: process.env.CHROME_BIN || "/usr/bin/chromium",
		chromeFlags: [
			"--headless",
			"--no-sandbox",
			"--disable-gpu",
			"--disable-dev-shm-usage",
		],
		startingUrl: url,
	});

	console.log("Lighthouse analysis started:", new Date().toISOString());

	const options = {
		logLevel: "info" as const,
		output: "json" as const,
		onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
		port: chrome.port as number | 9222,
	};

	const config = {
		extends: "lighthouse:default",
		settings: {
			onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
		},
	};

	try {
		const runnerResult = await lighthouse(url, options, config);
		console.log("Lighthouse analysis completed:", new Date().toISOString());

		if (!runnerResult) {
			throw new Error("Lighthouse analysis failed to return results");
		}

		const lhr = runnerResult.lhr;
		return {
			performance: (lhr.categories.performance.score ?? 0) * 100,
			accessibility: (lhr.categories.accessibility.score ?? 0) * 100,
			best_practices: (lhr.categories["best-practices"].score ?? 0) * 100,
			seo: (lhr.categories.seo.score ?? 0) * 100,
			first_contentful_paint:
				lhr.audits["first-contentful-paint"].numericValue ?? 0,
			largest_contentful_paint:
				lhr.audits["largest-contentful-paint"].numericValue ?? 0,
			total_blocking_time: lhr.audits["total-blocking-time"].numericValue ?? 0,
			cumulative_layout_shift:
				lhr.audits["cumulative-layout-shift"].numericValue ?? 0,
		};
	} finally {
		await chrome.kill();
	}
}

export async function analyzeWebsite(websiteId: number, url: string) {
	try {
		const results = await runLighthouseAnalysis(url);

		const stmt = db.prepare(`
      INSERT INTO analyses (
        website_id,
        performance,
        accessibility,
        best_practices,
        seo,
        first_contentful_paint,
        largest_contentful_paint,
        total_blocking_time,
        cumulative_layout_shift,
        status
      ) VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        'completed'
      )
    `);

		return stmt.run(
			websiteId,
			results.performance,
			results.accessibility,
			results.best_practices,
			results.seo,
			results.first_contentful_paint,
			results.largest_contentful_paint,
			results.total_blocking_time,
			results.cumulative_layout_shift,
		);
	} catch (error) {
		const stmt = db.prepare(`
      INSERT INTO analyses (
        website_id,
        status
      ) VALUES (?, 'error')
    `);
		return stmt.run(websiteId);
	}
}

export async function runAnalysis() {
	try {
		const stmt = db.prepare("SELECT * FROM websites");
		const websites = stmt.all() as Website[];

		for (const website of websites) {
			await analyzeWebsite(website.id, website.url);
		}
		console.log("Analysis completed:", new Date().toISOString());
	} catch (error) {
		console.error("Error in analysis:", error);
	}
}
