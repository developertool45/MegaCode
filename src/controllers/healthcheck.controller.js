import  ApiResponse from "../utils/api-response.js";
export const healthcheck = (req, res) => {
     res.status(200).json(new ApiResponse(200, {message:  "register user working"}));
}



