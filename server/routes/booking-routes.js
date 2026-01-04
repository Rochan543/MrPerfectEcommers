const express = require("express");
const multer = require("multer");
const {
  createBooking,
  getUserBookings,
  getAllBookings,
  updateBookingStatus,
  sendPaymentRequest,
} = require("../controllers/booking-controller");

// 🔒 IMPORT AUTH & ADMIN MIDDLEWARE (NO LOGIC CHANGE)
const {
  authMiddleware,
  adminMiddleware,
} = require("../controllers/auth/auth-controller");

const router = express.Router();

/* ==============================
   MULTER CONFIG
================================ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* ==============================
   USER ROUTES
================================ */

// ✅ Booking linked to logged-in user (UNCHANGED)
router.post("/create", authMiddleware, createBooking);

// ✅ Fetch logged-in user's bookings (UNCHANGED)
router.get("/user", authMiddleware, getUserBookings);

/* ==============================
   ADMIN ROUTES
   (SECURED – FUNCTIONALITY SAME)
================================ */

// ✅ Get all bookings (ADMIN ONLY)
router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  getAllBookings
);

// ✅ Update booking status (ADMIN ONLY)
router.put(
  "/admin/:id/status",
  authMiddleware,
  adminMiddleware,
  updateBookingStatus
);

// ✅ Upload payment QR + send email (ADMIN ONLY)
router.post(
  "/admin/:id/payment-qr",
  authMiddleware,
  adminMiddleware,
  upload.single("qr"),
  sendPaymentRequest
);

module.exports = router;
