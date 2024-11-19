const expressAsyncHandler = require("express-async-handler");
const fs = require("fs");

const User = require("../../model/user/User");

const nodemailer = require("nodemailer");

const generateToken = require("../../config/token/generateToken");

//-------------------------------------
//Register
//-------------------------------------

const userRegisterCtrl = expressAsyncHandler(async (req, res) => {
  //Check if user Exist
  const userExists = await User.findOne({ email: req?.body?.email });

  if (userExists) throw new Error("User already exists");
  try {
    //Register user
    const user = await User.create({
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      password: req?.body?.password,
    });
    res.json(user);
  } catch (error) {
    res.json(error);
  }
});

//-------------------------------
//Login user
//-------------------------------

const loginUserCtrl = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  //check if user exists
  const userFound = await User.findOne({ email });
  //Check if password is match
  if (userFound && (await userFound.isPasswordMatched(password))) {
    res.json({
      _id: userFound?._id,
      firstName: userFound?.firstName,
      lastName: userFound?.lastName,
      email: userFound?.email,
      profilePhoto: userFound?.profilePhoto,
      isAdmin: userFound?.isAdmin,
      token: generateToken(userFound?._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Login Credentials");
  }
});
//
//
//
//
//
//
// //
// const sendOtpCtrl = expressAsyncHandler(async (req, res) => {
//   const { email } = req.body;
//   console.log(email);

//   //check if user exists
//   const userFound = await User.findOne({ email });
//   //Check if password is match
//   if (userFound) {
//     res.json({
//       _id: userFound?._id,
//       firstName: userFound?.firstName,
//       lastName: userFound?.lastName,
//       email: userFound?.email,
//       profilePhoto: userFound?.profilePhoto,
//       isAdmin: userFound?.isAdmin,
//     });
//   } else {
//     res.status(401);
//     throw new Error("User not found");
//   }
// });

// const resetPasswordCtrl = expressAsyncHandler(async (req, res) => {
//   console.log(req.body);
//   console.log(req.user);

//   try {
//     console.log("tr");

//     const user = await User.findByIdAndUpdate(
//       req.body.userId,
//       {
//         password: req.body.password,
//       },
//       {
//         new: true,
//         runValidators: true,
//       }
//     );
//     console.log(user);

//     res.json(user);
//   } catch (error) {
//     console.log(error);

//     res.json(error);
//   }
// });

const resetPasswordCtrl = expressAsyncHandler(async (req, res) => {
  try {
    // Find the user by ID
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the password and save
    user.password = req.body.password; // This triggers the pre-save hook
    await user.save();

    res.json({ message: "Password reset successful", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Password reset failed", error });
  }
});

const sendOtpCtrl = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  console.log(email);

  // Check if user exists
  const userFound = await User.findOne({ email });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "shivareddy1287@gmail.com", // Your Gmail address
      pass: "etqszuqrveogggef", // App password, not your Gmail password
    },
  });

  let otp;

  const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000); // Generates a number between 1000 and 9999
  };
  otp = generateOTP();

  if (userFound) {
    // User exists, send user details (or proceed with OTP logic)

    const info = await transporter.sendMail({
      from: '"Kollu Ravindra 👻" <shivareddy1287@gmail.com>', // sender address
      to: email, // list of receivers
      subject: "Otp for reset password", // Subject line
      text: `${otp}`, // plain text body
      // html: "<b>Hello world?</b>", // html body
    });

    console.log("Message sent: %s", info.messageId);

    res.json({
      _id: userFound?._id,
      otp: otp,
    });
  } else {
    // User not found, send 404 status and error message
    res.status(404).json({ message: "User not found" });
  }
});

//
//
//

//
//
//
//
//
//

//----------------
//user details
//----------------
const fetchUserDetailsCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  //check if user id is valid
  // validateMongodbId(id);
  // console.log(id);

  try {
    const user = await User.findById(id);
    res.json(user);
  } catch (error) {
    res.json(error);
  }
});

//------------------------------
//All Users
//-------------------------------
const fetchUsersCtrl = expressAsyncHandler(async (req, res) => {
  // console.log(req.headers);

  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.json(error);
  }
});

//------------------------------
//Update profile
//------------------------------
const updateUserCtrl = expressAsyncHandler(async (req, res) => {
  console.log("update");

  const { id } = req.params;

  console.log(id);
  console.log(req.body);

  console.log(req.file);

  const user = await User.findByIdAndUpdate(
    id,
    {
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      profilePhoto: req.file
        ? req.file.buffer.toString("base64")
        : req?.body?.profilePhoto,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.json(user);
});

const updateUserBioCtrl = expressAsyncHandler(async (req, res) => {
  console.log("update Bio");

  const { id } = req.params;

  console.log(id);
  console.log(req.body);

  const user = await User.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json(user);
});

module.exports = {
  userRegisterCtrl,
  loginUserCtrl,
  updateUserCtrl,
  fetchUserDetailsCtrl,
  fetchUsersCtrl,
  updateUserBioCtrl,
  sendOtpCtrl,
  resetPasswordCtrl,
};
