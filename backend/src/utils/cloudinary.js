import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadToCloudinary = async (localPath) => {
    try {
        if(!localFilePath) return null 
        // upload the file on Cloudinary
        const response = await cloudinary.uploader.upload(localfilePath, {
            resource_type: "auto",
        })
        return response.secure_url

    } catch (error) {   
        fs.unlinkSync(localPath) // delete the local file     
        console.error("Error uploading to Cloudinary:", error)
        throw new Error("Failed to upload file to Cloudinary")
        }
    }

export { uploadToCloudinary }
export default cloudinary