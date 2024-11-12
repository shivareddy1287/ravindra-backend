const expressAsyncHandler = require("express-async-handler");
const fs = require("fs");

const User = require("../../model/user/User");
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
};
