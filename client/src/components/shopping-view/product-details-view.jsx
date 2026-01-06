import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import {
  createBooking,
  fetchUserBookings,
} from "@/store/shop/booking-slice";

function ProductDetailsView({ productDetails }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // ✅ ADDED: get address list (NO side effects)
  const { addressList } = useSelector((state) => state.shopAddress);

  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState(null);

  // ✅ ADDED: pick latest address safely (NO UI change)
  const selectedAddress =
    addressList && addressList.length > 0
      ? addressList[addressList.length - 1]
      : null;

  if (!productDetails) return null;

  /* ================= ADD TO CART ================= */
  function handleAddToCart() {
    if (!user?.id) {
      toast({
        title: "Please login to add items to cart",
        variant: "destructive",
      });
      return;
    }

    if (!selectedSize) {
      toast({
        title: "Please select a size",
        variant: "destructive",
      });
      return;
    }

    dispatch(
      addToCart({
        userId: user.id,
        productId: productDetails._id,
        quantity: 1,
        size: selectedSize,
      })
    ).then((res) => {
      if (res?.payload?.success) {
        dispatch(fetchCartItems(user.id));
        toast({ title: "Product added to cart" });
      } else {
        toast({
          title: "Failed to add product",
          variant: "destructive",
        });
      }
    });
  }

  /* ================= BOOK NOW ================= */
  function handleBookNow() {
    if (!user?.id) {
      toast({
        title: "Please login to book",
        variant: "destructive",
      });
      return;
    }

    if (!selectedSize) {
      toast({
        title: "Please select a size",
        variant: "destructive",
      });
      return;
    }

    dispatch(
      createBooking({
        userId: user.id,
        userName: user.userName,
        email: user.email,
        phone: user.phone || "",

        // ✅ ADDED: shipping snapshot (SAFE, OPTIONAL)
        address: selectedAddress?.address || "",
        city: selectedAddress?.city || "",
        pincode: selectedAddress?.pincode || "",
        notes: selectedAddress?.notes || "",

        productId: productDetails._id,
        productName: productDetails.title,
        productImage: productDetails.image,
        size: selectedSize,
      })
    ).then((res) => {
      if (res?.payload?.success) {
        toast({
          title: "Booking created",
          description: "Admin will contact you for payment",
        });

        dispatch(fetchUserBookings(user.id));
      } else {
        toast({
          title: "Booking failed",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* IMAGE */}
      <div className="relative overflow-hidden rounded-lg">
        <img
          src={productDetails.image}
          alt={productDetails.title}
          className="w-full aspect-square object-cover rounded-lg"
        />
      </div>

      {/* DETAILS */}
      <div>
        <h1 className="text-3xl font-extrabold">
          {productDetails.title}
        </h1>

        <p className="text-muted-foreground text-lg mt-4">
          {productDetails.description}
        </p>

        {/* PRICE */}
        <div className="flex items-center gap-6 mt-6">
          <span
            className={`text-3xl font-bold ${
              productDetails.salePrice > 0 ? "line-through" : ""
            }`}
          >
            ₹{productDetails.price}
          </span>

          {productDetails.salePrice > 0 && (
            <span className="text-2xl font-bold text-red-600">
              ₹{productDetails.salePrice}
            </span>
          )}
        </div>

        {/* SIZE */}
        <div className="mt-6">
          <Label>Select Size</Label>
          <div className="flex gap-2 mt-2 flex-wrap">
            {(productDetails.sizes || ["S", "M", "L", "XL", "XXL"]).map(
              (size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </Button>
              )
            )}
          </div>
        </div>

        <Separator className="my-6" />

        {/* ADD TO CART */}
        <Button className="w-full mb-3" onClick={handleAddToCart}>
          Add to Cart
        </Button>

        {/* BOOK NOW */}
        <Button
          variant="outline"
          className="w-full mb-2"
          onClick={handleBookNow}
        >
          Book Now
        </Button>

        {/* CONTACT OPTIONS */}
        <div className="flex gap-3 mt-2">
          <a
            href="tel:+919999999999"
            className="flex-1 text-center text-sm font-medium border border-blue-600 text-blue-600 py-2 rounded-md hover:bg-blue-50 transition"
          >
            Call to Book
          </a>

          <a
            href={`https://wa.me/919999999999?text=Hi, I want to book ${productDetails.title}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-sm font-medium border border-green-600 text-green-600 py-2 rounded-md hover:bg-green-50 transition"
          >
            WhatsApp to Book
          </a>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsView;
