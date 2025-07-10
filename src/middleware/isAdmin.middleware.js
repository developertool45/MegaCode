import { ApiError } from "../utils/api-errors.js";
import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import { UserRolesEnum } from "../utils/contants.js";
import { ProjectMember } from "../models/projectmember.models.js";

export const isAdmin = asyncHandler(async (req, res, next) => {
	console.log("=====isAdmin middleware=====");
	
	const userId = req.user._id;
	if (!userId) {
		throw new ApiError(401, "Unauthorized request! Please login first.");
	}
	const user = await User.findById(userId);
	if (!user) {
		throw new ApiError(404, "User not found!");
	}
	if (user.role !== UserRolesEnum.ADMIN) {
		const projecetMember = await ProjectMember.findOne({
			project: req.params.projectId,
			user: userId
		})

		if (!projecetMember) {
			throw new ApiError(403, " you are not member of this project");
		}
		if (projecetMember.role !== UserRolesEnum.PROJECT_ADMIN) {
			throw new ApiError(403, "You are not Authorized to perform this action!");
		}
	} 	
	next();
});