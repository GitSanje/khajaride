"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { SignupSchema, type SignupFormData } from "@/schemas"
import { useCreateUser, type TCreateUserPayload } from "@/api/hooks/use-user-query"
import { useSignUp } from "@clerk/clerk-react"
import { Link, useNavigate } from "react-router-dom"

export default function VendorSignupPage() {
  const navigate = useNavigate()
   const { isLoaded, signUp } = useSignUp()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(SignupSchema as any),
  })


  const createUser = useCreateUser()
  const onSubmit = async (data: SignupFormData) => {
    if (!isLoaded) return

    setIsLoading(true)
    setApiError(null)

    try {

       // 1️⃣ Create Clerk user
        const signUpAttempt = await signUp.create({
            emailAddress: data.email,
            password: data.password,
            username: data.username,
          });
          // 2️⃣ Verify or complete the signup (if email verification is required)
      // await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
       
      const userId = signUpAttempt.createdUserId;

      const payload: TCreateUserPayload = {
        id: userId!,
        role: "vendor",
        username: data.username,
        email: data.email,
        password: data.password,

      }
      const response = await createUser.mutateAsync({
        body: payload
      })
      if (response) {
        setIsSuccess(true)
        setTimeout(() => {
          navigate("/vendor-onboarding")
        }, 2000)
      }

    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  const onError = (formErrors: any) => {
  console.warn("Validation failed:", formErrors)
  setApiError("Please correct the highlighted fields before continuing.")
}

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border/50 shadow-lg">
          <CardContent className="pt-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Account Created!</h2>
            <p className="text-muted-foreground mb-4">
              Your vendor account has been created successfully. Redirecting to login...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">KhajaRide</h1>
          <p className="text-muted-foreground">Vendor Portal</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Create Vendor Account</CardTitle>
            <CardDescription>Join KhajaRide and start managing your restaurant</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit,onError)} className="space-y-4">
              {/* API Error */}
              {apiError && (
                <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700"> Api Err: {apiError}</p>
                </div>
              )}

              {/* Restaurant Name */}
              <div className="space-y-2">
                <Label htmlFor="restaurantName">Username</Label>
                <Input
                  id="Username"
                  placeholder="Username"
                  {...register("username")}
                  disabled={isLoading}
                  className="bg-background/50"
                />
                {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vendor@example.com"
                  {...register("email")}
                  disabled={isLoading}
                  className="bg-background/50"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    disabled={isLoading}
                    className="bg-background/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    disabled={isLoading}
                    className="bg-background/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
              </div>

              {/* Terms & Conditions */}
             <Controller
                  name="agreeToTerms"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="terms"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                        className="mt-1"
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        I agree to the{" "}
                        <Link to="/terms" className="text-primary hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link to="/privacy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                  )}
                />
              {errors.agreeToTerms && (
                <p className="text-sm text-red-500">
                  {errors.agreeToTerms.message}
                </p>
              )}
              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              {/* Login Link */}
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
