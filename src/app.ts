import compression from "compression";
import cors from "cors";
import { config } from "dotenv";
import express from "express";
import helmet from "helmet";
import cron from "node-cron";
import { runAnalysis } from "./helpers.js";
import routes from "./routes.js";
import { connect } from "./services/db.js";
config();

const app = express();

const configureMiddlewares = (app: express.Application) => {
	app.use(express.json({ limit: "50mb" }));
	app.use(express.urlencoded({ limit: "50mb", extended: true }));
	app.use(express.static("public"));
	app.use(cors());
	app.use(
		compression({
			level: 6, // Set the compression level (0-9)
			threshold: 0, // Compress all responses
			filter: (req, res) => {
				if (req.headers["x-no-compression"]) {
					// Don't compress responses with this request header
					return false;
				}
				// Fallback to standard filter function
				return compression.filter(req, res);
			},
		}),
	);
	app.use(
		helmet({
			contentSecurityPolicy: false,
		}),
	);
};
const configureRoutes = (app: express.Application) => {
	app.use("/api", routes);
};
const cronSchedule = process.env.CRON_SCHEDULE || "*/1 * * * *"; // Default to every minute
cron.schedule(cronSchedule, runAnalysis);

const port = Number(process.env.PORT) || 3000;

const startServer = async () => {
	try {
		await connect();
		configureMiddlewares(app);
		configureRoutes(app);
		app.listen(port, () => {
			console.log(`Server running on port ${port}`);
		});
	} catch (error) {
		console.error("Failed to connect to the database:", error);
		process.exit(1);
	}
};

startServer();
