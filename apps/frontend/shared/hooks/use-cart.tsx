import { useAddCartItem, useDeleteCartItem, useGetCartItems, type TAddCartItemResponse } from "@/api/hooks/use-cart-query";
import type { TAddCartItem } from "@/types/cart-types";
import type { TAddCartItemPayload, TCartItemPopulated } from "@khajaride/zod";
import { createContext, useContext, useState } from "react";
import { toast } from "sonner";




interface CartDataContextContextValue {
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


const CartDataContext = createContext<CartDataContextContextValue | null>(null);
interface CartDataProviderProps {
  children: React.ReactNode;
}


export const RestaurantsDataProvider = ({ children }: CartDataProviderProps) => {

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
    const removeFromCart = async (itemId: string): Promise<void | null> => {
      if (!itemId) return null;

      try {
        const deleteCartItemMutation = useDeleteCartItem();
        await deleteCartItemMutation.mutateAsync({ cartId: itemId });
        
      } catch (error) {
        console.error("❌ Failed to remove item from cart:", error);
        toast.error("Failed to remove item from cart.");
        return null;
      }
    };


  const contextValue = {


    cart,
    loyaltyPoints,
    calcs,
    //actions

    addToCart,
    removeFromCart,
  }

  return <CartDataContext.Provider value={contextValue}>
    {children}</CartDataContext.Provider>;
}



export const useCart = () => {
  const ctx = useContext(CartDataContext);

  if (!ctx) {
    throw new Error("useRestaurants must be used within a RestaurantsDataProvider");
  }

  return ctx;
};
