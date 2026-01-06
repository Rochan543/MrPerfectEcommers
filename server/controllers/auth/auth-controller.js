const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

// =====================
// REGISTER
// =====================
const registerUser = async (req, res) => {
  try {
    const { userName, email, password, phone } = req.body;

    // 1. Validate input
    if (!userName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2. Check email uniqueness
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // 3. Check username uniqueness
    const existingUserName = await User.findOne({ userName });
    if (existingUserName) {
      return res.status(409).json({
        success: false,
        message: "Username already taken",
      });
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Create user
    await User.create({
      userName,
      email,
      phone: phone || undefined, // ✅ safe & optional
      password: hashedPassword,
    });

    // 6. Success response
    res.status(201).json({
      success: true,
      message: "Registration successful",
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    // 7. Handle MongoDB duplicate key safety net
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =====================
// LOGIN
// =====================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

        // 2. Find user
        const user = await User.findOne({
      $or: [
        { email: email },
        { phone: email }, // ✅ phone login support
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 4. Create JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        userName: user.userName,
        phone: user.phone, // ✅ ADD THIS
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 5. Set cookie (🔥 FIXED FOR PRODUCTION)
    res
      .cookie("token", token, {
        httpOnly: true,

        // 🔥 REQUIRED for Netlify → Render
        secure: true,
        sameSite: "none",

        // 🔥 VERY IMPORTANT (booking & admin APIs)
        path: "/",

        maxAge: 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          userName: user.userName,
        },
      });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =====================
// LOGOUT
// =====================
const logoutUser = (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,

      // 🔥 MUST MATCH LOGIN COOKIE OPTIONS
      secure: true,
      sameSite: "none",
      path: "/",
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });
};

// =====================
// AUTH MIDDLEWARE
// =====================
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

// =====================
// ADMIN MIDDLEWARE
// =====================
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access only",
    });
  }
  next();
};

// =====================
// EXPORTS
// =====================
module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  adminMiddleware,
};
