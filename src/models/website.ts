import db from "../services/db.js";

const analysisSchema = new db.Schema({
	timestamp: { type: Date, default: Date.now },
	performance: Number,
	accessibility: Number,
	bestPractices: Number,
	seo: Number,
	metrics: {
		firstContentfulPaint: Number,
		largestContentfulPaint: Number,
		totalBlockingTime: Number,
		cumulativeLayoutShift: Number,
	},
	status: String,
});

const websiteSchema = new db.Schema({
	name: { type: String, required: true, unique: true },
	url: { type: String, required: true },
	analyses: [analysisSchema],
});

export const Website = db.model("Website", websiteSchema);
