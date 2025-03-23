import { Router } from "express";
import {loginUser, logoutuser, registerUser,refreshaccesstoken} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer_mid.js";
import {verifyJWT} from "../middlewares/auth_id.js"
const router= Router()
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxcount:1
        },
        {
            name:"coverImage",
            maxcount:1
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT,logoutuser)
router.route("/refresh-token").post(refreshaccesstoken)

export default router;