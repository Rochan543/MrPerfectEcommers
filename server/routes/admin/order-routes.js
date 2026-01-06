const express = require("express");
const {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
  deleteOrder,
} = require("../../controllers/admin/order-controller");

const {
  authMiddleware,
  adminMiddleware, // ✅ ADD THIS
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

/* =========================
   ADMIN ORDER ROUTES
========================= */

router.get("/get", authMiddleware, adminMiddleware, getAllOrdersForAdmin);
router.get("/details/:id", authMiddleware, adminMiddleware, getOrderDetailsForAdmin);
router.put("/update/:id", authMiddleware, adminMiddleware, updateOrderStatus);
router.delete("/delete/:id", authMiddleware, adminMiddleware, deleteOrder);

module.exports = router;

