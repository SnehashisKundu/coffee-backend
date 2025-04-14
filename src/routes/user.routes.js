import { Router } from "express";
import {loginUser, logoutuser, registerUser,refreshaccesstoken, changePassword, getUserProfile, updateAccountDetails, updateUserAvatar, updateCoverImage, getuserChannelProfile, getwatchhistory} from "../controllers/user.controller.js";
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

router.route("/logout").post(verifyJWT,logoutuser);
router.route("/refresh-token").post(refreshaccesstoken);
router.route("/change-password").post(verifyJWT,changePassword);
router.route("/current-user").get(verifyJWT,getUserProfile);
router.route("/update-profile").patch(verifyJWT,updateAccountDetails);
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar);
router.route("/cover-image").patch(verifyJWT,upload.single("/coverImage"),updateCoverImage);
router.route("/c/:username").get(verifyJWT,getuserChannelProfile);
router.route("/history").get(verifyJWT,getwatchhistory);
export default router;