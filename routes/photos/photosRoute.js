const express = require("express");
const {
  uploadPhotosCtrl,
  fetchPhotosCtrl,
  deletePhotosCtrl,
} = require("../../contollers/photos/photosCtrl");
const {
  photoUpload,
  postImgResize,
} = require("../../middlewares/uploads/photosUpload");

const photosRoutes = express.Router();

photosRoutes.post(
  "/upload",
  photoUpload.array("image", 999), // Allow up to 5 images at once
  uploadPhotosCtrl
);

photosRoutes.get("/", fetchPhotosCtrl);
photosRoutes.delete("/", deletePhotosCtrl);

module.exports = photosRoutes;
