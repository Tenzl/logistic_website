"use client"

import { BaseInquiryHistoryLayout } from '@/modules/users/components/history/BaseInquiryHistoryLayout'

export function CharteringInquiryTab() {
  return (
    <BaseInquiryHistoryLayout
      serviceType="chartering"
      serviceLabel="Chartering & Ship Broking"
      isAdmin={false}
      title="Chartering Inquiries"
      description="View your chartering and ship broking inquiries"
    />
  )
}
