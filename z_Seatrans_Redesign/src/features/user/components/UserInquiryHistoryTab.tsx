"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { Badge } from '@/shared/components/ui/badge'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Loader2, AlertCircle, Mail, Clock } from 'lucide-react'
import { authService } from '@/features/auth/services/authService'

interface Inquiry {
  id: number
  fullName: string
  contactInfo: string
  status: 'PENDING' | 'PROCESSING' | 'QUOTED' | 'COMPLETED' | 'CANCELLED'
  submittedAt: string
  details?: string
  serviceType?: {
    id: number
    name?: string
    displayName?: string
  }
}

interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export function UserInquiryHistoryTab() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'

  useEffect(() => {
    const fetchInquiries = async () => {
      setIsLoading(true)
      try {
        const headers = {
          ...authService.getAuthHeader(),
        }

        // If the user is not authenticated, short-circuit with a friendly message
        if (!headers.Authorization) {
          setMessage('Please log in to view your inquiries.')
          setInquiries([])
          return
        }

        const response = await fetch(`${API_BASE_URL}/inquiries/me?page=0&size=20`, {
          headers,
          credentials: 'include',
        })
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized')
          }
          throw new Error('Failed to fetch inquiries')
        }
        const data: PageResponse<Inquiry> = await response.json()
        setInquiries(data.content || [])
      } catch (error) {
        console.error('Error fetching inquiries:', error)
        if ((error as Error).message === 'Unauthorized') {
          setMessage('Please log in again to view your inquiries.')
          authService.logout()
        } else {
          setMessage('Could not load inquiries. Please try again later.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchInquiries()
  }, [])

  const getStatusBadge = (status: Inquiry['status']) => {
    const variants: Record<Inquiry['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      PENDING: { variant: 'destructive', label: 'Pending' },
      PROCESSING: { variant: 'secondary', label: 'Processing' },
      QUOTED: { variant: 'default', label: 'Quoted' },
      COMPLETED: { variant: 'default', label: 'Completed' },
      CANCELLED: { variant: 'outline', label: 'Cancelled' },
    }
    const config = variants[status]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (value: string) => new Date(value).toLocaleString()

  const renderDetails = (raw?: string) => {
    if (!raw) return <span className="text-muted-foreground">No details provided</span>
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>
      const entries = Object.entries(parsed)
      if (!entries.length) return <span className="text-muted-foreground">No details provided</span>
      return (
        <div className="space-y-1">
          {entries.map(([key, value]) => (
            <div key={key} className="text-sm">
              <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
              <span className="text-muted-foreground">{String(value ?? '')}</span>
            </div>
          ))}
        </div>
      )
    } catch (err) {
      return <span className="text-muted-foreground">{raw}</span>
    }
  }

  const renderService = (inq: Inquiry) => {
    const label = inq.serviceType?.displayName || inq.serviceType?.name || 'Service'
    return <span className="font-medium">{label}</span>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Inquiry History</CardTitle>
        <CardDescription>View submissions you have sent to Seatrans.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : message ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : inquiries.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Clock className="h-10 w-10 mx-auto mb-3" />
            No inquiries yet.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inq) => (
                  <TableRow key={inq.id}>
                    <TableCell className="whitespace-nowrap">{renderService(inq)}</TableCell>
                    <TableCell className="align-top">{renderDetails(inq.details)}</TableCell>
                    <TableCell className="whitespace-nowrap">{getStatusBadge(inq.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">{formatDate(inq.submittedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
