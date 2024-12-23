const express = require("express");
const {
  userRegisterCtrl,
  loginUserCtrl,
  updateUserCtrl,
  fetchUserDetailsCtrl,
  fetchUsersCtrl,
  updateUserBioCtrl,
  sendOtpCtrl,
  resetPasswordCtrl,
} = require("../../contollers/users/usersCtrl");
const authMiddleware = require("../../middlewares/auth/authMiddleware");
const { photoUpload } = require("../../middlewares/uploads/photosUpload");

const userRoutes = express.Router();

userRoutes.post("/register", userRegisterCtrl);
userRoutes.post("/login", loginUserCtrl);
userRoutes.post("/sendOtp", sendOtpCtrl);
userRoutes.post("/resetPassword", resetPasswordCtrl);
userRoutes.get("/:id", fetchUserDetailsCtrl);
userRoutes.get("/", fetchUsersCtrl);

userRoutes.put("/:id", photoUpload.single("image"), updateUserCtrl);
userRoutes.put("/bio/:id", updateUserBioCtrl);

// postImgResize

module.exports = userRoutes;
