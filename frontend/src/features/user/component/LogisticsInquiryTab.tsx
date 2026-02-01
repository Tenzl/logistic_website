"use client"

import { BaseInquiryHistoryLayout } from '@/modules/users/components/history/BaseInquiryHistoryLayout'

export function LogisticsInquiryTab() {
  return (
    <BaseInquiryHistoryLayout
      serviceType="total-logistic"
      serviceLabel="Total Logistics"
      isAdmin={false}
      title="Total Logistics Inquiries"
      description="View your total logistics service inquiries"
    />
  )
}
