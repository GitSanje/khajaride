import { createContext, useContext, useEffect, useState } from "react";

import mockRestaurants from "@/data/foodmandu_all_restaurants.json"
import mockMenuData from "@/data/foodmandu_all_menu_items.json"
import { convertFoodmanduMenuCategory, convertFoodmanduMenuData, convertFoodmanduRestaurant } from "@/lib/utils"
import type { MenuCategory, MenuData, MenuItem, Vendor } from "@/types";



interface RestaurantDataContextValue {
  restaurants: Vendor[]
  loading: boolean
  selectedRestaurant: string | null
  menuCategories: MenuCategory[]
  menuItems: MenuItem[]
  cart: any[]
  loyaltyPoints: number

  // actions
    setRestaurants: React.Dispatch<React.SetStateAction<Vendor[]>>
  loadRestaurants: () => Promise<void>
  selectRestaurant: (restaurantId: string) => void
  addToCart: (item: MenuItem) => void
  removeFromCart: (itemId: string) => void
}


const RestaurantDataContext = createContext<RestaurantDataContextValue | null>(null);
interface RestaurantDataProviderProps {
  children: React.ReactNode;
}


export const RestaurantsDataProvider = ({ children }: RestaurantDataProviderProps) => {

  const [restaurants, setRestaurants] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null)
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<Array<{ id: string; name: string; price: number; quantity: number }>>([])
 
  const [loyaltyPoints] = useState(1250)

   const getMockFoodmanduData = () => {
      const restaurant_ids: number[] = []
      const restaurants: Vendor[] = []
       const seenIds = new Set<number>() 
      Object.values(mockRestaurants).forEach((restaurantList) => {
          restaurantList.forEach((restaurant) => {
    
          if (!seenIds.has(restaurant.Id)) {
            restaurant_ids.push(restaurant.Id)
            restaurants.push(convertFoodmanduRestaurant(restaurant as any))
            seenIds.add(restaurant.Id) 
          }
          })
        })
      const menuData: MenuData[] = []
        Object.entries(mockMenuData).forEach(([vendor_id, menuList]) => {
        menuList.forEach((menuItem: any) => {
          menuData.push(convertFoodmanduMenuData(menuItem, vendor_id))
        })
      })
    
      return { restaurants, restaurant_ids, menuData }
    }

   useEffect(() => {
    loadRestaurants()
    }, [])

  const loadRestaurants = async () => {
    setLoading(true)
    console.log("[v0] Loading restaurants with Foodmandu data structure...")

    try {
      const { restaurants: mockRestaurants  } = getMockFoodmanduData()

      console.log("[v0] Loaded restaurants from Foodmandu format:", mockRestaurants.length)
      setRestaurants(mockRestaurants)
    } catch (error) {
      console.error("[v0] Error loading restaurants:", error)
      setRestaurants([])
    } finally {
      setLoading(false)
    }
  }
  

 

  const selectRestaurant = (restaurantId: string) => {
    setSelectedRestaurant(restaurantId)
    const restaurant = restaurants.find((r) => r.id === restaurantId)
    if (restaurant) {
      console.log("[v0] Loading menu for restaurant:", restaurant.name)
      console.log(restaurantId,'restaurantId');
      
      const { menuData } = getMockFoodmanduData()
      const categories = menuData.map((cat) => cat.vendor_id === restaurantId ? convertFoodmanduMenuCategory(cat, cat.vendor_id) : null).filter(Boolean) as MenuCategory[]
      const items = menuData.flatMap((cat) =>
        cat.vendor_id === restaurantId ? cat.items : null,
      ).filter(Boolean) as MenuItem[]
      setMenuCategories(categories)
      setMenuItems(items)
         console.log(items[0],'menuItems');
   
    
     
    }
  }

  const addToCart = (item: MenuItem) => {
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

  const contextValue = {
    restaurants,
    loading,
    selectedRestaurant,
    menuCategories,
    menuItems,
    cart,
    loyaltyPoints,
    //actions
    setRestaurants,
    loadRestaurants,
    selectRestaurant,
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
