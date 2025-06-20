import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import dotenv from "dotenv"
dotenv.config()

cloudinary.config({ 
    cloud_name: process.env.CLOUDNARY_CLOUD_NAME, 
    api_key: process.env.CLOUDNARY_API_KEY, 
    api_secret: process.env.CLOUDNARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.log('No local path');
      return null;
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });

    // ✅ Safely delete local file
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
      console.log("✅ Local file deleted:", localFilePath);
    } else {
      console.log("⚠️ Local file not found:", localFilePath);
    }

    return response;

  } catch (error) {
    console.log('❌ Cloudinary error:', error);

    // Try deleting local file even on error
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
        console.log("✅ Local file deleted after error:", localFilePath);
      } catch (err) {
        console.log("❌ Error deleting file after upload fail:", err);
      }
    }

    return null;
  }
};

export { uploadOnCloudinary };
