"use client"

import { useState } from "react"
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
} from "lucide-react"
import Link from "next/link"

// Mock data for restaurants and menu items
const restaurants = [
  {
    id: 1,
    name: "Spice Garden",
    cuisine: "Indian",
    rating: 4.5,
    deliveryTime: "25-30 min",
    deliveryFee: 2.99,
    image: "/indian-restaurant-food.png",
    featured: true,
    categories: ["Curry", "Biryani", "Tandoor"],
  },
  {
    id: 2,
    name: "Pizza Palace",
    cuisine: "Italian",
    rating: 4.3,
    deliveryTime: "20-25 min",
    deliveryFee: 1.99,
    image: "/bustling-pizza-restaurant.png",
    featured: false,
    categories: ["Pizza", "Pasta", "Salads"],
  },
  {
    id: 3,
    name: "Burger Barn",
    cuisine: "American",
    rating: 4.7,
    deliveryTime: "15-20 min",
    deliveryFee: 2.49,
    image: "/burger-restaurant.png",
    featured: true,
    categories: ["Burgers", "Fries", "Shakes"],
  },
  {
    id: 4,
    name: "Sushi Zen",
    cuisine: "Japanese",
    rating: 4.8,
    deliveryTime: "30-35 min",
    deliveryFee: 3.99,
    image: "/bustling-sushi-restaurant.png",
    featured: false,
    categories: ["Sushi", "Ramen", "Tempura"],
  },
]

const menuItems = [
  {
    id: 1,
    restaurantId: 1,
    name: "Chicken Biryani",
    description: "Aromatic basmati rice with tender chicken and traditional spices",
    price: 14.99,
    image: "/flavorful-chicken-biryani.png",
    category: "Biryani",
    popular: true,
  },
  {
    id: 2,
    restaurantId: 1,
    name: "Butter Chicken",
    description: "Creamy tomato-based curry with tender chicken pieces",
    price: 16.99,
    image: "/butter-chicken-curry.png",
    category: "Curry",
    popular: true,
  },
  {
    id: 3,
    restaurantId: 1,
    name: "Tandoori Chicken",
    description: "Marinated chicken cooked in traditional clay oven",
    price: 18.99,
    image: "/tandoori-chicken.png",
    category: "Tandoor",
    popular: false,
  },
  {
    id: 4,
    restaurantId: 2,
    name: "Margherita Pizza",
    description: "Fresh mozzarella, tomato sauce, and basil on crispy crust",
    price: 12.99,
    image: "/margherita-pizza.png",
    category: "Pizza",
    popular: false,
  },
  {
    id: 5,
    restaurantId: 2,
    name: "Pepperoni Pizza",
    description: "Classic pepperoni with mozzarella cheese",
    price: 15.99,
    image: "/pepperoni-pizza.png",
    category: "Pizza",
    popular: true,
  },
  {
    id: 6,
    restaurantId: 2,
    name: "Chicken Alfredo Pasta",
    description: "Creamy alfredo sauce with grilled chicken and fettuccine",
    price: 17.99,
    image: "/chicken-alfredo-pasta.png",
    category: "Pasta",
    popular: true,
  },
  {
    id: 7,
    restaurantId: 3,
    name: "Classic Cheeseburger",
    description: "Beef patty with cheese, lettuce, tomato, and special sauce",
    price: 11.99,
    image: "/classic-cheeseburger.png",
    category: "Burgers",
    popular: true,
  },
  {
    id: 8,
    restaurantId: 3,
    name: "Crispy Chicken Burger",
    description: "Crispy fried chicken with mayo and fresh vegetables",
    price: 13.99,
    image: "/crispy-chicken-burger.png",
    category: "Burgers",
    popular: false,
  },
  {
    id: 9,
    restaurantId: 3,
    name: "Loaded Fries",
    description: "Crispy fries topped with cheese, bacon, and green onions",
    price: 8.99,
    image: "/loaded-fries.png",
    category: "Fries",
    popular: true,
  },
  {
    id: 10,
    restaurantId: 4,
    name: "Salmon Sashimi",
    description: "Fresh salmon slices served with wasabi and ginger",
    price: 19.99,
    image: "/salmon-sashimi.png",
    category: "Sushi",
    popular: true,
  },
  {
    id: 11,
    restaurantId: 4,
    name: "California Roll",
    description: "Crab, avocado, and cucumber wrapped in seaweed and rice",
    price: 12.99,
    image: "/california-roll.png",
    category: "Sushi",
    popular: false,
  },
  {
    id: 12,
    restaurantId: 4,
    name: "Chicken Ramen",
    description: "Rich chicken broth with noodles, egg, and vegetables",
    price: 15.99,
    image: "/chicken-ramen-bowl.jpg",
    category: "Ramen",
    popular: true,
  },
]

export default function CustomerApp() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null)
  const [cart, setCart] = useState<Array<{ id: number; name: string; price: number; quantity: number }>>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loyaltyPoints] = useState(1250)
  const [activeTab, setActiveTab] = useState("restaurants")

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id)
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId: number) => {
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

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
                <span className="text-sm">Delivering to Downtown</span>
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
                  className="pl-10 pr-4 py-3 text-base"
                />
                <Button size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
                <TabsTrigger value="menu">Menu</TabsTrigger>
                <TabsTrigger value="orders">My Orders</TabsTrigger>
              </TabsList>

              <TabsContent value="restaurants" className="space-y-6">
                {/* Featured Restaurants */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">Featured Restaurants</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {filteredRestaurants
                      .filter((r) => r.featured)
                      .map((restaurant) => (
                        <Card
                          key={restaurant.id}
                          className="hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => setSelectedRestaurant(restaurant.id)}
                        >
                          <div className="relative">
                            <img
                              src={restaurant.image || "/placeholder.svg"}
                              alt={restaurant.name}
                              className="w-full h-48 object-cover rounded-t-lg"
                            />
                            <Button size="sm" variant="secondary" className="absolute top-2 right-2">
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{restaurant.rating}</span>
                              </div>
                            </div>
                            <p className="text-muted-foreground text-sm mb-2">{restaurant.cuisine}</p>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>{restaurant.deliveryTime}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Truck className="w-4 h-4 text-muted-foreground" />
                                <span>${restaurant.deliveryFee}</span>
                              </div>
                            </div>
                            <div className="flex gap-1 mt-2">
                              {restaurant.categories.slice(0, 2).map((category) => (
                                <Badge key={category} variant="secondary" className="text-xs">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>

                {/* All Restaurants */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">All Restaurants</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRestaurants.map((restaurant) => (
                      <Card
                        key={restaurant.id}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedRestaurant(restaurant.id)}
                      >
                        <div className="relative">
                          <img
                            src={restaurant.image || "/placeholder.svg"}
                            alt={restaurant.name}
                            className="w-full h-32 object-cover rounded-t-lg"
                          />
                        </div>
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold">{restaurant.name}</h3>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-medium">{restaurant.rating}</span>
                            </div>
                          </div>
                          <p className="text-muted-foreground text-xs mb-2">{restaurant.cuisine}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span>{restaurant.deliveryTime}</span>
                            <span>${restaurant.deliveryFee} delivery</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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

                    {restaurants
                      .find((r) => r.id === selectedRestaurant)
                      ?.categories.map((category) => {
                        const categoryItems = menuItems.filter(
                          (item) => item.restaurantId === selectedRestaurant && item.category === category,
                        )

                        if (categoryItems.length === 0) return null

                        return (
                          <div key={category} className="mb-8">
                            <h3 className="text-xl font-semibold mb-4">{category}</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                              {categoryItems.map((item) => (
                                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                                  <div className="flex">
                                    <div className="flex-1 p-4">
                                      <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold">{item.name}</h3>
                                        {item.popular && (
                                          <Badge variant="secondary" className="text-xs">
                                            Popular
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-muted-foreground text-sm mb-3">{item.description}</p>
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-lg">${item.price}</span>
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
