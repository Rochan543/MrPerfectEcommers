require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

/* ======================
   ROUTE IMPORTS
====================== */
const authRouter = require("./routes/auth/auth-routes");

const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");
const adminUserRouter = require("./routes/admin/user-routes");
const adminAnnouncementRouter = require("./routes/admin/announcement-routes");
const adminSubscriberRouter = require("./routes/admin/subscriber-routes");
const adminReviewRouter = require("./routes/admin/review-routes");

const shopFavoritesRouter = require("./routes/shop/favorites-routes");
const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");

const commonFeatureRouter = require("./routes/common/feature-routes");
const bookingRoutes = require("./routes/booking-routes");
const chatRouter = require("./routes/chat/chat-routes");


/* ======================
   APP INIT
====================== */
const app = express();
const PORT = process.env.PORT || 5000;

/* ======================
   DATABASE CONNECTION
====================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

/* ======================
   🔥 FINAL CORS CONFIG
====================== */
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Postman / Render health checks
      if (!origin) return callback(null, true);

      // ✅ Allow Netlify + localhost
      if (
        origin.endsWith(".netlify.app") ||
        origin.includes("localhost")
      ) {
        return callback(null, true);
      }

      console.error("❌ CORS BLOCKED:", origin);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ✅ Preflight support (VERY IMPORTANT)
app.options("*", cors());

/* ======================
   MIDDLEWARES
====================== */
app.use(express.json());
app.use(cookieParser());

/* ======================
   ROUTES
====================== */

// AUTH
app.use("/api/auth", authRouter);

// ADMIN
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/admin/users", adminUserRouter);
app.use("/api/admin/announcement", adminAnnouncementRouter);
app.use("/api/admin/subscribers", adminSubscriberRouter);
app.use("/api/admin/reviews", adminReviewRouter);

// SHOP
app.use("/api/shop/favorites", shopFavoritesRouter);
app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);

// CHAT (USER + ADMIN)
app.use("/api/chat", chatRouter);

// COMMON
app.use("/api/common/feature", commonFeatureRouter);

// BOOKINGS
app.use("/api/bookings", bookingRoutes);

// STATIC FILES
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ======================
   HEALTH CHECK
====================== */
app.get("/", (req, res) => {
  res.send("API is running successfully 🚀");
});

/* ======================
   SERVER START
====================== */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
