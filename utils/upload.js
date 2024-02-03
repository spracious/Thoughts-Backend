const cloudinary = require("cloudinary").v2;
const multer = require("multer");
require("dotenv").config();
// Configure Cloudinary with your API credentials
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  });

  async function handleUpload(file) {
    const res = await cloudinary.uploader.upload(file, {});
    return res;
  }

  
const upload = multer({ storage: multer.memoryStorage() });

module.exports ={
    upload,
    handleUpload
}