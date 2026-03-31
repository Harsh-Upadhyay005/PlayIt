import asyncHandler from '../utils/asyncHandlers.js';
import ApiError from '../utils/ApiError.js';
import { User } from '../models/user.models.js';
import ApiResponse from '../utils/ApiResponse.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

const normalizeFieldName = (name = '') => name.toLowerCase().replace(/[\[\]\s_-]/g, '');

const getFileByCandidates = (filesInput, candidates) => {
    if (!filesInput) return null;

    const normalizedCandidates = candidates.map((candidate) => normalizeFieldName(candidate));

    if (Array.isArray(filesInput)) {
        return filesInput.find((file) => normalizedCandidates.includes(normalizeFieldName(file.fieldname)));
    }

    for (const key of Object.keys(filesInput)) {
        if (normalizedCandidates.includes(normalizeFieldName(key)) && filesInput[key]?.[0]) {
            return filesInput[key][0];
        }
    }

    return null;
};

const registerUser = asyncHandler( async (req, res) => {
    // get user details from the frontend 
    // validation - non empty 
    // check if user already exists: username, email
    // check for images, profile picture
    // upload images to cloudinary
    // create user object - create entry in db 
    // remove password and refresh token from the response
    // check for user creation 
    // send response to the frontend

    const { fullName, username, email, password } = req.body;
    console.log("email: ", email);

    // ... (rest of the implementation)

    if ( [fullName, username, email, password]
        .some((field) => field?.trim() === "") )
     {
          throw new ApiError(400, 'All fields are required');
    }

    const existedUser = await User.findOne({
        $or: [{email}, {username}]
    });

    if (existedUser) {
        throw new ApiError(400, 'User with the same email or username already exists');
    }

    const avatarFile = getFileByCandidates(req.files, ['profilePicture', 'avatar', 'profile', 'image']);
    const coverFile = getFileByCandidates(req.files, ['coverPicture', 'cover', 'coverImage']);

    if(!avatarFile) {
        throw new ApiError(400, 'Profile picture is required');
    }

    const profilePicture = await uploadToCloudinary(avatarFile);
    const coverImage = coverFile ? await uploadToCloudinary(coverFile) : null;
    if(!profilePicture) {
        throw new ApiError(500, 'Profile picture upload failed');
     }
     const user = await User.create({
        fullName,
        password,
        profilePicture,
        coverimage: coverImage || "",
        username: username.toLowerCase(),
        email,
     })
     const createdUser = await User.findById(user._id).select('-password -refreshToken');

        if (!createdUser) {
            throw new ApiError(500, 'User creation failed');
        }

        return res.status(201).json (
            new ApiResponse(201, 'User registered successfully', createdUser)
        )

    }

);

export {registerUser}