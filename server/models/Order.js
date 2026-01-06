const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    cartId: {
      type: String,
    },

    cartItems: [
      {
        productId: String,
        title: String,
        image: String,

        size: {
          type: String,   // ✅ ADD THIS (FIX)
        },

        price: {
          type: Number,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
        },
      },
    ],

    addressInfo: {
      addressId: String,
      address: String,
      city: String,
      pincode: String,
      phone: String,
      notes: String,
    },

    orderStatus: {
      type: String,
      default: "pending",
    },

    paymentMethod: {
      type: String,
      default: "contact-admin",
    },

    paymentStatus: {
      type: String,
      default: "pending",
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    orderDate: {
      type: Date,
      default: Date.now,
    },

    orderUpdateDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema)
