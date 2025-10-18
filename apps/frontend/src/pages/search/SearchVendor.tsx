"use client"

import type React from "react"

import { useState, Suspense, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Star, ShoppingCart, User, Gift, ChevronDown, SlidersHorizontal, X } from "lucide-react"
import Link from "next/link"
import type { SearchFilters } from "@/types/elasticsearch-types"
import type { TVendorMenuSearchRes, TVendorSearchRes } from "@khajaride/zod"

import { useGetSearchQuery } from "@/api/hooks/use-search-query"
import { useNavigate, useSearchParams } from "react-router-dom"
import { VendorMap } from "../vendor/vendor-map"


function SearchPageContent() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  console.log(searchParams);

  const initialQuery = searchParams.get("q") || ""

  const [searchQuery, setSearchQuery] = useState(initialQuery)
 
  const [activeCategory, setActiveCategory] = useState("all")
  const [loyaltyPoints] = useState(1250)
  const [cartItemCount] = useState(3)

  const [lastSort, setLastSort] = useState<number[]>([])
  // Filters state
  const [filters, setFilters] = useState<SearchFilters>({
    offers: false,
    deliveryFee: "any",
    rating: 0,
    dietary: [],
    sortBy: "relevance",
  })
 const [searchTerm, setSearchTerm] = useState(initialQuery);
  // const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: ESResponse, isLoading } = useGetSearchQuery({
    data: {
      query: searchTerm || "",
      page_size: 20,
      last_sort:lastSort
    }
  })
  

  const searchResults = ESResponse?.results || []
  const [showFilters, setShowFilters] = useState(false)
  const totalResults = ESResponse?.total || 0


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

     if (searchQuery.trim() !== "") {
    setLastSort([]);
    navigate(`/khajaride/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchTerm(searchQuery);
  }
     
  }

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    if (searchQuery) {
      // performSearch(searchQuery, category, filters)
    }
  }

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    if (searchQuery) {
      // performSearch(searchQuery, activeCategory, updatedFilters)
    }
  }

  const toggleDietaryFilter = (diet: "vegetarian" | "vegan" | "gluten_free") => {
    const current = filters.dietary || []
    const updated = current.includes(diet) ? current.filter((d) => d !== diet) : [...current, diet]
    handleFilterChange({ dietary: updated })
  }

  // Group results by vendor for restaurant view
  const groupedByVendor = searchResults.reduce(
    (acc, item) => {
      const vendorId = item.vendor.id
      if (!acc[vendorId]) {
        acc[vendorId] = {
          vendor: item.vendor as TVendorSearchRes,
          items: [],
        }
      }
      acc[vendorId].items.push(item as TVendorMenuSearchRes)
      return acc
    },
    {} as Record<string, { vendor: TVendorSearchRes; items: TVendorMenuSearchRes[] }>,
  )

  const vendorResults = Object.values(groupedByVendor)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Link href="/khajaride" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">K</span>
              </div>
              <span className="text-xl font-bold text-foreground hidden sm:inline">KhajaRide</span>
            </Link>

            {/* Search Bar */}
            <form  onSubmit= {handleSearch}className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search for restaurants, cuisines, or dishes..."
                  value={searchQuery}
                  // onKeyDown={handleKeyPress}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2"
                />
              </div>
            </form>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-2 bg-primary/10 rounded-lg px-3 py-2">
                <Gift className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">{loyaltyPoints} pts</span>
              </div>

              <Button variant="outline" size="sm" className="relative bg-transparent">
                <ShoppingCart className="w-4 h-4" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>

              <Button variant="outline" size="sm">
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-4 mb-4 border-b border-border">
          <button
            onClick={() => handleCategoryChange("all")}
            className={`pb-3 px-2 text-sm font-medium transition-colors ${activeCategory === "all"
              ? "text-foreground border-b-2 border-foreground"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            All
          </button>
          <button
            onClick={() => handleCategoryChange("restaurants")}
            className={`pb-3 px-2 text-sm font-medium transition-colors ${activeCategory === "restaurants"
              ? "text-foreground border-b-2 border-foreground"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Restaurants
          </button>
          <button
            onClick={() => handleCategoryChange("map")}
            className={`pb-3 px-2 text-sm font-medium transition-colors ${activeCategory === "map"
              ? "text-foreground border-b-2 border-foreground"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Map
          </button>
          
        </div>

        {/* Filters Bar */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={filters.offers ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange({ offers: !filters.offers })}
            className="flex-shrink-0"
          >
            Offers
          </Button>

          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="flex-shrink-0">
            Delivery fee
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>

          <Button
            variant={filters.deliveryTime ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange({ deliveryTime: filters.deliveryTime ? undefined : 30 })}
            className="flex-shrink-0"
          >
            Under 30 min
          </Button>

          <Button variant="outline" size="sm" className="flex-shrink-0 bg-transparent">
            Best overall
          </Button>

          <Button
            variant={filters.rating && filters.rating > 0 ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange({ rating: filters.rating ? 0 : 4 })}
            className="flex-shrink-0"
          >
            Rating
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>

          <Button variant="outline" size="sm" className="flex-shrink-0 bg-transparent">
            Price
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>

          <Button
            variant={filters.dietary && filters.dietary.length > 0 ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex-shrink-0"
          >
            Dietary
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>

          <Button variant="outline" size="sm" className="flex-shrink-0 bg-transparent">
            Sort
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>

          <Button variant="outline" size="sm" className="flex-shrink-0 bg-transparent">
            <SlidersHorizontal className="w-4 h-4 mr-1" />
            More filters
          </Button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Filters</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Delivery Fee</h4>
                  <div className="flex gap-2">
                    <Button
                      variant={filters.deliveryFee === "free" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange({ deliveryFee: "free" })}
                    >
                      Free
                    </Button>
                    <Button
                      variant={filters.deliveryFee === "low" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange({ deliveryFee: "low" })}
                    >
                      Under Rs. 50
                    </Button>
                    <Button
                      variant={filters.deliveryFee === "any" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange({ deliveryFee: "any" })}
                    >
                      Any
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Dietary Preferences</h4>
                  <div className="flex gap-2">
                    <Button
                      variant={filters.dietary?.includes("vegetarian") ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDietaryFilter("vegetarian")}
                    >
                      Vegetarian
                    </Button>
                    <Button
                      variant={filters.dietary?.includes("vegan") ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDietaryFilter("vegan")}
                    >
                      Vegan
                    </Button>
                    <Button
                      variant={filters.dietary?.includes("gluten_free") ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDietaryFilter("gluten_free")}
                    >
                      Gluten Free
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Sort By</h4>
                  <div className="flex gap-2">
                    <Button
                      variant={filters.sortBy === "relevance" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange({ sortBy: "relevance" })}
                    >
                      Relevance
                    </Button>
                    <Button
                      variant={filters.sortBy === "rating" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange({ sortBy: "rating" })}
                    >
                      Rating
                    </Button>
                    <Button
                      variant={filters.sortBy === "price" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange({ sortBy: "price" })}
                    >
                      Price
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Count */}
        {searchQuery && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              {totalResults} results for "{searchQuery}"
            </h2>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Searching...</p>
            </div>
          </div>
        )}

        {/* Results */}
        {!isLoading && searchResults.length > 0 && (
             <>
          {activeCategory === "map" ? (
              <VendorMap vendors={vendorResults} className="h-[600px] w-full" />
            ) :(
          <div className="space-y-6">

             
            {activeCategory === "restaurants" ? (
              // Restaurant grouped view
              vendorResults.map(({ vendor, items }) => (
                <Card key={vendor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Restaurant Image */}
                    <div className="relative md:col-span-1">
                      <img
                        src={vendor.vendor_listing_image_name ? vendor.vendor_listing_image_name : "/placeholder.svg"}
                        alt={vendor.name}
                        className="w-full h-full object-cover min-h-[200px]"
                      />
                    </div>

                    {/* Restaurant Info */}
                    <div className="md:col-span-2 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-bold mb-1">{vendor.name}</h3>
                          {vendor.promo_text && (
                            <Badge variant="secondary" className="mb-2">
                              Sponsored
                            </Badge>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <span>Rs. {vendor.delivery_fee} Delivery Fee</span>
                            <span>•</span>
                            <span>35 min</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 ml-4">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      {vendor.promo_text && (
                        <div className="bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-2 rounded-lg mb-3 text-sm">
                          {vendor.promo_text}
                        </div>
                      )}

                         <Link href={`/khajaride/vendor/${vendor.id}`}>
                          <Button variant="outline" size="sm">
                            View store
                          </Button>
                        </Link>

                      {/* Menu Items Preview */}
                      <div className="mt-4">
                        <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                          {items.map((item) => (
                            <div key={item.menu_id} className="flex-shrink-0 w-48">
                              <div className="border rounded-lg p-3 bg-background hover:bg-muted/50 transition-colors">
                                <div className="flex flex-col">
                                  <h4 className="font-medium text-sm mb-1">{item.menu_name}</h4>
                                  <p className="text-sm font-semibold text-foreground">Rs. {item.base_price}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              // Menu items view
              <div className="grid gap-4">
                {searchResults.map((item) => (
                  <Card key={item.menu_id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="relative md:col-span-1">
                        <img
                          src={item.vendor.vendor_listing_image_name ? item.vendor.vendor_listing_image_name : "/margherita-pizza.png"}

                          alt={item.menu_name}
                          className="w-full h-full object-cover min-h-[150px]"
                        />
                      </div>
                      <div className="md:col-span-3 p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <Link href={`/khajaride/vendor/${item.vendor.id}`} className="hover:underline">
                              <h3 className="text-lg font-bold mb-1">{item.vendor.name}</h3>
                            </Link>
                            <h4 className="font-semibold mb-1">{item.menu_name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{item.menu_description}</p>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs">
                                {item.category.name}
                              </Badge>
                              {item.is_vegetarian && (
                                <Badge variant="outline" className="text-xs">
                                  Vegetarian
                                </Badge>
                              )}
                              {item.is_popular && <Badge className="text-xs bg-green-500">#2 most liked</Badge>}
                            </div>
                            <p className="text-lg font-bold">Rs. {item.base_price}</p>
                          </div>
                          <Button size="sm">
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <Button
             onClick={() => setLastSort(ESResponse?.last_sort ?? [])}
            >
              Show More
            </Button>

            
          </div>)

          }
          </>
          
        )}

        {/* No Results */}
        {!isLoading && searchQuery && searchResults.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Button onClick={() => setSearchQuery("")}>Clear search</Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !initialQuery && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Start searching</h3>
            <p className="text-muted-foreground">Search for restaurants, cuisines, or dishes</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading search...</p>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  )
}
