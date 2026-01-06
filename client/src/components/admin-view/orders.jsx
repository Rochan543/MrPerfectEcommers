import { useEffect, useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import AdminOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
  deleteOrderForAdmin,
} from "@/store/admin/order-slice";
import { Badge } from "../ui/badge";

/* ================= RELATIVE TIME ================= */
function getRelativeTime(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffHours < 48) return "Yesterday";
  return "";
}

function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 8;

  const { orderList, orderDetails } = useSelector(
    (state) => state.adminOrder
  );
  const dispatch = useDispatch();

  function handleFetchOrderDetails(id) {
    dispatch(getOrderDetailsForAdmin(id));
  }

  function handleDeleteOrder(id) {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    dispatch(deleteOrderForAdmin(id)).then(() => {
      dispatch(getAllOrdersForAdmin());
    });
  }

  /* ================= AUTO REFRESH ================= */
  useEffect(() => {
    dispatch(getAllOrdersForAdmin());
    const interval = setInterval(() => {
      dispatch(getAllOrdersForAdmin());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (orderDetails) setOpenDetailsDialog(true);
  }, [orderDetails]);

  function getOrderPrice(order) {
    if (order?.totalAmount > 0) return order.totalAmount;
    if (Array.isArray(order?.cartItems)) {
      return order.cartItems.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
      );
    }
    return 0;
  }

  /* ================= FILTER + SORT ================= */
  const filteredOrders = useMemo(() => {
    if (!orderList) return [];

    return [...orderList]
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
      .filter((order) => {
        const matchesSearch =
          order._id.toLowerCase().includes(search.toLowerCase()) ||
          order.orderStatus?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
          statusFilter === "all" ||
          order.orderStatus === statusFilter;

        return matchesSearch && matchesStatus;
      });
  }, [orderList, search, statusFilter]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(
    filteredOrders.length / ITEMS_PER_PAGE
  );

  const paginatedOrders = filteredOrders.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const today = new Date().toDateString();

  /* ================= CSV EXPORT ================= */
  function exportCSV() {
    const headers = ["Order ID", "Date", "Status", "Price"];
    const rows = filteredOrders.map((o) => [
      o._id,
      o.orderDate?.split("T")[0],
      o.orderStatus,
      getOrderPrice(o),
    ]);

    const csv =
      [headers, ...rows].map((r) => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col gap-3">
        <CardTitle>All Orders</CardTitle>

        {/* SEARCH + FILTER + CSV */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search Order ID / Status"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border rounded px-3 py-1 text-sm w-full md:w-1/4"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
          </select>

          <Button size="sm" onClick={exportCSV}>
            Export CSV
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow
                  key={order._id}
                  className={
                    new Date(order.orderDate).toDateString() === today
                      ? "bg-blue-50"
                      : ""
                  }
                >
                  <TableCell>{order._id}</TableCell>

                  <TableCell>
                    {order.orderDate?.split("T")[0]}
                    <div className="text-xs text-gray-500">
                      {getRelativeTime(order.orderDate)}
                    </div>
                  </TableCell>

                  {/* ✅ ONLY VISUAL CHANGE HERE */}
                  <TableCell>
                    <Badge
                      className={`capitalize px-3 py-1 text-xs ${
                        order.orderStatus === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.orderStatus === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : order.orderStatus === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.orderStatus}
                    </Badge>
                  </TableCell>

                  <TableCell className="font-semibold">
                    ₹{getOrderPrice(order).toLocaleString("en-IN")}
                  </TableCell>

                  <TableCell className="flex gap-2">
                    <Dialog
                      open={openDetailsDialog}
                      onOpenChange={() => {
                        setOpenDetailsDialog(false);
                        dispatch(resetOrderDetails());
                      }}
                    >
                      <Button
                        size="sm"
                        onClick={() =>
                          handleFetchOrderDetails(order._id)
                        }
                      >
                        View
                      </Button>

                      <AdminOrderDetailsView
                        orderDetails={orderDetails}
                      />
                    </Dialog>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        handleDeleteOrder(order._id)
                      }
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </Button>

          <span className="text-sm px-2 py-1">
            Page {page} of {totalPages}
          </span>

          <Button
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default AdminOrdersView;
