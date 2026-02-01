"use client"

import { BaseInquiryHistoryLayout } from '@/modules/users/components/history/BaseInquiryHistoryLayout'

export function FreightForwardingInquiryTab() {
  return (
    <BaseInquiryHistoryLayout
      serviceType="freight-forwarding"
      serviceLabel="Freight Forwarding"
      isAdmin={false}
      title="Freight Forwarding Inquiries"
      description="View your freight forwarding service inquiries"
    />
  )
}
