import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema({
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
});

const websiteSchema = new mongoose.Schema({
	name: { type: String, required: true, unique: true },
	url: { type: String, required: true },
	analyses: [analysisSchema],
});

export const Website = mongoose.model("Website", websiteSchema);
