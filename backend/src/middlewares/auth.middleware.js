import asyncHandler from "../utils/asyncHandlers.js";
import ApiError from "../utils/ApiError.js";
import jwt from 'jsonwebtoken';
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers?.authorization?.replace('Bearer ', '');
        if(!token) {
            throw new ApiError(401, 'Unauthorized: No token provided');
        }
        const decodedToken = jwt.verify(token, process.env.Access_Token_Secret);
    
        const user = await User.findById(decodedToken._id).select('-password -refreshToken');
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error.message || 'Unauthorized: Invalid token');
    }
});
   
