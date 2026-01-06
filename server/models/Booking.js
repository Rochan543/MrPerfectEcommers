const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      index: true,
    },

    userId: String,
    userName: String,
    email: String,
    phone: String,

    // ✅ Shipping snapshot (UNCHANGED)
    address: String,
    city: String,
    pincode: String,
    notes: String,

    productId: String,
    productName: String,
    productImage: String,
    size: String,

    // ✅ Status (extended, NOT changed)
    status: {
      type: String,
      enum: [
        "pending",
        "contacted",
        "confirmed",
        "cancelled",
        "deleted-by-user", // ✅ ADDITION
      ],
      default: "pending",
    },

    // ✅ Soft delete flag (ADD ONLY)
    isUserDeleted: {
      type: Boolean,
      default: false,
    },

    paymentQr: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// 🔥 AUTO-GENERATE BOOKING ID (UNCHANGED)
BookingSchema.pre("save", function (next) {
  if (!this.bookingId) {
    this.bookingId =
      "BK-" +
      Date.now().toString().slice(-6) +
      Math.floor(100 + Math.random() * 900);
  }
  next();
});

module.exports = mongoose.model("Booking", BookingSchema);
