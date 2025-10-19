import { useAddCartItem, useGetCartItems, type TAddCartItemResponse } from "@/api/hooks/use-cart-query";
import type { TAddCartItem } from "@/types/cart-types";
import type { TAddCartItemPayload, TCartItemPopulated } from "@khajaride/zod";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";




interface RestaurantDataContextValue {
  calcs: {
    cartTotal: number |undefined
    GrandTotal: number |undefined
    TotalDelivery: number |undefined
    OverallSubtotal: number |undefined
    cartItemCount:number
  } 
  cart: TCartItemPopulated[] |undefined
  loyaltyPoints: number

  // actions
  addToCart: (item: TAddCartItem) => Promise<TAddCartItemResponse | null>;
  removeFromCart: (itemId: string) => void
}


const RestaurantDataContext = createContext<RestaurantDataContextValue | null>(null);
interface RestaurantDataProviderProps {
  children: React.ReactNode;
}


export const RestaurantsDataProvider = ({ children }: RestaurantDataProviderProps) => {

  const [loyaltyPoints] = useState(1250)



  const { data: cart } = useGetCartItems({
    enabled: true
  })


  console.log(cart,'cart from ');
  
  const addCartItemMutation = useAddCartItem();

const addToCart = async (item: TAddCartItem): Promise<TAddCartItemResponse | null> => {
  if (!item) return null;

  try {
    const payload: TAddCartItemPayload = {
      vendorId: item.vendorId,
      menuItemId: item.id,
      quantity: item.quantity,
      unitPrice: item.basePrice,
      specialInstructions: item.specialInstructions || undefined,
    };

    const createdCartItem = await addCartItemMutation.mutateAsync({ body: payload });
    toast.success("Added to cart!");

    return createdCartItem;
  } catch (error) {
    console.error("❌ Failed to add item to cart:", error);
    toast.error("Failed to add item to cart.");
    return null;
  }
};




// ------------------------ Calculations ------------------------

const OverallSubtotal = cart?.reduce((acc, vendor) => {
    const vendorSubtotal = vendor.cartItems.reduce((sum, { cartItem }) => {
      return sum + cartItem.subtotal;
    }, 0);
    return acc + vendorSubtotal;
  }, 0);


const TotalDelivery = cart?.reduce((acc, vendor) => {
    return acc + (vendor.deliveryCharge ?? 0);
  }, 0);

const GrandTotal = cart?.reduce((acc, vendor) => {
    const subtotal = vendor.cartItems.reduce((sum, { cartItem }) => sum + cartItem.subtotal, 0);
    const delivery = vendor.deliveryCharge ?? 0;
    const vat = vendor.vat ?? 0;
    const serviceCharge = vendor.vendorServiceCharge ?? 0;
    const discount = vendor.vendorDiscount ?? 0;

    const total = subtotal + delivery + vat + serviceCharge - discount;
    return acc + total;
  }, 0);



const cartTotal = cart?.reduce((total, vendor) => {
  const vendorTotal = vendor.cartItems.reduce((vendorSum, cartMenuItem) => {
    const item = cartMenuItem.cartItem;
    const itemTotal = (item.unitPrice * item.quantity) - (item.discountAmount || 0);
    return vendorSum + itemTotal;
  }, 0);
  
  // Add vendor charges
  return total + vendorTotal + (vendor.vendorServiceCharge || 0) + (vendor.vat || 0) + (vendor.deliveryCharge || 0) - (vendor.vendorDiscount || 0);
}, 0);


 const cartItemCount = cart?.reduce((sum, item) => sum + item.cartItems.reduce((itemSum, citem) => itemSum + citem.cartItem.quantity, 0), 0) || 0;


const calcs = {
  cartTotal,
  GrandTotal,
  TotalDelivery,
  OverallSubtotal,
  cartItemCount


}
  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === itemId)
      if (existing && existing.quantity > 1) {
        return prev.map((cartItem) =>
          cartItem.id === itemId ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem,
        )
      }
      return prev.filter((cartItem) => cartItem.id !== itemId)
    })
  }

  const contextValue = {


    cart,
    loyaltyPoints,
    calcs,
    //actions

    addToCart,
    removeFromCart,
  }

  return <RestaurantDataContext.Provider value={contextValue}>
    {children}</RestaurantDataContext.Provider>;
}



export const useRestaurants = () => {
  const ctx = useContext(RestaurantDataContext);

  if (!ctx) {
    throw new Error("useRestaurants must be used within a RestaurantsDataProvider");
  }

  return ctx;
};
