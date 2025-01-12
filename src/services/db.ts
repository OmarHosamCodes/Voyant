import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DATABASE}${process.env.MONGO_OPTIONS}`;

if (!mongoUri) {
	throw new Error("MONGODB_URI is not set");
}

// Configure mongoose connection options
mongoose.set("strictQuery", true);

export async function connect() {
	try {
		await mongoose.connect(mongoUri, {
			serverApi: {
				version: "1",
				strict: true,
			},
		});
		console.log("Connected successfully to server");
	} catch (error) {
		console.error("Error connecting to MongoDB:", error);
		await disconnect();
	} finally {
		console.info("Connected to MongoDB");
	}
}

export async function disconnect() {
	try {
		await mongoose.disconnect();
	} catch (error) {
		console.error("Error disconnecting from MongoDB:", error);
	} finally {
		console.info("Disconnected from MongoDB");
	}
}

// Export the mongoose instance if needed
export default mongoose;
