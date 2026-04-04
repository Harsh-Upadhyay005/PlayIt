import {Router } from 'express';
import { registerUser } from '../controllers/user.controller.js';
import {upload } from "../middlewares/multer.middleware.js";
import { loginUser, logoutUser } from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
const router = Router();
import { refreshAccessToken } from '../controllers/user.controller.js';

router.route('/register').post(
    
    upload.fields([
        {
            name: 'profilePicture',
            maxCount: 1,
        },
        {
            name: 'coverPicture',
            maxCount: 1,
        }
    ]),
    registerUser
)

router.route('/login').post(loginUser);

// secured route - only for authenticated users
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/refresh-token').post(refreshAccessToken);

export default router;