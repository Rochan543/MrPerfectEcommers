import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "@/config/apiConfig";

/* =====================
   USER
===================== */
export const fetchUserMessages = createAsyncThunk(
  "chat/user/messages",
  async () => {
    const res = await axios.get(`${API_URL}/api/chat/user/messages`, {
      withCredentials: true,
    });
    return res.data.messages;
  }
);

export const sendUserMessage = createAsyncThunk(
  "chat/user/send",
  async (message) => {
    await axios.post(
      `${API_URL}/api/chat/user/send`,
      { message },
      { withCredentials: true }
    );
  }
);

/* =====================
   ADMIN
===================== */
export const fetchChats = createAsyncThunk(
  "chat/admin/chats",
  async () => {
    const res = await axios.get(`${API_URL}/api/chat/admin/chats`, {
      withCredentials: true,
    });
    return res.data.chats;
  }
);

export const fetchChatByUser = createAsyncThunk(
  "chat/admin/chat",
  async (userId) => {
    const res = await axios.get(
      `${API_URL}/api/chat/admin/chat/${userId}`,
      { withCredentials: true }
    );
    return res.data.messages;
  }
);

export const sendAdminMessage = createAsyncThunk(
  "chat/admin/send",
  async ({ userId, message }) => {
    await axios.post(
      `${API_URL}/api/chat/admin/send`,
      { userId, message },
      { withCredentials: true }
    );
  }
);

/* =====================
   ADMIN: DELETE USER CHAT (OPTION A)
===================== */
export const deleteUserChat = createAsyncThunk(
  "chat/admin/delete",
  async (userId) => {
    await axios.delete(
      `${API_URL}/api/chat/admin/chat/${userId}`,
      { withCredentials: true }
    );
    return userId;
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    chats: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
      })
      .addCase(fetchChatByUser.fulfilled, (state, action) => {
        state.messages = action.payload;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.chats = action.payload;
      });
    // ❗ NO reducer added for deleteUserChat (by design)
  },
});

export default chatSlice.reducer;
