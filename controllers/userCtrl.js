const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");

// Register  user
const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;

  const findUser = await User.findOne({ email: email });

  if (!findUser) {
    const newUser = User.create(req.body);
    res.json(newUser);
  } else {
    throw new Error("User Already Exists");
  }
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exist or not
  const findUser = await User.findOne({ email });

  if (findUser && (await findUser.isPasswordMatched(password))) {
    res.json({
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

// Get all users
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    throw new Error(error);
  }
});

// Get user
const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongoDbId(id);

  try {
    const user = await User.findById(id);
    res.json(user);
  } catch (error) {
    throw new Error(error);
  }
});

// Delete user
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongoDbId(id);

  try {
    await User.findByIdAndDelete(id);
    res.json({
      message: "user deleted successfully",
      success: true,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Update user
const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  validateMongoDbId(_id);

  const updates = {
    firstname: req?.body?.firstname,
    lastname: req?.body?.lastname,
    email: req?.body?.email,
    mobile: req?.body?.mobile,
  };

  try {
    const user = await User.findByIdAndUpdate(_id, updates, { new: true });
    res.json(user);
  } catch (error) {
    throw new Error(error);
  }
});

const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongoDbId(id);

  try {
    await User.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
    res.json({
      message: "User Blocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});

const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongoDbId(id);

  try {
    await User.findByIdAndUpdate(id, { isBlocked: false }, { new: true });
    res.json({
      message: "User UnBlocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createUser,
  loginUser,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
};
