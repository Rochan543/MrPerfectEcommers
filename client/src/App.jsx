import { Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

/* AUTH */
import AuthLayout from "./components/auth/layout";
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";

/* ADMIN */
import AdminLayout from "./components/admin-view/layout";
import AdminDashboard from "./pages/admin-view/dashboard";
import AdminProducts from "./pages/admin-view/products";
import AdminOrders from "./pages/admin-view/orders";
import AdminFeatures from "./pages/admin-view/features";
import AdminUsers from "./pages/admin-view/users";
import AdminUserOrders from "./pages/admin-view/user-orders";
import AdminAnnouncements from "./pages/admin-view/announcements";
import AdminSubscribers from "./pages/admin-view/subscribers";
import AdminReviews from "./pages/admin-view/reviews";
import AdminBookings from "./pages/admin-view/bookings";

/* 🆕 ADMIN CHAT */
import AdminChat from "./pages/admin/AdminChat";

/* SHOP */
import ShoppingLayout from "./components/shopping-view/layout";
import ShoppingHome from "./pages/shopping-view/home";
import ShoppingListing from "./pages/shopping-view/listing";
import ShoppingCheckout from "./pages/shopping-view/checkout";
import ShoppingAccount from "./pages/shopping-view/account";
import PaypalReturnPage from "./pages/shopping-view/paypal-return";
import PaymentSuccessPage from "./pages/shopping-view/payment-success";
import SearchProducts from "./pages/shopping-view/search";
import Favorites from "./pages/shopping-view/favorites";
import ProductDetailsPage from "./pages/shopping-view/product-details-page";
import MyBookings from "./pages/shopping-view/my-bookings";

/* 🆕 USER CHAT */
import UserChat from "./pages/user/UserChat";

/* PUBLIC */
import PublicLayout from "./components/public-view/layout";
import PublicHome from "./pages/public-view/home";

/* STATIC */
import AboutUs from "./pages/static/AboutUs";
import PrivacyPolicy from "./pages/static/PrivacyPolicy";
import TermsConditions from "./pages/static/TermsConditions";
import RefundPolicy from "./pages/static/RefundPolicy";
import ContactUs from "./pages/static/ContactUs";

/* COMMON */
import CheckAuth from "./components/common/check-auth";
import UnauthPage from "./pages/unauth-page";
import NotFound from "./pages/not-found";
import WhatsAppChat from "./components/common/WhatsAppChat";
import CookieConsent from "./components/common/CookieConsent";
import AppLoader from "./components/common/AppLoader";

/* REDUX */
import { checkAuth } from "./store/auth-slice";
import { fetchFavorites } from "./store/shop/favorites-slice";

function App() {
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );

  const dispatch = useDispatch();

  /* 🔐 CHECK AUTH */
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  /* ❤️ FETCH FAVORITES */
  useEffect(() => {
    if (user?._id) {
      dispatch(fetchFavorites(user._id));
    }
  }, [user, dispatch]);

  if (isLoading) {
    return <AppLoader />;
  }

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <Routes>

        {/* 🌍 PUBLIC */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<PublicHome />} />
        </Route>

        {/* 🔐 AUTH */}
        <Route
          path="/auth"
          element={
            <CheckAuth
              isAuthenticated={isAuthenticated}
              user={user}
              isLoading={isLoading}
            >
              <AuthLayout />
            </CheckAuth>
          }
        >
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
        </Route>

        {/* 🛠 ADMIN */}
        <Route
          path="/admin"
          element={
            <CheckAuth
              isAuthenticated={isAuthenticated}
              user={user}
              isLoading={isLoading}
            >
              <AdminLayout />
            </CheckAuth>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="features" element={<AdminFeatures />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:userId" element={<AdminUserOrders />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="subscribers" element={<AdminSubscribers />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="bookings" element={<AdminBookings />} />

          {/* 🆕 ADMIN CHAT (ADDED – SAFE) */}
          <Route path="chat" element={<AdminChat />} />
        </Route>

        {/* 🛒 SHOP */}
        <Route
          path="/shop"
          element={
            <CheckAuth
              isAuthenticated={isAuthenticated}
              user={user}
              isLoading={isLoading}
            >
              <ShoppingLayout />
            </CheckAuth>
          }
        >
          <Route path="home" element={<ShoppingHome />} />
          <Route path="listing" element={<ShoppingListing />} />
          <Route path="checkout" element={<ShoppingCheckout />} />
          <Route path="account" element={<ShoppingAccount />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="product/:id" element={<ProductDetailsPage />} />
          <Route path="paypal-return" element={<PaypalReturnPage />} />
          <Route path="payment-success" element={<PaymentSuccessPage />} />
          <Route path="search" element={<SearchProducts />} />
          <Route path="my-bookings" element={<MyBookings />} />

          {/* 🆕 USER CHAT (ADDED – SAFE) */}
          <Route path="chat" element={<UserChat />} />
        </Route>

        {/* 📄 STATIC */}
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/contact-us" element={<ContactUs />} />

        {/* ❌ UNAUTH */}
        <Route path="/unauth-page" element={<UnauthPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <WhatsAppChat />
      <CookieConsent />
    </div>
  );
}

export default App;
