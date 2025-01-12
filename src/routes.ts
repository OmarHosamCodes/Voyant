import { Website } from "./models/website.js";
import express from "express";
import { analyzeWebsite } from "./helpers.js";

const router = express.Router();

router.post("/websites", async (req, res) => {
	const { url, name } = req.body;
	try {
		if (!url || !name) {
			res.status(400).json({ error: "URL and name are required" });
		}

		const website = new Website({ name, url });
		const analysis = await analyzeWebsite(url);
		website.analyses.push(analysis);
		await website.save();

		res.json({
			message: "Website added and analyzed successfully",
			analysis,
		});
	} catch (error) {
		if ((error as { code?: number }).code === 11000) {
			res.status(400).json({ error: "Website name already exists" });
		} else {
			res.status(500).json({ error: "Server error" });
		}
	}
});

router.get("/websites", async (_req, res) => {
	try {
		const websites = await Website.find().lean();
		const formattedWebsites = websites.reduce(
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			(acc: { [key: string]: any }, website) => {
				acc[website.name] = {
					url: website.url,
					analyses: website.analyses,
				};
				return acc;
			},
			{},
		);

		res.json(formattedWebsites);
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

router.post("/websites/:name/analyze", async (req, res) => {
	try {
		const website = await Website.findOne({ name: req.params.name });
		if (!website) {
			res.status(404).json({ error: "Website not found" });
			return;
		}

		const analysis = await analyzeWebsite(website.url);
		website.analyses.push(analysis);

		if (website?.analyses.length > 30) {
			const analysesToKeep = website.analyses.slice(-30);
			website.analyses.splice(0, website.analyses.length);
			website.analyses.push(...analysesToKeep);
		}

		await website.save();
		res.json(analysis);
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});

export default router;
