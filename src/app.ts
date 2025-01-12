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

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
setInterval(runAnalysis, ONE_DAY_IN_MS);

const port = process.env.PORT || 3000;
app.listen(port, () => {
	connect();
	console.log(`Server running on port ${port}`);
});
