"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

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
  
    Info,
    Share2,
    Loader2,
   
} from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { useGetVenoorById } from "@/api/hooks/use-vendor-query"
import type { TMenuItem } from "@khajaride/zod"
import { AddToCartModal } from "../cart/add-to-cart"
import Header from "@customer/layouts/header";


export default function VendorMenuPage() {
    const params = useParams<{ vendorId: string }>();
    const vendorId = params.vendorId as string


    const [searchQuery, setSearchQuery] = useState("")
    const [activeCategory, setActiveCategory] = useState<string>("")
    
    const { data: vendor , isLoading } = useGetVenoorById({
        id: vendorId
    })

   
    const [selectedItem, setSelectedItem] = useState<TMenuItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)



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
             <Header/>

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
