import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllBookings,
  updateBookingStatus,
  sendPaymentQr,
  deleteBooking,
} from "@/store/admin/booking-slice";

/* =========================
   UTILS (ADDED – SAFE)
========================= */
function isToday(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  return new Date(dateStr).toLocaleString();
}

function exportCSV(bookings) {
  const headers = [
    "Booking ID",
    "User Name",
    "Email",
    "Phone",
    "Product",
    "Size",
    "Status",
    "Created At",
  ];

  const rows = bookings.map((b) => [
    b._id,
    b.userName,
    b.email,
    b.phone || "",
    b.productName,
    b.size,
    b.status,
    new Date(b.createdAt).toLocaleString(),
  ]);

  const csv =
    [headers, ...rows].map((r) => r.join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "bookings.csv";
  a.click();

  URL.revokeObjectURL(url);
}

function AdminBookings() {
  const dispatch = useDispatch();
  const { bookings } = useSelector((s) => s.adminBookings);

  const [selectedQr, setSelectedQr] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchAllBookings());
  }, [dispatch]);

  /* =========================
     SORT + SEARCH (ADDED)
  ========================= */
  const filteredBookings = useMemo(() => {
    return [...bookings]
      .filter((b) =>
        `${b.userName} ${b.email} ${b.productName} ${b.phone} ${b._id}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
      );
  }, [bookings, search]);

  function handleQrUpload(bookingId) {
    const qrFile = selectedQr[bookingId];
    if (!qrFile) {
      alert("Please select a QR image first");
      return;
    }

    const formData = new FormData();
    formData.append("qr", qrFile);
    dispatch(sendPaymentQr({ id: bookingId, data: formData }));
  }

  function handleDelete(bookingId) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this booking?"
    );
    if (!confirmDelete) return;
    dispatch(deleteBooking(bookingId));
  }

  return (
    <div className="p-4 sm:p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Bookings
        </h1>

        <button
          onClick={() => exportCSV(filteredBookings)}
          className="px-4 py-2 bg-black text-white rounded text-sm"
        >
          Export CSV
        </button>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search by name, email, product, phone, booking id"
        className="w-full mb-5 px-3 py-2 border rounded text-sm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredBookings.length === 0 && (
        <p className="text-gray-500">No bookings found.</p>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBookings.map((b) => (
          <div
            key={b._id}
            className={`border rounded-xl p-4 sm:p-5 shadow-sm bg-white flex flex-col justify-between ${
              isToday(b.createdAt)
                ? "border-blue-500 bg-blue-50"
                : ""
            }`}
          >
            {/* USER INFO */}
            <div className="mb-3">
              <p className="font-semibold text-lg">
                {b.userName}
              </p>
              <p className="text-sm text-gray-500 break-all">
                {b.email}
              </p>
              <p className="text-sm text-gray-600">
                <b>Phone:</b> {b.phone || "N/A"}
              </p>

              {/* TODAY + RELATIVE TIME */}
              <p className="text-xs text-gray-500 mt-1">
                {isToday(b.createdAt) && (
                  <span className="text-blue-600 font-semibold mr-1">
                    TODAY •
                  </span>
                )}
                {timeAgo(b.createdAt)}
              </p>

              {b.isUserDeleted && (
                <p className="text-xs text-red-600 mt-1 font-semibold">
                  ⚠ User deleted this booking
                </p>
              )}
            </div>

            {/* PRODUCT INFO */}
            <div className="text-sm mb-3 space-y-1">
              <p>
                <b>Product:</b> {b.productName}
              </p>
              <p>
                <b>Size:</b> {b.size}
              </p>
              <p className="break-all">
                <b>Booking ID:</b> {b._id}
              </p>
            </div>

            {/* STATUS */}
            <p className="mb-3">
              <b>Status:</b>{" "}
              <span
                className={`capitalize inline-block px-2 py-1 rounded text-xs ${
                  b.status === "confirmed"
                    ? "bg-green-100 text-green-700"
                    : b.status === "contacted"
                    ? "bg-yellow-100 text-yellow-700"
                    : b.status === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {b.status || "pending"}
              </span>

              {b.status === "deleted-by-user" && (
                <span className="ml-2 bg-red-200 text-red-800 px-2 py-1 rounded text-xs">
                  Deleted by user
                </span>
              )}
            </p>

            {/* ACTIONS */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                className="flex-1 px-3 py-1 rounded bg-yellow-500 text-white text-xs"
                onClick={() =>
                  dispatch(
                    updateBookingStatus({
                      id: b._id,
                      status: "contacted",
                    })
                  )
                }
              >
                Contacted
              </button>

              <button
                className="flex-1 px-3 py-1 rounded bg-green-600 text-white text-xs"
                onClick={() =>
                  dispatch(
                    updateBookingStatus({
                      id: b._id,
                      status: "confirmed",
                    })
                  )
                }
              >
                Confirm
              </button>

              <button
                className="flex-1 px-3 py-1 rounded bg-red-600 text-white text-xs"
                onClick={() =>
                  dispatch(
                    updateBookingStatus({
                      id: b._id,
                      status: "cancelled",
                    })
                  )
                }
              >
                Cancel
              </button>
            </div>

            {/* PAYMENT QR */}
            <div className="border-t pt-3">
              {b.paymentQr ? (
                <p className="text-green-600 text-sm font-medium">
                  ✅ Payment QR already sent
                </p>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="text-xs w-full"
                    onChange={(e) =>
                      setSelectedQr({
                        ...selectedQr,
                        [b._id]: e.target.files[0],
                      })
                    }
                  />
                  <button
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded"
                    onClick={() => handleQrUpload(b._id)}
                  >
                    Upload QR
                  </button>
                </div>
              )}
            </div>

            {/* DELETE */}
            <button
              onClick={() => handleDelete(b._id)}
              className="mt-4 w-full px-3 py-1 rounded bg-gray-800 text-white text-xs hover:bg-black"
            >
              Delete Booking
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminBookings;
