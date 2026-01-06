const Chat = require("../../models/Chat");

/* =========================
   USER: SEND MESSAGE
========================= */
const sendUserMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message required" });
    }

    let chat = await Chat.findOne({ userId });

    if (!chat) {
      chat = await Chat.create({
        userId,
        messages: [],
      });
    }

    chat.messages.push({
      senderRole: "user",
      message,
    });

    await chat.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

/* =========================
   USER: GET MESSAGES
========================= */
const getUserMessages = async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId: req.user.id });

    res.json({
      success: true,
      messages: chat ? chat.messages : [],
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

/* =========================
   ADMIN: GET USER LIST
========================= */
const getAllChats = async (req, res) => {
  const chats = await Chat.find().populate("userId", "userName email");
  res.json({ success: true, chats });
};

/* =========================
   ADMIN: GET USER CHAT
========================= */
const getChatByUserId = async (req, res) => {
  const chat = await Chat.findOne({ userId: req.params.userId });
  res.json({ success: true, messages: chat?.messages || [] });
};

/* =========================
   ADMIN: SEND MESSAGE
========================= */
const sendAdminMessage = async (req, res) => {
  const { userId, message } = req.body;

  const chat = await Chat.findOne({ userId });
  if (!chat) return res.status(404).json({ success: false });

  chat.messages.push({
    senderRole: "admin",
    message,
  });

  await chat.save();
  res.json({ success: true });
};


/* =========================
   ADMIN: DELETE USER CHAT
========================= */
const deleteUserChat = async (req, res) => {
  try {
    const { userId } = req.params;

    await Chat.findOneAndDelete({ userId });

    res.json({
      success: true,
      message: "User chat deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user chat",
    });
  }
};


module.exports = {
  sendUserMessage,
  getUserMessages,
  getAllChats,
  getChatByUserId,
  sendAdminMessage,
  deleteUserChat, // ✅ ADD
};
