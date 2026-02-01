"use client"

import { BaseInquiryHistoryLayout } from '@/modules/users/components/history/BaseInquiryHistoryLayout'

export function SpecialRequestInquiryTab() {
  return (
    <BaseInquiryHistoryLayout
      serviceType="special-request"
      serviceLabel="Special Request"
      isAdmin={false}
      title="Special Request Inquiries"
      description="View your special request inquiries"
    />
  )
}
