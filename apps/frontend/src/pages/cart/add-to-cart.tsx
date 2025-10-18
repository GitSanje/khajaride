"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Plus, Minus } from "lucide-react"
import { toast } from "sonner"
import type { TMenuItem } from "@khajaride/zod"
import { useRestaurants } from "@/hooks/use-restaturants"
import type { TAddCartItem } from "@/types/cart-types"

interface AddToCartModalProps {
  item: TMenuItem | null
  isOpen: boolean
  onClose: () => void
}

export function AddToCartModal({ item, isOpen, onClose }: AddToCartModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [isFavorite, setIsFavorite] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { addToCart } = useRestaurants()

  if (!item) return null

  const totalPrice = item.basePrice * quantity

  const handleAddToCart = () => {
    if (!item) return

    const payload: TAddCartItem = {
      vendorId: item.vendorId,
      id: item.id,
      quantity,
      basePrice: item.basePrice,
      specialInstructions: specialInstructions || undefined,
    }

    startTransition(async () => {
      const result = await addToCart(payload)
      if (result) {
        toast.success("Added to cart!")
        setQuantity(1)
        setSpecialInstructions("")
        onClose()
      } else {
        toast.error("Failed to add item to cart.")
      }
    })
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setQuantity(1)
      setSpecialInstructions("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between">
            <DialogTitle className="text-2xl font-light">{item.name}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Price + Favorite */}
          <div className="flex items-center justify-between">
            <div className="text-2xl font-semibold text-foreground">
              Rs. {item.basePrice.toFixed(2)}
            </div>
            <button
              onClick={() => setIsFavorite((prev) => !prev)}
              className={`p-2 border rounded-lg transition-colors ${
                isFavorite ? "border-red-400 bg-red-50" : "border-border hover:bg-muted"
              }`}
              aria-label="Toggle favorite"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
                }`}
              />
            </button>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="text-sm font-semibold mb-2 block uppercase tracking-wide">
              Special Instructions
            </label>
            <Textarea
              placeholder="Add notes..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="min-h-24 resize-none"
            />
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-primary rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2 hover:bg-muted text-primary transition-colors"
                disabled={isPending}
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="px-4 py-2 font-medium text-center min-w-12">{quantity}</div>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-2 hover:bg-muted text-primary transition-colors"
                disabled={isPending}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={isPending}
            className={`w-full bg-green-400 hover:bg-green-500 text-black font-bold py-3 text-lg rounded-lg transition-colors ${
              isPending ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isPending ? "Adding..." : "Add to Cart"}
            <span className="ml-2">Rs. {totalPrice.toFixed(2)}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
