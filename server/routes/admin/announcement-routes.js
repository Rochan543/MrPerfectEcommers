const express = require("express");
const {
  addAnnouncement,
  getActiveAnnouncement,
} = require("../../controllers/admin/announcement-controller");

const router = express.Router();

router.post("/add", addAnnouncement);
router.get("/active", getActiveAnnouncement);

module.exports = router;

router.get("/all", async (req, res) => {
  try {
    const announcements = await require("../../models/Announcement").find().sort({ createdAt: -1 });
    res.json({ success: true, data: announcements });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await require("../../models/Announcement").findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

