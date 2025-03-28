import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadoncloudinary = async (localfilePath) => {
    try {
        if (!localfilePath) return null;

        // Upload file to Cloudinary and wait for the result
        const result = await cloudinary.uploader.upload(localfilePath, {
            resource_type: "auto"
        });

        console.log("File has been uploaded successfully.", result.secure_url);
        fs.unlinkSync(localfilePath);// Delete local file after upload (optional)
        return result; 
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        if (fs.existsSync(localfilePath)) {   // Delete the file if upload fails
            fs.unlinkSync(localfilePath);
        }

        return null;
    }
};

export { uploadoncloudinary };
