"use client"

import { Ship } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"

export function BookingShippingTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ship className="h-5 w-5" />
          Shipping
        </CardTitle>
        <CardDescription>
          Booking shipping settings and workflows. Content will be added here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This section is under Booking Management, below Partner.
        </p>
      </CardContent>
    </Card>
  )
}
