import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { uploadoncloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"
import { subscribe } from "diagnostics_channel";


const generateAccessTokenAndRefreshtoken= async (userId)=>{
    try{
        const user=await User.findById(userId)
        const accesstoken= user.generateAccessToken();
        const refreshtoken= user.generateRefreshToken();

        user.refreshtoken= refreshtoken
        await user.save({validateBeforeSave:false});
        return {accesstoken,refreshtoken};
    }catch(error){
        throw new ApiError(500,"Somethong went wrong while generating refreshh and access token.")
    }
}
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
    // let cipath;
    // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage<0){
    //     cipath=req.files.coverImage[0].path;
    // } //returning blank array

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

const loginUser=asynchandler(async(req,res)=>{

    const {email,username,password}=req.body

    if(!(username||email)){
        throw new ApiError(400,"Username or email is required")
    }
    const user= await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User doesn't exist");
    }

    const isPasswordvaild = await user.isPasswordCorrect(password);
    //console.log("Password:",password);checking purpose

    if(!isPasswordvaild){
        throw new ApiError(404,"Invalid user credentials");
    }

    const {accesstoken,refreshtoken} =await generateAccessTokenAndRefreshtoken(user._id);

    const loggedInuser= await User.findById(user._id).select(
        "-password -refreshtoken"
    )

    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .cookie("accesstoken",accesstoken,options)
    .cookie("refreshtoken",refreshtoken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInuser,accesstoken,refreshtoken
        },
        "User logged in successfully."
       )
    )

})

const logoutuser=asynchandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshtoken:null
            }
        },
        {
            new:true
        }
    )

    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accesstoken",options)
    .clearCookie("refereshtoken",options)
    .json(new ApiResponse(200,{},"User logged out."));
})

const refreshaccesstoken=asynchandler(async(req,res)=>{
    const incomingRefreshtoken=req.cookies.refreshtoken || req.body.refreshtoken

    if(!incomingRefreshtoken){
        throw new ApiError(401,"unauthorizedd request")
    }
    try {
        const decodedToken=jwt.verify(
            incomingRefreshtoken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user=await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"INVALID REFRESH TOKEN")
        }
    
        if(incomingRefreshtoken!==user?.refreshtoken){
            throw new ApiError(401,"Refresh token is not valid.")
        }
        const options={
            httpOnly:true,
            secure:true
        }
        const {accesstoken,newrefreshtoken}=await generateAccessTokenAndRefreshtoken(user._id);
        return res
        .status(200)
        .cookie("accesstoken",accesstoken,options)
        .cookie("refereshtoken",newrefreshtoken,options)
        .json(
            new ApiResponse(
                200,
                {accesstoken,newrefreshtoken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message||"Invalid user token")
    }
})

const changePassword=asynchandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body
    const user=await User.findById(req.user?._id)
    const isPasswordCorrect=user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(400,"Old Password Is Incorrect")
    }
    user.password=newPassword;
    await user.save({
        validateBeforeSave:false
    })
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Passowrd Changed Successfully."))
})

const getUserProfile=asynchandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"User Profile Fetched Successfully."))
})

const updateAccountDetails=asynchandler(async(req,res)=>{
    const {fullname,email}=req.body
    if(!fullname||!email){
        throw new ApiError(400,"All fields are required.")
    }
    const user=await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                fullname,
                email:email
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"User Profile Updated Successfully."))
})

const updateUserAvatar=asynchandler(async(req,res)=>{
    const avatarLocalPath=req.files?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar File is required.")
    }

    const avatar=await uploadoncloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(400,"Avatar File upload failed.")
    }
    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },{new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"User Avatar Updated Successfully"))
})

const updateCoverImage=asynchandler(async(req,res)=>{
    const coverImageLocalPath=req.files?.path
    if(!coverImageLocalPath){
        throw new ApiError(400,"Coverimage File is required.")
    }

    const coverImage=await uploadoncloudinary(coverImageLocalPath)
    if(!coverImage.url){
        throw new ApiError(400,"Cover-Image File upload failed.")
    }
    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },{new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"User Coverimage Updated Successfully"))
})

const getuserChannelProfile=asynchandler(async(req,res)=>
{
    const {username}=req.params

    if(username?.trim()){
        throw new ApiError(400,"username is missing.")
    }
    const channel=User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subsciptions" ,       //in model all the fields are in lowercase and be the plural form of the model name
                localFieldL:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subsciptions" ,
                localFieldL:"_id",
                foreignField:"subscriber",
                as:"subscriberdto"
            }
        },
        {
            $addFields:{
                subscribedCount:{
                    $size:"$subscribers"
                },
                subscriptionCount:{
                    $size:"$subscribedto"
                },
                issubscribed:{
                    $cond:{
                        if:{$in:[req.user._id,"$subscribers.subscriber"]},
                        then:false,
                        else:true
                    }
                }
            }
        },
        {
            $project:{
                fullname:1,
                username:1,
                avatar:1,
                coverImage:1,
                email:1,
                subscribedCount:1,
                subscriptionCount:1
            }
        }
    ])
})
export {
     registerUser,
     loginUser,
     logoutuser,
     refreshaccesstoken,
     changePassword,
     getUserProfile,
     updateAccountDetails,
     updateUserAvatar,
     updateCoverImage,
     getuserChannelProfile
    };
