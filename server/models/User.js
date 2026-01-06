const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  // ✅ ADDED: Phone number (optional, non-breaking)
  phone: {
    type: String,
    unique: true,
    sparse: true, // allows multiple users without phone
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    default: "user",
  },

  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
