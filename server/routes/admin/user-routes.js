const express = require("express");
const {
  getAllUsersForAdmin,
  getOrdersByUserIdForAdmin,
  deleteUserForAdmin,
} = require("../../controllers/admin/user-controller");

const { authMiddleware } = require("../../controllers/auth/auth-controller");

const router = express.Router();

/**
 * GET ALL USERS (ADMIN)
 */
router.get("/get", authMiddleware, getAllUsersForAdmin);

/**
 * GET ORDERS BY USER ID (ADMIN)
 */
router.get("/:userId/orders", authMiddleware, getOrdersByUserIdForAdmin);

/**
 * DELETE USER (ADMIN)
 */
router.delete("/:userId", authMiddleware, deleteUserForAdmin);

module.exports = router;

