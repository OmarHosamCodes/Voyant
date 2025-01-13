import express from "express";
import { connect } from "./services/db.js";
import { runAnalysis } from "./helpers.js";
import routes from "./routes.js";
import { config } from "dotenv";

config();
const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use("/api", routes);

const RETRY_INTERVAL = Number(process.env.RETRY_INTERVAL) || 60000;
setInterval(runAnalysis, RETRY_INTERVAL);

const port = Number(process.env.PORT) || 3000;

const startServer = async () => {
	try {
		await connect();
		app.listen(port, () => {
			console.log(`Server running on port ${port}`);
		});
	} catch (error) {
		console.error("Failed to connect to the database:", error);
		process.exit(1);
	}
};

startServer();
