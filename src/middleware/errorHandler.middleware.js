import mongoose from "mongoose";
import { ApiError } from "../utils/api-errors.js";

export const errorHandler = (err, req, res, next) => {
	let error = err;
	if (!(error instanceof ApiError)) {
		let statusCode = error.statusCode || (error instanceof mongoose.Error ? 400 : 500);
		let message = error.message || "Something went Wrong."

		if (message === "jwt expired") {
			message = "Your session has expired. Please log in again.";
			statusCode = 401; // Unauthorized
		  }

		error = new ApiError(
			statusCode,
			message,
			Array.isArray(error.errors) ? error.errors : error?.errors || [],
			err.stack
		)
	}
	const response = {
		statusCode: error.statusCode,
		success: false,
		message: error.message,
		errors: error.errors,
		...(process.env.NODE_ENV=== "development" ? {stack: error.stack}:{})
	}
	return res.status(error.statusCode).json(response);
}