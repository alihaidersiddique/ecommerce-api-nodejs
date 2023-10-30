const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/userCtrl");

const {
  authMiddleware,
  isAdminMiddleware,
} = require("../middlewares/authMiddleware");

router.post("/register", createUser);
router.post("/login", loginUser);

router.get("/all-users", getAllUsers);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);

router.get("/:id", authMiddleware, isAdminMiddleware, getUser);
router.delete("/:id", deleteUser);

router.put("/:id", authMiddleware, updateUser);
router.put("/block-user/:id", authMiddleware, isAdminMiddleware, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdminMiddleware, unblockUser);

module.exports = router;
