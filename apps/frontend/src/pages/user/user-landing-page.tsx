"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Search,
  MapPin,
  Star,
  Clock,
  Plus,
  Minus,
  ShoppingCart,
  User,
  Gift,
  Filter,
  Heart,
  Truck,
  CreditCard,
  Loader2,
  RefreshCw,
  Store,
} from "lucide-react"
import Link from "next/link"

import { useRestaurants } from "@/hooks/use-restaturants"
import { useGetAllVendors, type TGetVendorsQuery } from "@/api/hooks"
import { useDebounce } from "@/api/hooks/use-debounce"
import { useNavigate } from "react-router-dom"; 
import { useGetCartItems } from "@/api/hooks/use-cart-query"
import type { TCartItemPopulated } from "@khajaride/zod"


export default function CustomerApp() {

  const { 
    
   
    loyaltyPoints,
    addToCart,
    removeFromCart,
    calcs
   } = useRestaurants();

  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<TGetVendorsQuery["sort"]>("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");


const { data: vendorsData, isLoading } = useGetAllVendors(
  
  { query: {
    page,
    limit: 20,
    // search: debouncedSearch || undefined,
    sort: sortBy,
    order: sortOrder,
  }});

   const {data:cartItems, isLoading:getLoading} = useGetCartItems({
          enabled:true
      })

 const  {
  cartTotal,
  GrandTotal,
  TotalDelivery,
  OverallSubtotal

}=calcs

// const featuredvendors = featuredvendorsData?.data ?? [];
const vendors = vendorsData?.data ?? [];
const navigate = useNavigate();
 const handleSearch = () => {
  navigate(`/khajaride/search?q=${encodeURIComponent(searchQuery)}`);
  }
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };


 const cartItemCount = cartItems?.reduce((sum, item) => sum + item.cartItems.reduce((itemSum, citem) => itemSum + citem.cartItem.quantity, 0), 0) || 0;
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">K</span>
                </div>
                <span className="text-xl font-bold text-foreground">KhajaRide</span>
              </Link>

              <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{process.env.NEXT_PUBLIC_DEFAULT_CITY || "Delivering to Kathmandu"}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Loyalty Points */}
              <div className="hidden sm:flex items-center gap-2 bg-primary/10 rounded-lg px-3 py-2">
                <Gift className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">{loyaltyPoints} pts</span>
              </div>

              {/* Cart */}
              <Button variant="outline" size="sm" className="relative bg-transparent">
                <ShoppingCart className="w-4 h-4" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>

              {/* Profile */}
              <Button variant="outline" size="sm">
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search restaurants, cuisines, or dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown} 
                  className="pl-10 pr-4 py-3 text-base"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                  <Button size="sm"  variant="outline">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Loading restaurants...</span>
                </div>
              </div>
            )}

            {/* Tabs */}
            {!isLoading && (
              <div  className="space-y-6"> 
                    <h2 className="text-2xl font-bold mb-4">
                      {searchQuery ? `Search Results for "${searchQuery}"` : "VENDORS"}
                  </h2>

                {vendors.length === 0 ?(
                      <div className="text-center py-12">
                        <h3 className="text-lg font-semibold mb-2">No restaurants found</h3>
                        <p className="text-muted-foreground mb-4">
                          {searchQuery ? "Try a different search term" : "Unable to load restaurants"}
                        </p>
                        <Button >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Retry
                        </Button>
                      </div>): 
                    (<div >

                      <div className="grid md:grid-cols-2 gap-4">
                        {vendors
                          .map((restaurant) => (
                            <Link href={`/khajaride/vendor/${restaurant.id}`}>

            
                            <Card
                              key={restaurant.id}
                              className="hover:shadow-lg transition-shadow cursor-pointer"
                             
                            >
                              <div className="relative">
                                <img
                                  src={restaurant.vendorListingImage || "/placeholder.svg"}
                                  alt={restaurant.name}
                                  className="w-full h-48 object-cover rounded-t-lg"
                                />
                                <Button size="sm" variant="secondary" className="absolute top-2 right-2">
                                  <Heart className="w-4 h-4" />
                                </Button>
                                {!restaurant.isOpen && (
                                  <Badge variant="destructive" className="absolute top-2 left-2">
                                    Closed
                                  </Badge>
                                )}
                                {restaurant.promoText && (
                                  <Badge className="absolute bottom-2 left-2 bg-green-500">
                                    {restaurant.promoText}
                                  </Badge>
                                )}
                              </div>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm font-medium">{restaurant.rating.toFixed(1)}</span>
                                  </div>
                                </div>
                                <p className="text-muted-foreground text-sm mb-2">{restaurant.cuisine}</p>
                                {/* <p className="text-muted-foreground text-xs mb-2">{restaurant}</p> */}
                                <div className="flex items-center justify-between text-sm mb-2">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span>{restaurant.openingHours}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Truck className="w-4 h-4 text-muted-foreground" />
                                    <span>Rs. {restaurant.deliveryFee}</span>
                                  </div>
                                </div>
                                {restaurant.minOrderAmount > 0 && (
                                  <p className="text-xs text-muted-foreground mb-2">
                                    Min order: Rs. {restaurant.minOrderAmount}
                                  </p>
                                )}
                                <div className="flex gap-1 flex-wrap">
                                  {restaurant.cuisineTags?.slice(0, 3).map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {/* <Badge variant="outline" className="text-xs">
                                    {restaurant.distance.toFixed(1)} km
                                  </Badge> */}
                                </div>
                              </CardContent>
                            </Card>
                              </Link>
                          ))}
                      </div>
                    </div>
                  )}
               {vendorsData && vendorsData.totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {(page - 1) * 20 + 1} to{" "}
                      {Math.min(page * 20, vendorsData.total)} of {vendorsData.total} vendors
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= vendorsData.totalPages}
                        onClick={() => setPage(page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>

            )}
          </div>

          {/* Cart Sidebar */}
                      <div className="lg:col-span-1">
  <div className="sticky top-32">
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="w-5 h-5" />
          <h3 className="font-semibold">Your Cart</h3>
        </div>

        {cartItems?.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Group cart items by vendor */}
            {cartItems?.map((cartVendor:TCartItemPopulated) => (
              <div key={cartVendor.vendor.vendorId} className="border rounded-lg p-3">
                {/* Vendor Header */}
                <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                  <Store className="w-4 h-4 text-primary" />
                  <div>
                    <h4 className="font-semibold text-sm">{cartVendor.vendor.name}</h4>
                    {cartVendor.vendor.about && (
                      <p className="text-xs text-muted-foreground truncate">
                        {cartVendor.vendor.about}
                      </p>
                    )}
                  </div>
                </div>

                {/* Cart Items for this Vendor */}
                <div className="space-y-3">
                  {cartVendor.cartItems.map(({ cartItem, menuItem }) => (
                    <div key={cartItem.id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{menuItem.name}</h4>
                        <p className="text-muted-foreground text-xs">
                          ${cartItem.unitPrice.toFixed(2)} each
                        </p>
                        {cartItem.specialInstructions && (
                          <p className="text-xs text-muted-foreground italic">
                            Note: {cartItem.specialInstructions}
                          </p>
                        )}
                        {cartItem.discountAmount > 0 && (
                          <p className="text-xs text-green-600">
                            -${cartItem.discountAmount.toFixed(2)} discount
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => removeFromCart(cartItem.id)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-6 text-center text-sm">{cartItem.quantity}</span>
                        <Button 
                          size="sm" 
                          onClick={() => addToCart({
                            vendorId: cartVendor.vendor.vendorId,
                            id: menuItem.id,
                            quantity: 1,
                            basePrice: cartItem.unitPrice,
                            discountAmount: cartItem.discountAmount,
                            specialInstructions: cartItem.specialInstructions || undefined
                          })}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vendor-level Totals */}
                <div className="mt-3 pt-3 border-t text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span>Subtotal</span>
                    <span>${(cartVendor.subtotal || 0).toFixed(2)}</span>
                  </div>
                  {cartVendor.vendorDiscount > 0 && (
                    <div className="flex justify-between items-center mb-1 text-green-600">
                      <span>Vendor Discount</span>
                      <span>-${cartVendor.vendorDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {cartVendor.vendorServiceCharge > 0 && (
                    <div className="flex justify-between items-center mb-1">
                      <span>Service Charge</span>
                      <span>${cartVendor.vendorServiceCharge.toFixed(2)}</span>
                    </div>
                  )}
                  {cartVendor.vat > 0 && (
                    <div className="flex justify-between items-center mb-1">
                      <span>VAT</span>
                      <span>${cartVendor.vat.toFixed(2)}</span>
                    </div>
                  )}
                  {cartVendor.deliveryCharge && cartVendor.deliveryCharge > 0 && (
                    <div className="flex justify-between items-center mb-1">
                      <span>Delivery</span>
                      <span>${cartVendor.deliveryCharge.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center font-semibold text-sm pt-1 border-t">
                    <span>Vendor Total</span>
                    <span>${(cartVendor.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Overall Cart Summary */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Subtotal</span>
                <span>${OverallSubtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>Total Delivery</span>
                <span>${TotalDelivery?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                <span>Grand Total</span>
                <span>${GrandTotal?.toFixed(2)}</span>
              </div>
            </div>

            {/* Loyalty Points */}
            <div className="bg-primary/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Loyalty Points</span>
              </div>
              <p className="text-xs text-muted-foreground">
                You have {loyaltyPoints} points. Earn {Math.floor(GrandTotal!)} more points with this order!
              </p>
            </div>

            <Link href="/app/checkout">
              <Button className="w-full" size="lg">
                Go to checkout
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
</div>
        </div>
      </div>
    </div>
  )
}
