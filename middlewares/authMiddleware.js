const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split("Bearer ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded?.id);
        req.user = user;
        next();
      }
    } catch (error) {
      throw new Error("Not Authorized: token expired, please login again");
    }
  } else {
    throw new Error("There is no token attached to header");
  }
});

const isAdminMiddleware = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  console.log(_id);
  const user = await User.findById(_id);
  if (!user || user.role !== "admin") {
    throw new Error("You are not an admin");
  } else {
    next();
  }
});

module.exports = { authMiddleware, isAdminMiddleware };
