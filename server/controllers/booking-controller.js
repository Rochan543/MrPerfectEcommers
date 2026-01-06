const Booking = require("../models/Booking");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Address = require("../models/Address"); // ✅ ADDED
const { sendPaymentEmail } = require("../utils/email");

/* ===============================
   CREATE BOOKING (USER)
=============================== */
const createBooking = async (req, res) => {
  try {
    // 🔒 Logged-in user from authMiddleware
    const user = req.user;
        /* ===============================
       FETCH USER ADDRESS (SOURCE OF TRUTH)
    =============================== */
    const userAddress = await Address.findOne({ userId: user.id }).sort({
      createdAt: -1,
    });

    /* ===============================
       CREATE BOOKING (UNCHANGED)
    =============================== */
    const booking = new Booking({
      userId: user.id,
      userName: user.userName,
      email: user.email,

      // phone: req.body.phone,
      phone: userAddress?.phone || user.phone || "",


      // ✅ ADDRESS SNAPSHOT (ALREADY ADDED BY YOU)
      address: req.body.address,
      city: req.body.city,
      pincode: req.body.pincode,
      notes: req.body.notes,

      productId: req.body.productId,
      productName: req.body.productName,
      productImage: req.body.productImage,
      size: req.body.size,
    });

    await booking.save();

    /* ===============================
       FETCH PRODUCT PRICE (UNCHANGED)
    =============================== */
    const product = await Product.findById(booking.productId);

    const price = product
      ? Number(product.salePrice > 0 ? product.salePrice : product.price)
      : 0;

    const quantity = 1;
    const totalAmount = price * quantity;

    /* ===============================
       CREATE ORDER FROM BOOKING
       (LOGIC UNCHANGED – ONLY DATA FILLED)
    =============================== */
    await Order.create({
      userId: user.id,

      cartItems: [
        {
          productId: booking.productId,
          title: booking.productName,
          image: booking.productImage,

          size: booking.size, // ✅ EXISTING

          price,
          quantity,
        },
      ],

      addressInfo: {
        addressId: userAddress?._id || null,
        address: userAddress?.address || "",
        city: userAddress?.city || "",
        pincode: userAddress?.pincode || "",
        phone: userAddress?.phone || "",
        notes: userAddress?.notes || "Created from booking",
      },

      orderStatus: "pending",
      paymentMethod: "offline",
      paymentStatus: "pending",
      totalAmount,

      orderDate: new Date(),
      orderUpdateDate: new Date(),

      paymentId: null,
      payerId: null,
      cartId: null,
    });

    /* ===============================
       RESPONSE (UNCHANGED)
    =============================== */
    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
    });
  }
};

/* ===============================
   GET USER BOOKINGS
=============================== */
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ userId }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (err) {
    console.error("USER BOOKINGS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};


/* ===============================
   USER: DELETE BOOKING
=============================== */
const deleteBookingByUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      _id: id,
      userId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.isUserDeleted = true;
    booking.status = "deleted-by-user";

    await booking.save();

    res.json({
      success: true,
      message: "Booking deleted by user",
    });
  } catch (error) {
    console.error("USER DELETE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete booking",
    });
  }
};


/* ===============================
   ADMIN: GET ALL BOOKINGS
=============================== */
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("ADMIN GET BOOKINGS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

/* ===============================
   ADMIN: UPDATE BOOKING STATUS
=============================== */
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update booking status",
    });
  }
};

/* ===============================
   ADMIN: SEND PAYMENT REQUEST
=============================== */
const sendPaymentRequest = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.paymentQr = req.file.path;
    booking.status = "contacted";
    await booking.save();

    // 📧 Send email to user
    await sendPaymentEmail(booking);

    res.json({
      success: true,
      message: "Payment request sent successfully",
    });
  } catch (error) {
    console.error("PAYMENT REQUEST ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send payment request",
    });
  }
};


/* ===============================
   ADMIN: DELETE BOOKING
=============================== */
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    await Booking.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("DELETE BOOKING ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete booking",
    });
  }
};


/* ===============================
   EXPORTS (UNCHANGED)
=============================== */
module.exports = {
  createBooking,
  getUserBookings,
  getAllBookings,
  updateBookingStatus,
  sendPaymentRequest,
  deleteBooking,
  deleteBookingByUser, // ✅ ADDED
};
