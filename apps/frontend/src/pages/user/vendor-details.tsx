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
} from "lucide-react"
import { Link, useParams } from "react-router-dom"

import {
    type Vendor as FoodmanduRestaurant,
    type MenuItem as FoodmanduMenuItem,
    type MenuCategory as FoodmanduMenuCategory,
} from "@/types"

import { convertFoodmanduMenuCategory, convertFoodmanduMenuItem, convertFoodmanduRestaurant } from "@/lib/utils"
// Mock data function for restaurant details
const getMockRestaurantData = (restaurantId: string) => {
    const mockRestaurants = [
        {
            Id: 989,
            Name: "Italian Pizza & Pasta",
            VendorShortCut: "Italian Pizza & Pasta",
            ShortName: "Italian Pizza & Pasta",
            Address1: "1017 South Jackson Street, Seattle, WA",
            Address2: "Seattle, WA 98104",
            LocationLat: 27.704017,
            LocationLng: 85.322399,
            OpeningHours: "Open 24 Hours",
            IsVendorClosed: false,
            AcceptsTakeoutOrder: true,
            AcceptsDeliveryOrder: true,
            Cuisine: "Italian",
            CuisineTags: "Italian | Pizza | Pasta | Fast Food",
            VendorType: "Restaurant",
            IsFeaturedVendor: true,
            VendorListingWebImageName: "/bustling-pizza-restaurant.png",
            VendorLogoImageName: "/bustling-pizza-restaurant.png",
            Distance: 0.1,
            VendorRating: 2.6,
            DeliveryCharge: { charge: "Rs. 0" },
            MinimumOrderAmount: 20.0,
        },
    ]

    const mockMenuData = [
        {
            category: "Picked for you",
            categoryId: 40529,
            categoryDesc: "Our most popular items",
            totalItems: 4,
            hidden: false,
            items: [
                {
                    productId: 353621,
                    name: "Thin Crust Cheese and Pepperoni Pizza (Medium)",
                    price: 18.99,
                    oldprice: 0.0,
                    productDesc:
                        "Our famous thin-crust pizza is renowned across the city. Our made-from-scratch dough is hand-tossed daily.",
                    ProductImage: "/pepperoni-pizza.png",
                    IsFavouriteProduct: true,
                    tags: "popular,pizza,cheese",
                    itemDisplayTag: "#1 most liked",
                    type: "product",
                    Keyword: "Thin Crust Cheese and Pepperoni Pizza,Picked for you,",
                },
                {
                    productId: 353622,
                    name: "Bottoms Up Chicken Bites",
                    price: 18.95,
                    oldprice: 0.0,
                    productDesc: "Our famous ten-piece, boneless bottoms-up chicken bites. Choose your sauce.",
                    ProductImage: "/crispy-chicken-burger.png",
                    IsFavouriteProduct: false,
                    tags: "chicken,popular,appetizer",
                    itemDisplayTag: "#2 most liked",
                    type: "product",
                    Keyword: "Bottoms Up Chicken Bites,Picked for you,",
                },
                {
                    productId: 353623,
                    name: "Build Your Own Pasta",
                    price: 14.95,
                    oldprice: 0.0,
                    productDesc: "Choose from one of our many kinds of pasta, and pick any sauce and fresh ingredients.",
                    ProductImage: "/chicken-alfredo-pasta.png",
                    IsFavouriteProduct: false,
                    tags: "pasta,customizable",
                    itemDisplayTag: "",
                    type: "product",
                    Keyword: "Build Your Own Pasta,Picked for you,",
                },
                {
                    productId: 353624,
                    name: "Chicken Penne Pasta",
                    price: 19.95,
                    oldprice: 0.0,
                    productDesc: "A staple Italian dish did the piano's way. Enjoy a tender breaded chicken breast.",
                    ProductImage: "/chicken-alfredo-pasta.png",
                    IsFavouriteProduct: false,
                    tags: "pasta,chicken",
                    itemDisplayTag: "",
                    type: "product",
                    Keyword: "Chicken Penne Pasta,Picked for you,",
                },
            ],
        },
        {
            category: "Appetizers",
            categoryId: 40530,
            categoryDesc: "Start your meal right",
            totalItems: 3,
            hidden: false,
            items: [
                {
                    productId: 353700,
                    name: "Garlic Bread",
                    price: 8.99,
                    oldprice: 0.0,
                    productDesc: "Fresh baked bread with garlic butter and herbs",
                    ProductImage: "/margherita-pizza.png",
                    IsFavouriteProduct: false,
                    tags: "bread,garlic,appetizer",
                    itemDisplayTag: "",
                    type: "product",
                    Keyword: "Garlic Bread,Appetizers,",
                },
            ],
        },
        {
            category: "Soups & Salads",
            categoryId: 40531,
            categoryDesc: "Fresh and healthy options",
            totalItems: 2,
            hidden: false,
            items: [
                {
                    productId: 353800,
                    name: "Caesar Salad",
                    price: 12.99,
                    oldprice: 0.0,
                    productDesc: "Crisp romaine lettuce with parmesan cheese and croutons",
                    ProductImage: "/margherita-pizza.png",
                    IsFavouriteProduct: false,
                    tags: "salad,healthy,vegetarian",
                    itemDisplayTag: "",
                    type: "product",
                    Keyword: "Caesar Salad,Soups & Salads,",
                },
            ],
        },
        {
            category: "Thin Crust Pizza",
            categoryId: 40532,
            categoryDesc: "Our signature thin crust pizzas",
            totalItems: 5,
            hidden: false,
            items: [
                {
                    productId: 353900,
                    name: "Margherita Pizza",
                    price: 16.99,
                    oldprice: 0.0,
                    productDesc: "Fresh mozzarella, tomato sauce, and basil",
                    ProductImage: "/margherita-pizza.png",
                    IsFavouriteProduct: true,
                    tags: "pizza,vegetarian,classic",
                    itemDisplayTag: "",
                    type: "product",
                    Keyword: "Margherita Pizza,Thin Crust Pizza,",
                },
            ],
        },
        {
            category: "Deep Dish Pizza",
            categoryId: 40533,
            categoryDesc: "Chicago-style deep dish pizzas",
            totalItems: 4,
            hidden: false,
            items: [
                {
                    productId: 354000,
                    name: "Deep Dish Veggie Special Pizza (Large)",
                    price: 23.99,
                    oldprice: 0.0,
                    productDesc: "Vegetarian. The same recipe was used.",
                    ProductImage: "/margherita-pizza.png",
                    IsFavouriteProduct: false,
                    tags: "pizza,vegetarian,large",
                    itemDisplayTag: "",
                    type: "product",
                    Keyword: "Deep Dish Veggie Special Pizza,Deep Dish Pizza,",
                },
            ],
        },
        {
            category: "Individual Deep Dish Pizza",
            categoryId: 40534,
            categoryDesc: "Personal sized deep dish pizzas",
            totalItems: 3,
            hidden: false,
            items: [],
        },
        {
            category: "Pastas and Italian Entrees",
            categoryId: 40535,
            categoryDesc: "Authentic Italian pasta dishes",
            totalItems: 6,
            hidden: false,
            items: [],
        },
        {
            category: "Italian Chicken Dinners",
            categoryId: 40536,
            categoryDesc: "Hearty chicken dishes",
            totalItems: 4,
            hidden: false,
            items: [],
        },
        {
            category: "Sandwiches",
            categoryId: 40537,
            categoryDesc: "Fresh made sandwiches",
            totalItems: 5,
            hidden: false,
            items: [],
        },
        {
            category: "Drinks",
            categoryId: 40538,
            categoryDesc: "Beverages and refreshments",
            totalItems: 8,
            hidden: false,
            items: [],
        },
        {
            category: "Side Dishes",
            categoryId: 40539,
            categoryDesc: "Perfect sides for your meal",
            totalItems: 6,
            hidden: false,
            items: [],
        },
    ]

    const restaurant = mockRestaurants.find((r) => r.Id.toString() === restaurantId) || mockRestaurants[0]
    const menuData = mockMenuData // Declare menuData variable
    return { restaurant, menuData }
}

export default function VendorMenuPage() {
    const params = useParams<{ vendorId: string }>();
    const restaurantId = params.vendorId as string
    console.log(restaurantId, 'restaurantId');

    const [restaurant, setRestaurant] = useState<FoodmanduRestaurant | null>(null)
    const [menuCategories, setMenuCategories] = useState<FoodmanduMenuCategory[]>([])
    const [menuItems, setMenuItems] = useState<FoodmanduMenuItem[]>([])
    const [cart, setCart] = useState<Array<{ id: string; name: string; price: number; quantity: number }>>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [activeCategory, setActiveCategory] = useState<string>("")
    const [loading, setLoading] = useState(true)
    const [loyaltyPoints] = useState(1250)

    useEffect(() => {
        loadRestaurantData()
    }, [restaurantId])

    const loadRestaurantData = async () => {
        setLoading(true)
        try {
            const { restaurant: mockRestaurant, menuData } = getMockRestaurantData(restaurantId)
            const convertedRestaurant = convertFoodmanduRestaurant(mockRestaurant)
            const categories = menuData.map((cat, index) => convertFoodmanduMenuCategory(cat, restaurantId, index))
            const items = menuData.flatMap((cat) =>
                cat.items.map((item) => convertFoodmanduMenuItem(item, restaurantId, cat.categoryId.toString())),
            )

            setRestaurant(convertedRestaurant)
            setMenuCategories(categories)
            setMenuItems(items)
            setActiveCategory(categories[0]?.id || "")
        } catch (error) {
            console.error("[v0] Error loading restaurant data:", error)
        } finally {
            setLoading(false)
        }
    }

    const addToCart = (item: FoodmanduMenuItem) => {
        setCart((prev) => {
            const existing = prev.find((cartItem) => cartItem.id === item.id)
            if (existing) {
                return prev.map((cartItem) =>
                    cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
                )
            }
            return [...prev, { id: item.id, name: item.name, price: item.base_price, quantity: 1 }]
        })
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

    const getItemQuantity = (itemId: string) => {
        return cart.find((item) => item.id === itemId)?.quantity || 0
    }

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Loading restaurant menu...</span>
                </div>
            </div>
        )
    }

    if (!restaurant) {
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
                            <Link to="/app" className="flex items-center gap-2">
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
                    src={restaurant.vendor_listing_image_name || "/placeholder.svg?height=256&width=800&query=restaurant food"}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-medium">{restaurant.rating.toFixed(1)}</span>
                                    <span className="text-white/80">(68)</span>
                                </div>
                                <span>•</span>
                                <span>{restaurant.cuisine}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {restaurant.address}
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
                                        placeholder={`Search in ${restaurant.name}`}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Menu Categories */}
                            <div className="space-y-1">
                                <h3 className="font-semibold text-sm text-muted-foreground mb-2 uppercase tracking-wide">
                                    {restaurant.name} MENU
                                </h3>
                                <p className="text-xs text-muted-foreground mb-4">Open 24 Hours</p>
                                {menuCategories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setActiveCategory(category.id)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === category.id
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
                        <div className="mb-8">
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
                        </div>

                        {/* Rating and Reviews */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold">Rating and reviews</h2>
                                <Button variant="outline" size="sm">
                                    See more
                                </Button>
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="text-4xl font-bold">{restaurant.rating.toFixed(1)}</div>
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-4 h-4 ${star <= Math.floor(restaurant.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
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
                        {menuCategories.map((category) => {
                            const categoryItems = menuItems.filter((item) => item.category_id === category.id)
                            if (categoryItems.length === 0) return null

                            return (
                                <div key={category.id} id={category.id} className="mb-8">
                                    <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
                                    <div className="space-y-4">
                                        {categoryItems.map((item) => (
                                            <Card key={item.id} className="hover:shadow-lg transition-shadow">
                                                <CardContent className="p-0">
                                                    <div className="flex">
                                                        <div className="flex-1 p-6">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <h3 className="font-semibold text-lg">{item.name}</h3>
                                                                {item.display_tag && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {item.display_tag}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="font-bold text-lg">${item.base_price}</span>
                                                                {item.old_price > 0 && (
                                                                    <span className="text-sm text-muted-foreground line-through">${item.old_price}</span>
                                                                )}
                                                            </div>
                                                            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{item.description}</p>
                                                            {(item.tags ?? []).length > 0 && (
                                                                <div className="flex gap-1 mb-4 flex-wrap">
                                                                    {(item.tags ?? []).slice(0, 3).map((tag: any) => (
                                                                        <Badge key={tag} variant="outline" className="text-xs">
                                                                            {tag}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    {getItemQuantity(item.id) > 0 && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => removeFromCart(item.id)}
                                                                            className="h-8 w-8 p-0"
                                                                        >
                                                                            <Minus className="w-3 h-3" />
                                                                        </Button>
                                                                    )}
                                                                    {getItemQuantity(item.id) > 0 && (
                                                                        <span className="w-8 text-center font-medium">{getItemQuantity(item.id)}</span>
                                                                    )}
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => addToCart(item)}
                                                                        className="h-8 w-8 p-0 rounded-full"
                                                                    >
                                                                        <Plus className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="w-32 h-32 m-4">
                                                            <img
                                                                src={item.image || "/placeholder.svg?height=128&width=128&query=food dish"}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover rounded-lg"
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
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

                                    {cart.length === 0 ? (
                                        <div className="text-center py-8">
                                            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                            <p className="text-muted-foreground text-sm">Your cart is empty</p>
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
                                                        <Button size="sm" onClick={() => addToCart({ ...item, id: item.id } as any)}>
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
                                                    <span>$0.00</span>
                                                </div>
                                                <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                                                    <span>Total</span>
                                                    <span>${cartTotal.toFixed(2)}</span>
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
        </div>
    )
}
