import asyncHandler from '../utils/asyncHandlers.js';
import ApiError from '../utils/ApiError.js';
import { User } from '../models/user.models.js';
import ApiResponse from '../utils/ApiResponse.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { jwt }  from 'jsonwebtoken';

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

    // (rest of the implementation)

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
     let coverImageLocalPath;
     if(req.files && Array.isArray(req.files.coverImage)
        && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path;
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

const  loginUser = asyncHandler( async (req, res) => {
    // request body -> data 
    // username or email 
    // find the user
    // check the password 
    // generate access token and refresh token
    // send cookies and response to the frontend

    const {email, username, password} = req.body;

    if(! username && ! email ) {
        throw new ApiError(400, 'Username or email is required');
    }

    const user = await User.findOne({
        $or: [{email}, {username}]
    });

    if(!user) {
        throw new ApiError(404, 'User not found');
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid) {
        throw new ApiError(401, 'Invalid credentials');
    }


    const generateAccessAndRefreshTokens = async (UserId) => {
        try {
            const user = await User.findById(UserId);
            const accessToken = await user.generateAccessToken();
            const refreshToken = await user.generateRefreshToken();
            return { accessToken, refreshToken };
        } catch (error) {
            throw new ApiError(500, 'Error while generating tokens');
        }
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select('-password -refreshToken');

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200).cookie(
        "accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, 'User logged in successfully', {
            user: loggedInUser,
            accessToken,
            refreshToken,
        }))
});

const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, 
    { 
        $set: 
        { 
            refreshToken: undefined 
        } },
         { 
            new: true 
        });
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, 'User logged out successfully'));
});

const refreshAccessToken = asyncHandler(async(req,res)=> {
    const incomingRefreshToken = req.cookie.refreshToken
    if(!incomingRefreshToken) {
        throw new ApiError(401, 'Unauthorized request');
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.Refresh_Token_Secret
        );
        const user = await User.findById(decodedToken?._id)
    
        if(!user) {
            throw new ApiError(404, 'Invalid refresh token - user not found');
         }
        
         if(incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used");
         }
    
         const options = {
            httpOnly: true,
            secure: true,
         }
         const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)
    
         return res.status(200) 
         .cookie("accessToken", accessToken, options)
         .cookie("refreshToken", newRefreshToken, options)
         .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                'Access token refreshed successfully'
            )
         )
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh token");
    }
     
})


export {registerUser, loginUser, logoutUser, refreshAccessToken};