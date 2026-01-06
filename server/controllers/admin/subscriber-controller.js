const ProductReview = require("../../models/Review");

// ✅ Get all reviews (Admin)
const getAllReviews = async (req, res) => {
  try {
    const reviews = await ProductReview.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

// ✅ Approve / Reject review
const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const review = await ProductReview.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.status = status;
    await review.save();

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update review status",
    });
  }
};

// ✅ Admin reply to review
const replyToReview = async (req, res) => {
  try {
    const { reply } = req.body;

    const review = await ProductReview.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.adminReply = reply;
    await review.save();

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to add admin reply",
    });
  }
};

// ✅ Admin delete review
const deleteReview = async (req, res) => {
  try {
    const review = await ProductReview.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    await ProductReview.findByIdAndDelete(req.params.id);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};

module.exports = {
  getAllReviews,
  updateReviewStatus,
  replyToReview,
  deleteReview, // ✅ ADD
};
