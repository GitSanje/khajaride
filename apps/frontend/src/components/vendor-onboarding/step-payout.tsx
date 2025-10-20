"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle } from "lucide-react"
import type { PayoutAccountData } from "@/types/vendor-onboarding-types"

interface StepPayoutProps {
  data: Partial<PayoutAccountData>
  onUpdate: (data: Partial<PayoutAccountData>) => void
  onNext: () => void
}

const PAYOUT_METHODS = [
  { value: "esewa", label: "eSewa" },
  { value: "khalti", label: "Khalti" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash Pickup" },
] as const

export function StepPayout({ data, onUpdate, onNext }: StepPayoutProps) {
  const isComplete = data.method && data.accountIdentifier && data.accountName

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payout Account Setup</CardTitle>
          <CardDescription>How would you like to receive your earnings?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payout Method */}
          <div className="space-y-2">
            <Label htmlFor="method">Payout Method *</Label>
            <Select value={data.method || ""} onValueChange={(value) => onUpdate({ ...data, method: value as any })}>
              <SelectTrigger id="method">
                <SelectValue placeholder="Select payout method" />
              </SelectTrigger>
              <SelectContent>
                {PAYOUT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Account Identifier */}
          <div className="space-y-2">
            <Label htmlFor="accountId">
              {data.method === "esewa" && "eSewa ID *"}
              {data.method === "khalti" && "Khalti ID *"}
              {data.method === "bank_transfer" && "Bank Account Number *"}
              {data.method === "cash" && "Contact Number *"}
              {!data.method && "Account Identifier *"}
            </Label>
            <Input
              id="accountId"
              placeholder={
                data.method === "esewa"
                  ? "9800000000"
                  : data.method === "khalti"
                    ? "9800000000"
                    : data.method === "bank_transfer"
                      ? "1234567890"
                      : "9800000000"
              }
              value={data.accountIdentifier || ""}
              onChange={(e) => onUpdate({ ...data, accountIdentifier: e.target.value })}
            />
          </div>

          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="accountName">Account Holder Name *</Label>
            <Input
              id="accountName"
              placeholder="Full name as per account"
              value={data.accountName || ""}
              onChange={(e) => onUpdate({ ...data, accountName: e.target.value })}
            />
          </div>

          {/* Bank Details (for bank transfer) */}
          {data.method === "bank_transfer" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  placeholder="e.g., Nabil Bank"
                  value={data.bankName || ""}
                  onChange={(e) => onUpdate({ ...data, bankName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branchName">Branch Name</Label>
                <Input
                  id="branchName"
                  placeholder="e.g., Kathmandu Branch"
                  value={data.branchName || ""}
                  onChange={(e) => onUpdate({ ...data, branchName: e.target.value })}
                />
              </div>
            </>
          )}

          {/* Set as Default */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="default"
              checked={data.isDefault ?? false}
              onCheckedChange={(checked) => onUpdate({ ...data, isDefault: checked as boolean })}
            />
            <Label htmlFor="default" className="font-normal cursor-pointer">
              Set as default payout method
            </Label>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Payout Information</p>
              <p>You can add or change your payout method anytime from your dashboard. Payouts are processed weekly.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={onNext} disabled={!isComplete} className="w-full">
        Review & Submit
      </Button>
    </div>
  )
}
