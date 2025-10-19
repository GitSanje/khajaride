"use client"

import { useState } from "react"
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
  Filter,
  Heart,
  Truck,
  CreditCard,
  Loader2,
  RefreshCw,
  Store,
} from "lucide-react"
import { useGetAllVendors, type TGetVendorsQuery } from "@/api/hooks"

import { Link, useNavigate } from "react-router-dom"; 
import Header from "@/components/layouts/header"



export default function CustomerApp() {

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


  return (
    <div className="min-h-screen bg-background">
     
      <Header/>
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
                            <Link to={`/khajaride/vendor/${restaurant.id}`}>

            
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

         
        </div>
      </div>

        
    </div>
  )
}
