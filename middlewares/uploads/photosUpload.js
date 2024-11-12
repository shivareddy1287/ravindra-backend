const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
//storage
const multerStorage = multer.memoryStorage();

//file type checking
const multerFilter = (req, file, cb) => {
  //check file type
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    //rejected files
    cb(
      {
        message: "Unsupported file format",
      },
      false
    );
  }
};

const photoUpload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

//Image Resizing
const profilePhotoResize = async (req, res, next) => {
  //check if there is no file
  if (!req.file) return next();
  req.file.filename = `user-${Date.now()}-${req.file.originalname}`;

  await sharp(req.file.buffer)
    .resize(250, 250)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(path.join(`public/images/photos/${req.file.filename}`));
  next();
};

//Post Image Resizing
const postImgResize = async (req, res, next) => {
  console.log("started");

  if (!req.files || req.files.length === 0) return next(); // If no files, move to next middleware

  await Promise.all(
    req.files.map(async (file) => {
      file.filename = `user-${Date.now()}-${file.originalname}`;

      await sharp(file.buffer)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(path.join(`public/images/photos/${file.filename}`));
    })
  );
  next();
};

module.exports = { photoUpload, profilePhotoResize, postImgResize };
