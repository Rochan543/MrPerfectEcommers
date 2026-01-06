import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "@/config/apiConfig";

/* =========================
   CREATE BOOKING
========================= */
export const createBooking = createAsyncThunk(
  "booking/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/bookings/create`,
        data,
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Create booking failed"
      );
    }
  }
);

/* =========================
   FETCH USER BOOKINGS
========================= */
export const fetchUserBookings = createAsyncThunk(
  "booking/user",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API_URL}/api/bookings/user`,
        { withCredentials: true }
      );
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Fetch bookings failed"
      );
    }
  }
);

/* =========================
   USER DELETE BOOKING (SOFT DELETE)
========================= */
export const deleteUserBooking = createAsyncThunk(
  "booking/deleteUser",
  async (bookingId, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${API_URL}/api/bookings/user/${bookingId}`,
        { withCredentials: true }
      );
      return bookingId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Delete booking failed"
      );
    }
  }
);

/* =========================
   SLICE
========================= */
const bookingSlice = createSlice({
  name: "shopBookings",
  initialState: {
    bookings: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* CREATE BOOKING */
      .addCase(createBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      /* FETCH USER BOOKINGS */
      .addCase(fetchUserBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.bookings = [];
        state.error = action.payload;
      })

      /* USER DELETE BOOKING */
      .addCase(deleteUserBooking.fulfilled, (state, action) => {
        state.bookings = state.bookings.filter(
          (b) => b._id !== action.payload
        );
      });
  },
});

export default bookingSlice.reducer;
