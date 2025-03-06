import { v2 as cloudinary, v2 } from 'cloudinary';
import { response } from 'express';
import fs from "fs"
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key:process.env.CLOUDINARY_API_KEY , 
        api_secret:process.env.CLOUDINARY_API_SECRET
    });
    
    const uploadoncloudinary=async (localfilePath)=>{
        try{
            if(!localfilePath) return null
            cloudinary.uploader.upload(localfilePath,{
                resource_type:auto
            })
            console.log("File has been uploaded successfully.",response.url);
            return response;
        }catch(error){
            fs.unlinkSync(localfilePath);
            return null;
        }
    }

export {uploadoncloudinary}