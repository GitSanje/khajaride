"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Wallet,
  Clock,
  ShoppingCart,
  Trash2,
  Edit2,
  CheckCircle,
  ChevronRight,
  Building,
  User,
  Phone,
  Navigation,
  Currency,
} from "lucide-react"
import Link from "next/link"

import type { DeliveryAddressFormData } from "@/schemas/delivery-address-validation"
import { calculateDeliveryFee, calculateDistance, getEstimatedDeliveryTime } from "@/lib/delivery-fee-calculator"
import { useCart } from "@/hooks/use-cart"
import { DeliveryAddressModal } from "./delivery-address-model"
import { useParams } from "react-router-dom"

type CheckoutStep = "address" | "payment" | "confirm"

export default function CheckoutPage() {
  const params = useParams<{ cartVendorId: string }>()
  const cartVendorId = params.cartVendorId as string
  const { cart: cartVendors } = useCart()

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [loyaltyPoints] = useState(1250)
  const [usePoints, setUsePoints] = useState(false)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddressFormData | null>(null)

  const cartVendor = cartVendors?.filter(vendor => vendor.id === cartVendorId) || []
  
  const deliveryDistanceByVendor = useMemo(() => {
    if (!deliveryAddress || !cartVendor.length) return {}

    const distances: Record<string, number> = {}
    cartVendor.forEach((vendor) => {
      const vendorLat = vendor.vendorAddress.latitude || 0
      const vendorLng = vendor.vendorAddress.longitude || 0

      const distance = calculateDistance(
        vendorLat,
        vendorLng,
        deliveryAddress.latitude,
        deliveryAddress.longitude,
      )

      distances[vendor.vendorId] = distance
    })

    return distances
  }, [deliveryAddress, cartVendor])

  const subtotal = cartVendor.reduce((sum, vendor) => sum + (vendor.subtotal || 0), 0)
  const totalDeliveryDistance = Object.values(deliveryDistanceByVendor).reduce((sum, distance) => sum + distance, 0)
  const tax = cartVendor.reduce((sum, vendor) => sum + (vendor.vat || 0), 0)
  const pointsDiscount = usePoints ? Math.min(loyaltyPoints * 0.01, subtotal * 0.2) : 0
  const vendorTotal = cartVendor.reduce((sum, vendor) => sum + (vendor.total || 0), 0)
  const total = vendorTotal + calculateDeliveryFee(totalDeliveryDistance) - pointsDiscount

  const handleAddressSubmit = (data: DeliveryAddressFormData) => {
    setDeliveryAddress(data)
  }

  const handlePaymentContinue = () => {
    setCurrentStep("confirm")
  }

  const handlePlaceOrder = () => {
    console.log("Order placed:", {
      address: deliveryAddress,
      payment: paymentMethod,
      usePoints,
      total,
    })
  }

  const steps: { id: CheckoutStep; label: string; icon: React.ReactNode }[] = [
    { id: "address", label: "Delivery Address", icon: <MapPin className="w-5 h-5" /> },
    { id: "payment", label: "Payment", icon: <CreditCard className="w-5 h-5" /> },
    { id: "confirm", label: "Confirm Order", icon: <CheckCircle className="w-5 h-5" /> },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/khajaride">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">K</span>
                </div>
                <span className="text-2xl font-bold text-foreground">KhajaRide</span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Checkout</h1>
          <p className="text-lg text-muted-foreground mb-8">Complete your order in a few simple steps</p>

          {/* Progress Steps - Moved to top */}
          <div className="mb-12 bg-card rounded-2xl p-6 border-2 shadow-sm">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                      currentStep === step.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : steps.findIndex((s) => s.id === currentStep) > index
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.icon}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{step.label}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-4 rounded transition-all ${
                        steps.findIndex((s) => s.id === currentStep) > index ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content - Left Side */}
            <div className="lg:col-span-2 space-y-8">
              {/* Delivery Address Section - Always visible when address is saved */}
              {deliveryAddress && (
                <Card className="border-2 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl flex items-center justify-between">
                      <span className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-green-600" />
                        Delivery Address
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddressModalOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Change
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-green-600" />
                          <span className="font-semibold">{deliveryAddress.addressTitle}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-green-600" />
                          <span>
                            {deliveryAddress.firstName} {deliveryAddress.lastName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-green-600" />
                          <span>{deliveryAddress.mobileNumber}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm">
                          {deliveryAddress.streetAddress}, {deliveryAddress.city} {deliveryAddress.zipCode}
                        </p>
                        {deliveryAddress.detailedDirection && (
                          <div className="flex items-start gap-2 mt-2">
                            <Navigation className="w-4 h-4 text-green-600 mt-0.5" />
                            <p className="text-sm text-muted-foreground italic">
                              {deliveryAddress.detailedDirection}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 1: Delivery Address Form */}
              {currentStep === "address" && (
                <Card className="border-2 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <MapPin className="w-6 h-6" />
                      {deliveryAddress ? "Update Delivery Address" : "Add Delivery Address"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!deliveryAddress ? (
                      <div className="text-center py-8">
                        <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg text-muted-foreground mb-4">Add a delivery address to continue</p>
                        <Button
                          onClick={() => setIsAddressModalOpen(true)}
                          className="bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-6 px-8"
                        >
                          <MapPin className="w-5 h-5 mr-2" />
                          Add Delivery Address
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Button
                          onClick={() => setIsAddressModalOpen(true)}
                          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-6"
                        >
                          <Edit2 className="w-5 h-5 mr-2" />
                          Update Delivery Address
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Payment Method */}
              {currentStep === "payment" && (
                <Card className="border-2 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <CreditCard className="w-6 h-6" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                      <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-primary transition-colors cursor-pointer">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1 text-base">
                          <CreditCard className="w-5 h-5" />
                          Credit/Debit Card
                        </Label>
                      </div>
                       <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-primary transition-colors cursor-pointer">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1 text-base">
                          <Currency className="w-5 h-5" />
                          Cash on Delivery
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-primary transition-colors cursor-pointer">
                        <RadioGroupItem value="wallet" id="wallet" />
                        <Label htmlFor="wallet" className="flex items-center gap-3 cursor-pointer flex-1 text-base">
                          <Wallet className="w-5 h-5" />
                          Digital Wallet
                        </Label>
                      </div>
                    </RadioGroup>

                    {paymentMethod === "card" && (
                      <div className="space-y-5 mt-6 pt-6 border-t">
                        <div>
                          <Label htmlFor="cardNumber" className="text-base font-semibold">
                            Card Number
                          </Label>
                          <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="mt-2 text-base py-3" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiry" className="text-base font-semibold">
                              Expiry Date
                            </Label>
                            <Input id="expiry" placeholder="MM/YY" className="mt-2 text-base py-3" />
                          </div>
                          <div>
                            <Label htmlFor="cvv" className="text-base font-semibold">
                              CVV
                            </Label>
                            <Input id="cvv" placeholder="123" className="mt-2 text-base py-3" />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "wallet" && (
                      <div className="space-y-4 mt-6 pt-6 border-t">
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            variant="outline"
                            onClick={() => setPaymentMethod("khalti")}
                            className="h-20 border-2 hover:border-primary hover:bg-blue-50 dark:hover:bg-blue-950/20"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-xs">K</span>
                              </div>
                              <span className="font-semibold">Khalti</span>
                            </div>
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setPaymentMethod("esewa")}
                            className="h-20 border-2 hover:border-primary hover:bg-green-50 dark:hover:bg-green-950/20"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-xs">E</span>
                              </div>
                              <span className="font-semibold">eSewa</span>
                            </div>
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Order Review */}
              {currentStep === "confirm" && (
                <Card className="border-2 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <CheckCircle className="w-6 h-6" />
                      Order Review
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Order Items */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Order Items</h3>
                      {cartVendor.map((vendor) => (
                        <div key={vendor.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-base">{vendor.vendor.name}</h4>
                          </div>
                          <div className="space-y-2">
                            {vendor.cartItems.map((item) => (
                              <div key={item.cartItem.id} className="flex justify-between items-center">
                                <div>
                                  <span className="font-medium">{item.cartItem.quantity}x </span>
                                  <span>{item.cartItem.unitPrice || "Item"}</span>
                                </div>
                                <span className="font-medium">Rs. {(item.cartItem.unitPrice * item.cartItem.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Address Review */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Delivery Address</h3>
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold">{deliveryAddress?.addressTitle}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {deliveryAddress?.firstName} {deliveryAddress?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {deliveryAddress?.streetAddress}, {deliveryAddress?.city} {deliveryAddress?.zipCode}
                        </p>
                        <p className="text-sm text-muted-foreground">{deliveryAddress?.mobileNumber}</p>
                      </div>
                    </div>

                    {/* Payment Method Review */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Payment Method</h3>
                      <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="font-semibold">
                          {paymentMethod === "card" ? "Credit/Debit Card" : 
                           paymentMethod === "wallet" ? "Digital Wallet" : paymentMethod}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {paymentMethod === "wallet" ? "You'll be redirected to your wallet app" : "Card payment secured with encryption"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-4">
                {currentStep !== "address" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (currentStep === "payment") setCurrentStep("address")
                      if (currentStep === "confirm") setCurrentStep("payment")
                    }}
                    className="flex-1 text-base py-6"
                  >
                    Back
                  </Button>
                )}
                {currentStep === "address" && deliveryAddress && (
                  <Button
                    onClick={() => setCurrentStep("payment")}
                    className="flex-1 bg-primary hover:bg-primary/90 text-base py-6 font-semibold"
                  >
                    Proceed to Payment
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
                {currentStep === "payment" && (
                  <Button
                    onClick={handlePaymentContinue}
                    className="flex-1 bg-primary hover:bg-primary/90 text-base py-6 font-semibold"
                  >
                    Review Order
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
                {currentStep === "confirm" && (
                  <Button
                    onClick={handlePlaceOrder}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-base py-6 font-semibold"
                  >
                    Place Order
                    <CheckCircle className="w-5 h-5 ml-2" />
                  </Button>
                )}
              </div>
            </div>

            {/* Order Summary Sidebar - Right Side */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-2 shadow-lg">
                <CardHeader className="bg-muted/50">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {cartVendor.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
                      <p className="text-lg text-muted-foreground">Your cart is empty</p>
                    </div>
                  ) : (
                    <>
                      {/* Items Summary */}
                      <div className="space-y-4">
                        {cartVendor.map((vendor) => (
                          <div key={vendor.id} className="space-y-3">
                            <h3 className="font-semibold text-sm text-muted-foreground">{vendor.vendor.name}</h3>
                            {vendor.cartItems.map((item) => (
                              <div key={item.cartItem.id} className="flex justify-between text-sm">
                                <span className="flex-1">
                                  {item.cartItem.quantity}x { item.cartItem.unitPrice}
                                </span>
                                <span className="font-medium">Rs. {(item.cartItem.unitPrice * item.cartItem.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>

                      <Separator />

                      {/* Pricing Breakdown */}
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>Rs. {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>Delivery Fee</span>
                          <span>
                            Rs. {deliveryAddress?.latitude ? calculateDeliveryFee(totalDeliveryDistance).toFixed(2) : "0.00"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax</span>
                          <span>Rs. {tax.toFixed(2)}</span>
                        </div>
                        {usePoints && (
                          <div className="flex justify-between text-green-600">
                            <span>Points Discount</span>
                            <span>-Rs. {pointsDiscount.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>Rs. {total.toFixed(2)}</span>
                      </div>

                      {/* Estimated Delivery */}
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border">
                        <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">
                          Estimated delivery: {deliveryAddress?.latitude ? getEstimatedDeliveryTime(totalDeliveryDistance) : "Add address"}
                        </span>
                      </div>

                      {/* Loyalty Points */}
                      <Card className="bg-primary/10 border-primary/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-sm">Loyalty Points: {loyaltyPoints}</p>
                              <p className="text-xs text-muted-foreground">
                                Save Rs. {Math.min(loyaltyPoints * 0.01, subtotal * 0.2).toFixed(2)}
                              </p>
                            </div>
                            <Button
                              variant={usePoints ? "default" : "outline"}
                              size="sm"
                              onClick={() => setUsePoints(!usePoints)}
                            >
                              {usePoints ? "Using" : "Use"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Address Modal */}
      <DeliveryAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSubmit={handleAddressSubmit}
        initialData={deliveryAddress || undefined}
      />
    </div>
  )
}