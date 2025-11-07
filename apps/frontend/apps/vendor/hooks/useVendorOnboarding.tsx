
import React, { createContext, useContext, useEffect, useState } from 'react'
import type { AddressData, VendorOnboardingFormData } from "@/types/vendor-onboarding-types"
import { useGetVendorByUserId } from '@/api/hooks/use-vendor-query'

import type { VendorProfileFormData } from '@/schemas'
import { da } from 'zod/v4/locales'

interface VendorOnboardingContextType {
  formData: VendorOnboardingFormData
  error: string | null
  isSubmitting: boolean
  isComplete: boolean
  handleUpdateFormData: (data: Partial<VendorOnboardingFormData>) => void
  handleSubmit: () => Promise<void>
  setError: (error: string | null) => void
}

const VendorOnboardingContext = createContext<VendorOnboardingContextType | undefined>(undefined)

export function VendorOnboardingProvider({ children }: { children: React.ReactNode }) {

  const [formData, setFormData] = useState<VendorOnboardingFormData>({
    profile: {},
    address: {},
    payoutAccount: {},
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

   const handleUpdateFormData = (data: Partial<VendorOnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }
 
   const {data:vendorData,isLoading}=useGetVendorByUserId({enabled:true})
    
   
   useEffect(() => {

     if(vendorData?.vendor){
      handleUpdateFormData({profile:vendorData?.vendor as VendorProfileFormData})
     }
     if(!isLoading && vendorData?.address){
       handleUpdateFormData({address:vendorData?.address as AddressData})
     }
   },[vendorData, isLoading])

 console.log(vendorData,'vendorData',formData);
  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setIsComplete(true)
    } catch (error) {
      console.error("Submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const value = {
    formData,
    error,
    isSubmitting,
    isComplete,
    handleUpdateFormData,
    handleSubmit,
    setError,
  }

  return (
    <VendorOnboardingContext.Provider value={value}>
      {children}
    </VendorOnboardingContext.Provider>
  )
}

export function useVendorOnboarding() {
  const context = useContext(VendorOnboardingContext)
  if (context === undefined) {
    throw new Error('useVendorOnboarding must be used within a VendorOnboardingProvider')
  }
  return context
}