import express from "express";
import { connect } from "./services/db.js";
import { runAnalysis } from "./helpers.js";
import dotenv from "dotenv";
import routes from "./routes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use("/api", routes);

const RETRY_INTERVAL = process.env.RETRY_INTERVAL || "60000";
setInterval(runAnalysis, Number.parseInt(RETRY_INTERVAL));

const port = process.env.PORT || 3000;
app.listen(port, () => {
	connect();
	console.log(`Server running on port ${port}`);
});
