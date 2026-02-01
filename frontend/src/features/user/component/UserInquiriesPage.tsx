"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Card } from '@/shared/components/ui/card'
import { ShippingAgencyInquiryTab } from './ShippingAgencyInquiryTab'
import { CharteringInquiryTab } from './CharteringInquiryTab'
import { FreightForwardingInquiryTab } from './FreightForwardingInquiryTab'
import { LogisticsInquiryTab } from './LogisticsInquiryTab'
import { SpecialRequestInquiryTab } from './SpecialRequestInquiryTab'

export function UserInquiriesPage() {
  const [activeTab, setActiveTab] = useState('shipping-agency')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Inquiries</h2>
        <p className="text-muted-foreground">
          View and manage your service inquiries
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="shipping-agency">Shipping Agency</TabsTrigger>
          <TabsTrigger value="chartering">Chartering</TabsTrigger>
          <TabsTrigger value="freight">Freight</TabsTrigger>
          <TabsTrigger value="logistics">Logistics</TabsTrigger>
          <TabsTrigger value="special">Special</TabsTrigger>
        </TabsList>

        <TabsContent value="shipping-agency" className="space-y-4">
          <ShippingAgencyInquiryTab />
        </TabsContent>

        <TabsContent value="chartering" className="space-y-4">
          <CharteringInquiryTab />
        </TabsContent>

        <TabsContent value="freight" className="space-y-4">
          <FreightForwardingInquiryTab />
        </TabsContent>

        <TabsContent value="logistics" className="space-y-4">
          <LogisticsInquiryTab />
        </TabsContent>

        <TabsContent value="special" className="space-y-4">
          <SpecialRequestInquiryTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
