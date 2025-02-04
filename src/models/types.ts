import type express from "express";
export interface Website {
	id: number;
	name: string;
	url: string;
}

export interface Analysis {
	id: number;
	website_id: number;
	timestamp: string;
	performance: number;
	accessibility: number;
	best_practices: number;
	seo: number;
	first_contentful_paint: number;
	largest_contentful_paint: number;
	total_blocking_time: number;
	cumulative_layout_shift: number;
	status: string;
}
export interface MiddlewareSupport extends Express.Request {
	req: express.Request;
	res: express.Response;
	next: express.NextFunction;
}
