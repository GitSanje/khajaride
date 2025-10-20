
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {

  MapPin,
  ShoppingCart,
  User,
  Gift,
} from "lucide-react"
import { Link } from "react-router-dom"
import { useCart } from "@/hooks/use-cart"
import { CartSidebar } from "@/pages/cart/cart-ui"


export default function Header() {

    const [isCartOpen, setIsCartOpen] = useState(false)


    const { 
        
        calcs,
        loyaltyPoints,
       } = useCart();

          const { cartItemCount}=  calcs
    return(

        <>
          {/* Header */}
               <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                 <div className="container mx-auto px-4 py-4">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                       <Link to="/khajaride" className="flex items-center gap-2">
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
         
                     <div className="flex items-center gap-4 relative">
                       {/* Loyalty Points */}
                       <div className="hidden sm:flex items-center gap-2 bg-primary/10 rounded-lg px-3 py-2">
                         <Gift className="w-4 h-4 text-primary" />
                         <span className="text-sm font-medium text-primary">{loyaltyPoints} pts</span>
                       </div>
         
         
                       {/* Cart */}
                         <Button
                         variant="outline"
                         size="sm"
                         className="relative bg-transparent"
                         onClick={() => setIsCartOpen(!isCartOpen)}
                       >
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
                  <CartSidebar
                        isOpen={isCartOpen}
                        onClose={() => setIsCartOpen(false)}
                    
                    />


               </header>
        
        </>
    )
}