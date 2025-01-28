import * as ChromeLauncher from "chrome-launcher";
import { config } from "dotenv";
import lighthouse from "lighthouse";
import { Website } from "./models/website.js";

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
				onlyCategories: [
					"performance",
					"accessibility",
					"best-practices",
					"seo",
				],
			},
		};

		try {
			const runnerResult = await lighthouse(url, options, config);
			console.log("Lighthouse analysis completed:", new Date().toISOString());

			// save the report to disk
			if (!runnerResult) {
				throw new Error("Lighthouse analysis failed to return results");
			}

			const lhr = runnerResult.lhr;

			const payload = {
				performance: (lhr.categories.performance.score ?? 0) * 100,
				accessibility: (lhr.categories.accessibility.score ?? 0) * 100,
				bestPractices: (lhr.categories["best-practices"].score ?? 0) * 100,
				seo: (lhr.categories.seo.score ?? 0) * 100,
				metrics: {
					firstContentfulPaint:
						lhr.audits["first-contentful-paint"].numericValue,
					largestContentfulPaint:
						lhr.audits["largest-contentful-paint"].numericValue,
					totalBlockingTime: lhr.audits["total-blocking-time"].numericValue,
					cumulativeLayoutShift:
						lhr.audits["cumulative-layout-shift"].numericValue,
				},
			};

			console.log("Lighthouse analysis completed:", new Date().toISOString());
			console.info("Lighthouse analysis results:", payload);

			return payload;
		} finally {
			await chrome.kill();
		}
}

export async function analyzeWebsite(url: string) {
  try {
			const lighthouseResults = await runLighthouseAnalysis(url);

			return {
				timestamp: new Date(),
				...lighthouseResults,
			};
		} catch (error) {
			return {
				timestamp: new Date(),
				status: "error",
				error: (error as unknown as Error).message,
			};
		}
}

// API Routes

export async function runAnalysis() {
  try {
			const websites = await Website.find();

			for (const website of websites) {
				const analysis = await analyzeWebsite(website.url);
				website.analyses.push(analysis);

				if (website.analyses.length > 30) {
					const analysesToKeep = website.analyses.slice(-30);
					website.analyses.splice(0, website.analyses.length);
					website.analyses.push(...analysesToKeep);
				}

				await website.save();
			}

			console.log("Analysis completed:", new Date().toISOString());
		} catch (error) {
			console.error("Error in analysis:", error);
		}
}
