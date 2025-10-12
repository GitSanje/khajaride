"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"
import Link from "next/link"
import {
  type Vendor,
  type MenuCategory,
  type MenuItem,
  type MenuData,
} from "@/types"
import { useRestaurants } from "@/hooks/use-restaturants"



export default function CustomerApp() {

  const { 
    restaurants,
    loading,
    selectedRestaurant,
    menuCategories,
    menuItems,
    cart,
    loyaltyPoints,
    loadRestaurants,
    selectRestaurant,
    setRestaurants,
    addToCart,
    removeFromCart,
   } = useRestaurants();

   const [searchQuery, setSearchQuery] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)

  const [activeTab, setActiveTab] = useState("restaurants")
 const handleSearch = async (query: string) => {
    setSearchQuery(query)

    if (query.trim() === "") {
      loadRestaurants()
      return
    }

    setSearchLoading(true)
    console.log("[v0] Searching restaurants with query:", query)

    try {
      const filtered = restaurants.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
          restaurant.cuisine.toLowerCase().includes(query.toLowerCase()) ||
          restaurant.cuisine_tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())),
      )
      setRestaurants(filtered)
    } catch (error) {
      console.error("[v0] Search error:", error)
    } finally {
      setSearchLoading(false)
    }
  }
 


  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

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
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-3 text-base"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                  {searchLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                  <Button size="sm" onClick={loadRestaurants} variant="outline">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Loading restaurants...</span>
                </div>
              </div>
            )}

            {/* Tabs */}
            {!loading && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="restaurants">Restaurants ({restaurants.length})</TabsTrigger>
                  <TabsTrigger value="menu">Menu</TabsTrigger>
                  <TabsTrigger value="orders">My Orders</TabsTrigger>
                </TabsList>

                <TabsContent value="restaurants" className="space-y-6">
                  {/* Featured Restaurants */}
                  {restaurants.filter((r) => r.is_featured).length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Featured Restaurants</h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {restaurants
                          .filter((r) => r.is_featured)
                          .map((restaurant) => (
                            <Card
                              key={restaurant.id}
                              className="hover:shadow-lg transition-shadow cursor-pointer"
                              onClick={() => selectRestaurant(restaurant.id)}
                            >
                              <div className="relative">
                                <img
                                  src={restaurant.vendor_listing_image_name || "/placeholder.svg"}
                                  alt={restaurant.name}
                                  className="w-full h-48 object-cover rounded-t-lg"
                                />
                                <Button size="sm" variant="secondary" className="absolute top-2 right-2">
                                  <Heart className="w-4 h-4" />
                                </Button>
                                {!restaurant.is_open && (
                                  <Badge variant="destructive" className="absolute top-2 left-2">
                                    Closed
                                  </Badge>
                                )}
                                {restaurant.promo_text && (
                                  <Badge className="absolute bottom-2 left-2 bg-green-500">
                                    {restaurant.promo_text}
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
                                <p className="text-muted-foreground text-xs mb-2">{restaurant.address}</p>
                                <div className="flex items-center justify-between text-sm mb-2">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span>{restaurant.delivery_time_estimate}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Truck className="w-4 h-4 text-muted-foreground" />
                                    <span>Rs. {restaurant.delivery_fee}</span>
                                  </div>
                                </div>
                                {restaurant.min_order_amount > 0 && (
                                  <p className="text-xs text-muted-foreground mb-2">
                                    Min order: Rs. {restaurant.min_order_amount}
                                  </p>
                                )}
                                <div className="flex gap-1 flex-wrap">
                                  {restaurant.cuisine_tags.slice(0, 3).map((tag) => (
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
                          ))}
                      </div>
                    </div>
                  )}

                  {/* All Restaurants */}
                  <div>
                    <h2 className="text-2xl font-bold mb-4">
                      {searchQuery ? `Search Results for "${searchQuery}"` : "All Restaurants"}
                    </h2>
                    {restaurants.length === 0 ? (
                      <div className="text-center py-12">
                        <h3 className="text-lg font-semibold mb-2">No restaurants found</h3>
                        <p className="text-muted-foreground mb-4">
                          {searchQuery ? "Try a different search term" : "Unable to load restaurants"}
                        </p>
                        <Button onClick={loadRestaurants}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Retry
                        </Button>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {restaurants.map((restaurant) => (
                          <Card
                            key={restaurant.id}
                            className="hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => selectRestaurant(restaurant.id)}
                          >
                            <div className="relative">
                              <img
                                src={restaurant.vendor_listing_image_name || "/placeholder.svg"}
                                alt={restaurant.name}
                                className="w-full h-32 object-cover rounded-t-lg"
                              />
                              {!restaurant.is_open && (
                                <Badge variant="destructive" className="absolute top-2 left-2 text-xs">
                                  Closed
                                </Badge>
                              )}
                            </div>
                            <CardContent className="p-3">
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="font-semibold">{restaurant.name}</h3>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs font-medium">{restaurant.rating.toFixed(1)}</span>
                                </div>
                              </div>
                              <p className="text-muted-foreground text-xs mb-2">{restaurant.cuisine}</p>
                              <div className="flex items-center justify-between text-xs">
                                <span>{restaurant.delivery_time_estimate}</span>
                                <span>Rs. {restaurant.delivery_fee} delivery</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="menu" className="space-y-6">
                  {selectedRestaurant ? (
                    <div>
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2">
                          {restaurants.find((r) => r.id === selectedRestaurant)?.name} Menu
                        </h2>
                        <p className="text-muted-foreground">
                          {restaurants.find((r) => r.id === selectedRestaurant)?.cuisine} Cuisine
                        </p>
                      </div>

                      {menuCategories.map((category) => {
                        console.log(category,'category');
                        
                        const categoryItems = menuItems.filter(
                          (item) => item.category_id === category.id && item.is_available,
                        )
                     

                        if (categoryItems.length === 0) return null

                        return (
                          <div key={category.id} className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-xl font-semibold">{category.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {category.total_items} items
                              </Badge>
                            </div>
                            {category.description && (
                              <p className="text-muted-foreground text-sm mb-4">{category.description}</p>
                            )}
                            <div className="grid md:grid-cols-2 gap-4">
                              {categoryItems.map((item) => (
                                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                                  <div className="flex">
                                    <div className="flex-1 p-4">
                                      <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold">{item.name}</h3>
                                        <div className="flex gap-1">
                                          {item.is_popular && (
                                            <Badge variant="secondary" className="text-xs">
                                              Popular
                                            </Badge>
                                          )}
                                          {item.old_price > 0 && (
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
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-lg">Rs. {item.base_price}</span>
                                          {item.old_price > 0 && (
                                            <span className="text-sm text-muted-foreground line-through">
                                              Rs. {item.old_price}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Button size="sm" variant="outline" onClick={() => removeFromCart(item.id)}>
                                            <Minus className="w-3 h-3" />
                                          </Button>
                                          <span className="w-8 text-center">
                                            {cart.find((cartItem) => cartItem.id === item.id)?.quantity || 0}
                                          </span>
                                          <Button size="sm" onClick={() => addToCart(item)}>
                                            <Plus className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="w-24 h-24 m-4">
                                      <img
                                        src={item.image || "/placeholder.svg"}
                                        alt={item.name}
                                        className="w-full h-full object-cover rounded-lg"
                                      />
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-semibold mb-2">Select a Restaurant</h3>
                      <p className="text-muted-foreground">Choose a restaurant from the list to view their menu</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="orders" className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">My Orders</h2>
                    <div className="space-y-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold">Order #1234</h3>
                              <p className="text-muted-foreground text-sm">Spice Garden • 2 items</p>
                            </div>
                            <Badge variant="secondary">Delivered</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Jan 15, 2025</span>
                            <span className="font-semibold">$31.98</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold">Order #1233</h3>
                              <p className="text-muted-foreground text-sm">Pizza Palace • 1 item</p>
                            </div>
                            <Badge className="bg-green-500">Out for Delivery</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Jan 15, 2025</span>
                            <span className="font-semibold">$15.98</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold">Order #1232</h3>
                              <p className="text-muted-foreground text-sm">Burger Barn • 3 items</p>
                            </div>
                            <Badge variant="outline">Preparing</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Jan 14, 2025</span>
                            <span className="font-semibold">$28.47</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Your Cart
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-muted-foreground text-xs">${item.price} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => removeFromCart(item.id)}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center text-sm">{item.quantity}</span>
                          <Button size="sm" onClick={() => addToCart(item)}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span>Subtotal</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span>Delivery Fee</span>
                        <span>$2.99</span>
                      </div>
                      <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                        <span>Total</span>
                        <span>${(cartTotal + 2.99).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Loyalty Points */}
                    <div className="bg-primary/10 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Gift className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Loyalty Points</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        You have {loyaltyPoints} points. Earn {Math.floor(cartTotal)} more points with this order!
                      </p>
                    </div>

                    <Button className="w-full" size="lg">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Checkout
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
