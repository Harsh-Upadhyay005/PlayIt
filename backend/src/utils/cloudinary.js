import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
import { Readable } from "stream"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadBufferToCloudinary = async (buffer) => {
    return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
                if (error) {
                    reject(error)
                    return
                }
                resolve(result)
            }
        )

        Readable.from(buffer).pipe(uploadStream)
    })
}

const uploadToCloudinary = async (fileInput) => {
    let localPath

    try {
        if (!fileInput) return null

        if (Buffer.isBuffer(fileInput)) {
            const response = await uploadBufferToCloudinary(fileInput)
            return response?.secure_url || null
        }

        if (typeof fileInput === "object" && fileInput?.buffer) {
            const response = await uploadBufferToCloudinary(fileInput.buffer)
            return response?.secure_url || null
        }

        localPath = typeof fileInput === "string" ? fileInput : fileInput?.path
        if (!localPath || !fs.existsSync(localPath)) {
            throw new Error(`Local file not found at path: ${localPath}`)
        }

        const response = await cloudinary.uploader.upload(localPath, {
            resource_type: "auto",
        })
        fs.unlinkSync(localPath)
        return response?.secure_url || null

    } catch (error) {   
        console.error("Error uploading to Cloudinary:", error)
        throw new Error("Failed to upload file to Cloudinary")
    } finally {
        if (localPath && fs.existsSync(localPath)) {
            fs.unlinkSync(localPath)
        }
    }
}

export { uploadToCloudinary }
