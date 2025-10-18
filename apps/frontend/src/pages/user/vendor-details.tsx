"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
    Heart,
    ArrowLeft,
    Info,
    Share2,
    Loader2,
    Store,
} from "lucide-react"
import { Link, useParams } from "react-router-dom"




import { useGetVenoorById } from "@/api/hooks/use-vendor-query"
import type { TCartItemPopulated, TMenuItem } from "@khajaride/zod"
import { AddToCartModal } from "../cart/add-to-cart"
import { useGetCartItems } from "@/api/hooks/use-cart-query"


export default function VendorMenuPage() {
    const params = useParams<{ vendorId: string }>();
    const vendorId = params.vendorId as string


    const [searchQuery, setSearchQuery] = useState("")
    const [activeCategory, setActiveCategory] = useState<string>("")
    const [loyaltyPoints] = useState(1250)
    
    const { data: vendor , isLoading } = useGetVenoorById({
        id: vendorId
    })

   
    const [selectedItem, setSelectedItem] = useState<TMenuItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const {data:cartItems, isLoading:getLoading} = useGetCartItems({
          enabled:true
      })
     

    // Helper functions to calculate totals

    const getItemQuantity = (itemId: string) => {
        return cartItems?.find((item) => item.id === itemId)?.quantity || 0
    }

  const cartItemCount = cartItems?.reduce((sum, item) => sum + item.cartItems.reduce((itemSum, citem) => itemSum + citem.cartItem.quantity, 0), 0) || 0;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Loading restaurant menu...</span>
                </div>
            </div>
        )
    }

    if (!vendor) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Restaurant not found</h2>
                    <Link to="/app">
                        <Button>Back to Restaurants</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/khajaride" className="flex items-center gap-2">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <Link to="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <span className="text-primary-foreground font-bold text-lg">K</span>
                                </div>
                                <span className="text-xl font-bold text-foreground">KhajaRide</span>
                            </Link>
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

            {/* Restaurant Hero Section */}
            <div className="relative h-64 overflow-hidden">
                <img
                    src={vendor.vendorListingImage || "/placeholder.svg?height=256&width=800&query=restaurant food"}
                    alt={vendor.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{vendor.name}</h1>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-medium">{vendor.rating.toFixed(1)}</span>
                                    <span className="text-white/80">(68)</span>
                                </div>
                                <span>•</span>
                                <span>{vendor.cuisine}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {vendor.address?.streetAddress}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="secondary">
                                <Heart className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="secondary">
                                <Share2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="secondary">
                                <Info className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Restaurant Info Bar */}
            <div className="bg-card border-b border-border">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">$0 Delivery Fee on $12+</span>
                                <Badge variant="secondary" className="text-xs">
                                    Other fees
                                </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>36 min</span>
                                <span className="text-muted-foreground">Earliest arrival</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                                Delivery
                            </Button>
                            <Button variant="outline" size="sm">
                                Pickup
                            </Button>
                            <Button variant="outline" size="sm">
                                <User className="w-4 h-4 mr-1" />
                                Group order
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Sidebar Menu */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32">
                            {/* Search */}
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder={`Search in ${vendor.name}`}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Menu Categories */}
                            <div className="space-y-1">
                                <h3 className="font-semibold text-sm text-muted-foreground mb-2 uppercase tracking-wide">
                                    {vendor.name} MENU
                                </h3>
                                <p className="text-xs text-muted-foreground mb-4">Open 24 Hours</p>
                                {vendor.categories?.map((category) => (
                                    <button
                                        key={category.categoryId}
                                        onClick={() => setActiveCategory(category.categoryId)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === category.categoryId
                                                ? "bg-primary/10 text-primary font-medium"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                            }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Savings Section */}
                        {/* <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">Savings and more</h2>
                            <Card className="bg-red-50 border-red-200">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-red-500 text-white rounded-full p-3">
                                            <span className="text-2xl font-bold">%</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">Save 20% when you order $20 or more</h3>
                                            <p className="text-sm text-muted-foreground">Use by Mar 21, 2026 11 PM</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div> */}

                        {/* Rating and Reviews */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold">Rating and reviews</h2>
                                <Button variant="outline" size="sm">
                                    See more
                                </Button>
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="text-4xl font-bold">{vendor.rating.toFixed(1)}</div>
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-4 h-4 ${star <= Math.floor(vendor.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-muted-foreground">68 Ratings</p>
                                </div>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                    <span className="font-medium">Celia G.</span>
                                    <span className="text-muted-foreground">• 04/25/23</span>
                                </div>
                                <p className="text-sm">"Wow you guys are the best"</p>
                            </div>
                        </div>

                        {/* Menu Items */}
                       
                     {vendor.categories?.map((category) => {
                       
                        
                        const categoryItems = category.items
                    

                        if (categoryItems?.length === 0) return null

                        return (
                          <div key={category.categoryId} className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-xl font-semibold">{category.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {categoryItems?.length} items
                              </Badge>
                            </div>
                            {category.description && (
                              <p className="text-muted-foreground text-sm mb-4">{category.description}</p>
                            )}
                            <div className="grid md:grid-cols-1 gap-3">
                              {categoryItems?.map((item) => (
                                <div key={item.id} 
                                onClick={() => {
                                    setSelectedItem(item)
                                    setIsModalOpen(true)
                                 }}
                                 className="group cursor-pointer p-4 rounded-lg border border-border hover:border-primary hover:bg-muted/50 transition-all duration-200">
                                  <div className="flex items-start justify-between ">
                                    <div className="flex-1 ">
                                      <div className="flex items-start justify-between ">
                                        <h3 className="font-semibold">{item.name}</h3>
                                        <div className="flex gap-1">
                                          {item.isPopular && (
                                            <Badge variant="secondary" className="text-xs">
                                              Popular
                                            </Badge>
                                          )}
                                          {item.oldPrice > 0 && (
                                            <Badge variant="destructive" className="text-xs">
                                              Sale
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      <p className="text-muted-foreground text-sm mb-3">{item.description}</p>
                                      {item.tags && item.tags.length > 0 && (
                                        <div className="flex gap-1 mb-3 flex-wrap">
                                          {item.tags.slice(0, 2).map((tag) => (
                                            <Badge key={tag} variant="outline" className="text-xs">
                                              {tag}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                     
                                    </div>
                                     <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-lg">Rs. {item.basePrice}</span>
                                          {item.oldPrice > 0 && (
                                            <span className="text-sm text-muted-foreground line-through">
                                              Rs. {item.oldPrice}
                                            </span>
                                          )}
                                        </div>
                                   
                                      </div>
                                   
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
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
                            menuItemId: menuItem.id,
                            quantity: 1,
                            unitPrice: cartItem.unitPrice,
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
                <span>${calculateOverallSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>Total Delivery</span>
                <span>${calculateTotalDelivery().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                <span>Grand Total</span>
                <span>${calculateGrandTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Loyalty Points */}
            <div className="bg-primary/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Loyalty Points</span>
              </div>
              <p className="text-xs text-muted-foreground">
                You have {loyaltyPoints} points. Earn {Math.floor(calculateGrandTotal())} more points with this order!
              </p>
            </div>

            <Link to="/app/checkout">
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
            <AddToCartModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        />
        </div>
    )
}
