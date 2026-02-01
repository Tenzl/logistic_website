"use client"

import { BaseInquiryHistoryLayout } from '@/modules/users/components/history/BaseInquiryHistoryLayout'

export function ShippingAgencyInquiryTab() {
  return (
    <BaseInquiryHistoryLayout
      serviceType="shipping-agency"
      serviceLabel="Shipping Agency"
      isAdmin={false}
      title="Shipping Agency Inquiries"
      description="View your shipping agency service inquiries"
    />
  )
}
