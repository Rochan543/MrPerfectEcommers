const express = require("express");
const {
  getAllReviews,
  updateReviewStatus,
  replyToReview,
  deleteReview, // ✅ ADD
} = require("../../controllers/admin/review-controller");

const router = express.Router();

router.get("/", getAllReviews);
router.put("/:id/status", updateReviewStatus);
router.put("/:id/reply", replyToReview);

module.exports = router;

