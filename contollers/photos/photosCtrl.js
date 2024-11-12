// const expressAsyncHandler = require("express-async-handler");
// const fs = require("fs");

// const User = require("../../model/user/User");
// const generateToken = require("../../config/token/generateToken");
// const Photo = require("../../model/photos/photos");
// const cloudinaryUploadImg = require("../../utils/cloudinary");
// const sharp = require("sharp");
const expressAsyncHandler = require("express-async-handler");
const streamifier = require("streamifier");
const sharp = require("sharp");
const Photo = require("../../model/photos/photos");
const cloudinary = require("cloudinary").v2; // Ensure you are using the Cloudinary SDK v2

// Cloudinary configuration (make sure this is correctly set up)
cloudinary.config({
  cloud_name: "dzrc9ejln",
  api_key: "363267481229718",
  api_secret: "Kihl35YQ4NQQoaClDbcu7VaC_yI",
  timeout: 120000, // Set timeout to 120 seconds (120000 ms)
});

//----------------------------------------------------------------
//Upload Photo
//----------------------------------------------------------------

const chunkArray = (array, size) => {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
};

const uploadPhotosCtrl = expressAsyncHandler(async (req, res) => {
  console.log("Upload started");

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images provided" });
    }

    const chunks = chunkArray(req.files, 10); // Process in chunks of 5
    const uploadedPhotos = [];

    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(async (file) => {
          // Resize the image using sharp
          const resizedImageBuffer = await sharp(file.buffer)
            .resize(500, 500)
            .toFormat("jpeg")
            .jpeg({ quality: 90 })
            .toBuffer();

          // Upload directly to Cloudinary using the buffer
          const imgUploaded = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                resource_type: "image",
                format: "jpeg",
                public_id: `user-${Date.now()}-${file.originalname}`,
                folder: "photos",
              },
              (error, result) => {
                if (error) {
                  console.error("Cloudinary Upload Error:", error);
                  reject(error);
                } else {
                  console.log("Uploaded image to Cloudinary:");
                  resolve(result);
                }
              }
            );

            // Write the resized buffer to the upload stream
            uploadStream.end(resizedImageBuffer);
          });

          // Create a photo document in MongoDB
          return Photo.create({
            leaderId: req.body?.leaderId,
            date: req.body.date,
            image: imgUploaded.secure_url,
          });
        })
      );

      uploadedPhotos.push(...chunkResults);
    }

    res.status(201).json({
      message: "Photos uploaded successfully",
      photos: uploadedPhotos,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Error uploading photos", error });
  }
});

//-------------------------------
//Fetch al photos
//-------------------------------
const fetchPhotosCtrl = expressAsyncHandler(async (req, res) => {
  // console.log("ss");

  try {
    const photos = await Photo.find({});
    res.json(photos);
  } catch (error) {
    res.json(error);
  }
});

//------------------------------
//Delete Post
//------------------------------

const deletePhotosCtrl = expressAsyncHandler(async (req, res) => {
  const { ids } = req.query; // Extract the photo IDs from the query parameters
  // console.log("ids", ids);

  if (!ids) {
    return res.status(400).json({ message: "No photo IDs provided" });
  }

  const photoIds = ids.split(","); // Convert the comma-separated string into an array

  try {
    const deletedPhotos = await Photo.deleteMany({ _id: { $in: photoIds } }); // Delete photos by IDs
    res.json(deletedPhotos);
  } catch (error) {
    res.status(500).json(error);
  }
});

// module.exports = { uploadPhotosCtrl, fetchPhotosCtrl,  };

module.exports = {
  uploadPhotosCtrl,
  fetchPhotosCtrl,
  deletePhotosCtrl,
};
