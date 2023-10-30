const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productCtrl");

const {
  isAdminMiddleware,
  authMiddleware,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, isAdminMiddleware, createProduct);
router.get("/:id", getProduct);
router.delete("/:id", authMiddleware, isAdminMiddleware, deleteProduct);
router.put("/:id", authMiddleware, isAdminMiddleware, updateProduct);
router.get("/", getAllProducts);

module.exports = router;
