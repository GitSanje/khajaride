"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Store, Plus, Minus, X, Gift, ChevronDown, ChevronUp } from "lucide-react"
import { Link } from "react-router-dom"
import { useCart } from "@/hooks/use-cart"
import { useAddJustCartItemQuantity, useDeleteCartItem } from "@/api/hooks/use-cart-query"


interface CartSidebarProps {
    isOpen: boolean
    onClose: () => void
}

export function CartSidebar({
    isOpen,
    onClose,
}: CartSidebarProps) {


    const {

        cart: cartVendors,
        loyaltyPoints,
        addToCart: onAddItem,
        removeFromCart: onRemoveItem,
        calcs
    } = useCart();

    const {
        cartTotal,
        GrandTotal,
        TotalDelivery,
        OverallSubtotal

    } = calcs



    const [expandedVendors, setExpandedVendors] = useState<Set<string>>(
        new Set(cartVendors?.map((v) => v.vendorId)),
    )

    const toggleVendor = (vendorId: string) => {
        const newExpanded = new Set(expandedVendors)
        if (newExpanded.has(vendorId)) {
            newExpanded.delete(vendorId)
        } else {
            newExpanded.add(vendorId)
        }
        setExpandedVendors(newExpanded)
    }

    const adjustQuantityMutation  = useAddJustCartItemQuantity()
    const deleteCartItemMutation  = useDeleteCartItem()

    return (
        <>
            {/* Backdrop */}
            {isOpen &&
                <div className="fixed inset-0 bg-black/50 z-40 " onClick={onClose} />}

            {/* Sidebar */}
            <div
                className={`fixed right-0 top-0 h-screen w-full sm:w-96 bg-background border-l border-border z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        <h3 className="font-semibold">Your Cart</h3>
                        {cartTotal && cartTotal > 0 && <Badge variant="secondary">{cartTotal}</Badge>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="p-4">
                    {cartVendors?.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground text-sm">Your cart is empty</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Vendor Groups */}
                            {cartVendors?.map((cartVendor) => {
                                const isExpanded = expandedVendors.has(cartVendor.vendorId)

                                return (
                                    <div key={cartVendor.vendorId} className="border border-border rounded-lg overflow-hidden">
                                        {/* Vendor Header - Collapsible */}
                                        <button
                                            onClick={() => toggleVendor(cartVendor.vendorId)}
                                            className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-2 flex-1 text-left">
                                                <Store className="w-4 h-4 text-primary flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <h4 className="font-semibold text-sm truncate">{cartVendor.vendor.name}</h4>
                                                    {/* {cartVendor.vendor.streetAddress && (
                                                        <p className="text-xs text-muted-foreground truncate">{cartVendor.vendor.streetAddress}</p>
                                                    )} */}

                                                </div>
                                                <Badge variant="outline" className="ml-auto flex-shrink-0">
                                                    {cartVendor.cartItems.length} items
                                                </Badge>
                                            </div>
                                            {isExpanded ? (
                                                <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                            )}
                                        </button>

                                        {/* Vendor Content - Collapsible */}
                                        {isExpanded && (
                                            <>
                                                {/* Cart Items */}
                                                <div className="border-t border-border p-3 space-y-3 bg-muted/30">
                                                    {cartVendor.cartItems.map(({ cartItem, menuItem }) => (
                                                        <div key={cartItem.id} className="flex justify-between items-start gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-medium text-sm truncate">{menuItem.name}</h4>
                                                                <p className="text-muted-foreground text-xs">
                                                                    Rs. {cartItem.unitPrice.toFixed(2)} each
                                                                </p>
                                                                {cartItem.specialInstructions && (
                                                                    <p className="text-xs text-muted-foreground italic mt-1">
                                                                        Note: {cartItem.specialInstructions}
                                                                    </p>
                                                                )}
                                                                {cartItem.discountAmount > 0 && (
                                                                    <p className="text-xs text-green-600">
                                                                        -Rs. {cartItem.discountAmount.toFixed(2)} discount
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                                {/* Decrease Quantity */}
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-7 w-7 p-0 bg-transparent"
                                                                    onClick={() =>
                                                                        adjustQuantityMutation.mutateAsync({
                                                                            body: { cartVendorId: cartVendor.id, menuItemId: menuItem.id, delta: -1 }
                                                                        })
                                                                    }
                                                                >
                                                                    <Minus className="w-3 h-3" />
                                                                </Button>

                                                                {/* Quantity Display */}
                                                                <span className="w-6 text-center text-sm font-medium">{cartItem.quantity}</span>

                                                                {/* Increase Quantity */}
                                                                <Button
                                                                    size="sm"
                                                                    className="h-7 w-7 p-0"
                                                                    onClick={() =>
                                                                        adjustQuantityMutation.mutateAsync({
                                                                            body: { cartVendorId: cartVendor.id, menuItemId: menuItem.id, delta: 1 }
                                                                        })
                                                                    }
                                                                >
                                                                    <Plus className="w-3 h-3" />
                                                                </Button>

                                                                {/* Delete Item */}
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="ml-2 p-1"
                                                                    onClick={() => deleteCartItemMutation.mutateAsync({ cartId: cartItem.id })}
                                                                >
                                                                    <X className="w-3 h-3 text-red-500" />
                                                                </Button>
                                                            </div>

                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Vendor Totals */}
                                                <div className="border-t border-border p-3 bg-muted/20 space-y-1 text-xs">
                                                    <div className="flex justify-between items-center">
                                                        <span>Subtotal</span>
                                                        <span>Rs. {cartVendor.subtotal?.toFixed(2)}</span>
                                                    </div>
                                                    {cartVendor.vendorDiscount > 0 && (
                                                        <div className="flex justify-between items-center text-green-600">
                                                            <span>Vendor Discount</span>
                                                            <span>-Rs. {cartVendor.vendorDiscount}</span>
                                                        </div>
                                                    )}
                                                    {cartVendor.vendorServiceCharge  && (
                                                        <div className="flex justify-between items-center">
                                                            <span>Service Charge</span>
                                                            <span>Rs. {cartVendor.vendorServiceCharge}</span>
                                                        </div>
                                                    )}
                                                    {cartVendor.vat  && (
                                                        <div className="flex justify-between items-center">
                                                            <span>VAT</span>
                                                            <span>Rs. {cartVendor.vat}</span>
                                                        </div>
                                                    )}
                                                    {cartVendor.deliveryCharge  && cartVendor.deliveryCharge > 0 && (
                                                        <div className="flex justify-between items-center">
                                                            <span>Delivery</span>
                                                            <span>Rs. {cartVendor.deliveryCharge}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between items-center font-semibold text-sm pt-1 border-t border-border">
                                                        <span>Vendor Total</span>
                                                        <span>Rs. {cartVendor.total?.toFixed(2)}</span>
                                                    </div>
                                                </div>

                                                            {/* Checkout Button */}
                                                <Link to={`/khajaride/checkout/${cartVendor.id}`} className="block">
                                                    <Button className="w-full" size="lg">
                                                        Go to Checkout
                                                    </Button>
                                                </Link>         
                                            </>
                                        )}
                                    </div>
                                )
                            })}

                            {/* Overall Cart Summary */}
                            <div className="border-t border-border pt-4 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span>Subtotal</span>
                                    <span>Rs. {OverallSubtotal?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span>Total Delivery</span>
                                    <span>Rs. {TotalDelivery?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center font-bold text-lg border-t border-border pt-2">
                                    <span>Grand Total</span>
                                    <span>Rs. {GrandTotal?.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Loyalty Points */}
                            <div className="bg-primary/10 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Gift className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-medium">Loyalty Points</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    You have {loyaltyPoints} points. Earn {Math.floor(GrandTotal!)} more points with this order!
                                </p>
                            </div>
                           

                           
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
