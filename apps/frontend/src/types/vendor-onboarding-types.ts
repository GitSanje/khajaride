import type { TCreateVendorPayload } from "@/api/hooks/use-vendor-query"

export type OnboardingStep = "profile"  | "address" | "payout" | "review" | "complete"

export interface VendorProfileData {
  name: string
  about: string
  cuisine: string
  vendorType: "restaurant" | "bakery" | "cafe" | "alcohol" | "grocery" | "other"
  phone: string
  deliveryAvailable: boolean
  pickupAvailable: boolean
  groupOrderAvailable: boolean
  deliveryFee: number
  minOrderAmount: number
  deliveryTimeEstimate: string
  cuisineTags: string[]
  promoText: string
}

export interface DocumentData {
  documentType:
    | "business_license"
    | "pan_vat_registration"
    | "identity_proof"
    | "bank_account_proof"
    | "hygiene_certificate"
    | "menu_safety_certificate"
  documentUrl: string
  documentNumber?: string
  expiryDate?: string
  status: "pending" | "approved" | "rejected"
}

export interface AddressData {
  streetAddress: string
  city: string
  state: string
  zipcode: string
  latitude: number
  longitude: number
}

export interface PayoutAccountData {
  method: "esewa" | "khalti" | "bank_transfer" | "cash"
  accountIdentifier: string
  accountName: string
  bankName?: string
  branchName?: string
  isDefault: boolean
}

export interface VendorOnboardingFormData {
  profile: Partial<TCreateVendorPayload>
  address: Partial<AddressData>
  payoutAccount: Partial<PayoutAccountData>
}

export interface OnboardingContextType {
  currentStep: OnboardingStep
  formData: VendorOnboardingFormData
  setCurrentStep: (step: OnboardingStep) => void
  updateFormData: (data: Partial<VendorOnboardingFormData>) => void
  nextStep: () => void
  previousStep: () => void
  isStepComplete: (step: OnboardingStep) => boolean
}
