import {asynchandler} from "../utils/asynchandler.js"
import { ApiError} from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js"

export const verifyJWT= asynchandler(async(req,_,next)=>{
    try {
        const token=req.cookies?.accesstoken ||req.header("Authorization")?.replace("Bearer","")
    
        if (!token){
            throw new ApiError(401,"Unauthorized request")
        }
        const decodedtoken= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    
        const user=await User.findById(decodedtoken?._id).select("-password -refreshtoken")
    
        if(!user){
            throw new ApiError(401,"Invalid access Token")
        }
        req.user=user;
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token");
    }
})