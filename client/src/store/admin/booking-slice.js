import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "@/config/apiConfig";

/* =========================
   FETCH ALL BOOKINGS
========================= */
export const fetchAllBookings = createAsyncThunk(
  "adminBookings/fetchAll",
  async () => {
    const res = await axios.get(
      `${API_URL}/api/bookings/admin/all`,
      {
        withCredentials: true, // 🔥 ADDED (required for admin auth)
      }
    );
    return res.data.data;
  }
);

/* =========================
   UPDATE BOOKING STATUS
========================= */
export const updateBookingStatus = createAsyncThunk(
  "adminBookings/updateStatus",
  async ({ id, status }) => {
    await axios.put(
      `${API_URL}/api/bookings/admin/${id}/status`,
      { status },
      {
        withCredentials: true, // 🔥 ADDED
      }
    );
    return { id, status };
  }
);

/* =========================
   SEND PAYMENT QR (UPLOAD)
========================= */
export const sendPaymentQr = createAsyncThunk(
  "adminBookings/sendPaymentQr",
  async ({ id, data }) => {
    const res = await axios.post(
      `${API_URL}/api/bookings/admin/${id}/payment-qr`,
      data,
      {
        withCredentials: true, // 🔥 ADDED
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return { id, paymentQr: res.data?.paymentQr };
  }
);

/* =========================
   DELETE BOOKING (ADMIN)
========================= */
export const deleteBooking = createAsyncThunk(
  "adminBookings/deleteBooking",
  async (id) => {
    await axios.delete(
      `${API_URL}/api/bookings/admin/${id}`,
      {
        withCredentials: true, // 🔥 REQUIRED
      }
    );
    return id;
  }
);

/* =========================
   SLICE
========================= */
const adminBookingSlice = createSlice({
  name: "adminBookings",
  initialState: {
    bookings: [],
    isLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* FETCH */
      .addCase(fetchAllBookings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload;
      })

      /* STATUS UPDATE */
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const booking = state.bookings.find(
          (b) => b._id === action.payload.id
        );
        if (booking) booking.status = action.payload.status;
      })

      /* QR UPLOAD */
      .addCase(sendPaymentQr.fulfilled, (state, action) => {
        const booking = state.bookings.find(
          (b) => b._id === action.payload.id
        );
        if (booking) {
          booking.paymentQr =
            action.payload.paymentQr || booking.paymentQr;
          booking.status = "contacted";
        }
      })

      /* DELETE */
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.bookings = state.bookings.filter(
          (b) => b._id !== action.payload
        );
      });
  },
});

export default adminBookingSlice.reducer;
