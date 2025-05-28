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
    // console.log("File uploaded on cloudinary. File src: " + response.url);
    try {
      fs.unlinkSync(localFilePath);
    } catch (error) {
      console.log('Error deleting local file', error);
    }
    return response;
  } catch (error) {
    console.log('Cloudinary error', error);
    try {
      fs.unlinkSync(localFilePath);
    } catch (error) {
      console.log('Error deleting local file', error);
    }
    return null;
  }
};

export {uploadOnCloudinary}
