const express = require("express");

const {
  addFeatureImage,
  getFeatureImages,
  deleteFeatureImage, // ✅ ADD THIS
} = require("../../controllers/common/feature-controller");

const router = express.Router();

router.post("/add", addFeatureImage);
router.get("/get", getFeatureImages);

// ✅ ADD THIS LINE (THIS WAS MISSING)
router.delete("/delete/:id", deleteFeatureImage);

module.exports = router;
