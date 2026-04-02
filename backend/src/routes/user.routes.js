import {Router } from 'express';
import { registerUser } from '../controllers/user.controller.js';
import {upload } from "../middlewares/multer.middleware.js";
import { loginUser } from '../controllers/auth.controller.js';
import { verifyJwT } from '../middlewares/auth.middleware.js';

const router = Router();

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
router.route('/logout').post(verifyJwT, logoutUser);

export default router;