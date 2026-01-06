import {
  LogOut,
  Menu,
  ShoppingCart,
  UserCog,
  Heart,
  CalendarCheck,
  MessageSquare, // ✅ ADDED
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import { useEffect, useState } from "react";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { Label } from "../ui/label";

/* ---------------- MENU ITEMS ---------------- */

function MenuItems() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  function handleNavigate(getCurrentMenuItem) {
    sessionStorage.removeItem("filters");
    const currentFilter =
      getCurrentMenuItem.id !== "home" &&
      getCurrentMenuItem.id !== "products" &&
      getCurrentMenuItem.id !== "search"
        ? { category: [getCurrentMenuItem.id] }
        : null;

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    location.pathname.includes("listing") && currentFilter !== null
      ? setSearchParams(
          new URLSearchParams(`?category=${getCurrentMenuItem.id}`)
        )
      : navigate(getCurrentMenuItem.path);
  }

  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:flex-row lg:items-center gap-6">
      {shoppingViewHeaderMenuItems.map((menuItem) => (
        <Label
          key={menuItem.id}
          onClick={() => handleNavigate(menuItem)}
          className="text-sm font-medium cursor-pointer text-white hover:text-[#d4af37] transition-colors"
        >
          {menuItem.label}
        </Label>
      ))}
    </nav>
  );
}

/* ---------------- RIGHT CONTENT ---------------- */

function HeaderRightContent() {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { list: favorites } = useSelector((state) => state.favorites);

  const [openCartSheet, setOpenCartSheet] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user.id));
    }
  }, [dispatch, user?.id]);

  return (
    <div className="flex lg:flex-row flex-col lg:items-center gap-4">
      {/* ❤️ FAVORITES */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/shop/favorites")}
        className="relative text-[#d4af37] hover:bg-transparent focus-visible:ring-0"
      >
        <Heart className="w-6 h-6" />
        <span className="absolute -top-1 right-1 text-xs font-bold">
          {favorites?.length || 0}
        </span>
      </Button>

      {/* 💬 CHAT (ADDED – SAFE) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/shop/chat")}
        className="text-[#d4af37] hover:bg-transparent focus-visible:ring-0"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>

      {/* 🛒 CART */}
      <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
        <Button
          onClick={() => setOpenCartSheet(true)}
          variant="ghost"
          size="icon"
          className="relative text-[#d4af37] hover:bg-transparent focus-visible:ring-0"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-1 right-1 text-xs font-bold">
            {cartItems?.items?.length || 0}
          </span>
        </Button>

        <UserCartWrapper
          setOpenCartSheet={setOpenCartSheet}
          cartItems={cartItems?.items || []}
        />
      </Sheet>

      {/* 👤 PROFILE */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="bg-[#2a1c15] border-none">
            <AvatarFallback className="bg-[#2a1c15] text-[#d4af37] font-extrabold">
              {user?.userName?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="right"
          className="w-56 bg-[#111827] text-white border border-gray-700"
        >
          <DropdownMenuLabel>
            Logged in as {user?.userName}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/shop/account")}>
            <UserCog className="mr-2 h-4 w-4" />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/shop/my-bookings")}>
            <CalendarCheck className="mr-2 h-4 w-4" />
            My Bookings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/* ---------------- HEADER ---------------- */

function ShoppingHeader() {
  const [openMobileMenu, setOpenMobileMenu] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setOpenMobileMenu(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#3a2a1d] bg-[#2a1c15]">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* LOGO */}
        <Link to="/shop/home" className="flex items-center gap-3">
          <img
            src="/logo.jpeg"
            alt="Mr Perfect Logo"
            className="h-10 w-10 rounded-full object-cover border-none bg-transparent"
          />
          <div className="leading-tight">
            <span className="block text-white font-semibold">
              Mr. Perfect
            </span>
            <span className="block text-xs text-[#d4af37]">
              Fashion Club
            </span>
          </div>
        </Link>

        {/* MOBILE MENU */}
        <div className="lg:hidden">
          <Sheet open={openMobileMenu} onOpenChange={setOpenMobileMenu}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#d4af37] hover:bg-transparent focus-visible:ring-0"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-full max-w-xs bg-[#2a1c15] text-white"
            >
              <MenuItems />
              <HeaderRightContent />
            </SheetContent>
          </Sheet>
        </div>

        {/* DESKTOP */}
        <div className="hidden lg:block">
          <MenuItems />
        </div>

        <div className="hidden lg:block">
          <HeaderRightContent />
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
