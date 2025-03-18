import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { uploadoncloudinary } from "../utils/cloudinary.js";

const registerUser = asynchandler(async (req, res) => {
    const { username, fullname, email, password } = req.body;
    // console.log("email", email);
    // console.log("password", password);
    // console.log("fullname", fullname);

    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with given username already exists");
    }

    const avatarpath = req.files?.avatar?.[0]?.path;
    const cipath = req.files?.coverImage?.[0]?.path;

    if (!avatarpath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadoncloudinary(avatarpath);
    const coverImage = cipath ? await uploadoncloudinary(cipath) : null;

    if (!avatar) {
        throw new ApiError(400, "Avatar file upload failed");
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    const xuser = await User.findById(user._id).select("-password -refreshtoken");

    if (!xuser) {
        throw new ApiError(500, "Something went wrong while registering the user.");
    }

    return res.status(201).json(new ApiResponse(200, xuser, "User registered successfully."));
});

export { registerUser };
