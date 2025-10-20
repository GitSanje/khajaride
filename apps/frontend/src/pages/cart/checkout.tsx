"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, MapPin, CreditCard, Wallet, Gift, Clock, ShoppingCart } from "lucide-react"

import { Trash2 } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { Link } from "react-router-dom"

export default function CheckoutPage() {
  const { cart, removeFromCart } = useCart()
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [loyaltyPoints] = useState(1250)
  const [usePoints, setUsePoints] = useState(false)

  const subtotal = cart?.reduce((sum, vendor) => sum + vendor.subtotal, 0)
  const deliveryFee = cart?.totalDeliveryFee
  const tax = cart?.totalVAT
  const pointsDiscount = usePoints ? Math.min(loyaltyPoints * 0.01, subtotal * 0.2) : 0
  const total = cart?.grandTotal - pointsDiscount

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">K</span>
              </div>
              <span className="text-xl font-bold text-foreground">KhajaRide</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" placeholder="123 Main Street" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="New York" />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input id="zipCode" placeholder="10001" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+1 (555) 123-4567" />
                  </div>
                  <div>
                    <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
                    <Textarea id="instructions" placeholder="Leave at door, ring bell, etc." />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                        <CreditCard className="w-4 h-4" />
                        Credit/Debit Card
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="wallet" id="wallet" />
                      <Label htmlFor="wallet" className="flex items-center gap-2 cursor-pointer">
                        <Wallet className="w-4 h-4" />
                        Digital Wallet
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "card" && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input id="expiry" placeholder="MM/YY" />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input id="cvv" placeholder="123" />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Loyalty Points */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Loyalty Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                    <div>
                      <p className="font-medium">Available Points: {loyaltyPoints}</p>
                      <p className="text-sm text-muted-foreground">
                        Use points to get up to ${Math.min(loyaltyPoints * 0.01, subtotal * 0.2).toFixed(2)} off
                      </p>
                    </div>
                    <Button variant={usePoints ? "default" : "outline"} onClick={() => setUsePoints(!usePoints)}>
                      {usePoints ? "Using Points" : "Use Points"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.cartVendors.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Your cart is empty</p>
                    </div>
                  ) : (
                    <>
                      {/* Items grouped by vendor */}
                      <div className="space-y-4">
                        {cart.cartVendors.map((vendor) => (
                          <div key={vendor.id} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-sm">{vendor.vendorName}</h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeVendor(vendor.vendorId)}
                                className="h-6 w-6 p-0"
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>

                            {/* Vendor items */}
                            <div className="space-y-1 text-sm">
                              {vendor.cartItems.map((item) => (
                                <div key={item.id} className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">
                                    {item.quantity}x {item.menuItemId}
                                  </span>
                                  <span>{item.subtotal.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>

                            {/* Vendor breakdown */}
                            <div className="border-t pt-2 space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{vendor.subtotal.toFixed(2)}</span>
                              </div>
                              {vendor.deliveryCharge > 0 && (
                                <div className="flex justify-between">
                                  <span>Delivery</span>
                                  <span>{vendor.deliveryCharge.toFixed(2)}</span>
                                </div>
                              )}
                              {vendor.vendorServiceCharge > 0 && (
                                <div className="flex justify-between">
                                  <span>Service Charge</span>
                                  <span>{vendor.vendorServiceCharge.toFixed(2)}</span>
                                </div>
                              )}
                              {vendor.vat > 0 && (
                                <div className="flex justify-between">
                                  <span>VAT</span>
                                  <span>{vendor.vat.toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-semibold border-t pt-1">
                                <span>Total</span>
                                <span>{vendor.total.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      {/* Grand totals */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>{subtotal?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Fee</span>
                          <span>{deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax</span>
                          <span>{tax.toFixed(2)}</span>
                        </div>
                        {usePoints && (
                          <div className="flex justify-between text-green-600">
                            <span>Points Discount</span>
                            <span>-{pointsDiscount.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{total.toFixed(2)}</span>
                      </div>

                      {/* Estimated Delivery */}
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Estimated delivery: 25-30 min</span>
                      </div>

                      <Button className="w-full" size="lg">
                        Place Order
                      </Button>
                    </>
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
