const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");

// Register  user
const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;

  const user = await User.findOne({ email: email });

  if (!user) {
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    throw new Error("User Already Exists");
  }
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    // check if user exists or not
    const user = await User.findOne({ email: email });

    if (user && (await user.isPasswordMatched(password))) {
      const refreshToken = await generateRefreshToken(user._id);

      // Update refreshToken in the user document
      await User.findByIdAndUpdate(
        user._id,
        {
          refreshToken: refreshToken,
        },
        { new: true }
      );

      // Set the refreshToken as an HTTPOnly secure cookie with an expiry time
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true, // Enable this if your application is served over HTTPS
        maxAge: 72 * 60 * 60 * 1000, // 72 hours in milliseconds
      });

      // Respond with user details and access token
      res.json({
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        mobile: user.mobile,
        token: generateToken(user._id),
      });
    } else {
      // If user or password does not match, throw an error
      throw new Error("Invalid Credentials");
    }
  } catch (error) {
    // Handle errors gracefully and send an appropriate response to the client
    res.status(401).json({ error: error.message });
  }
});

// log out user
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken: refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); //forbidden
  }
  await User.findOneAndUpdate(
    { refreshToken: refreshToken },
    {
      refreshToken: "",
    }
  );
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); //forbidden
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
  console.log("user id is:", { _id });
  console.log(req?.body);

  validateMongoDbId(_id);

  const updates = {
    firstname: req?.body?.firstname,
    lastname: req?.body?.lastname,
    email: req?.body?.email,
    mobile: req?.body?.mobile,
    role: req?.body?.role,
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

// Handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken: refreshToken });
  if (!user) throw new Error("No Refresh token present in db or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateToken(user?.id);
    res.json({ accessToken });
  });
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
  handleRefreshToken,
  logout,
};
