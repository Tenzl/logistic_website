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

  useEffect(() => {
    const fetchInquiries = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('http://localhost:8080/api/inquiries/me?page=0&size=20', {
          headers: {
            ...authService.getAuthHeader(),
          },
        })
        if (!response.ok) {
            if (response.status === 401) throw new Error('Unauthorized')
          throw new Error('Failed to fetch inquiries')
        }
        const data: PageResponse<Inquiry> = await response.json()
        setInquiries(data.content || [])
      } catch (error) {
        console.error('Error fetching inquiries:', error)
        setMessage('Could not load inquiries. Please try again later.')
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
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inq) => (
                  <TableRow key={inq.id}>
                    <TableCell>{inq.id}</TableCell>
                    <TableCell className="font-medium">{inq.fullName}</TableCell>
                    <TableCell className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3" />
                      {inq.contactInfo}
                    </TableCell>
                    <TableCell>{getStatusBadge(inq.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(inq.submittedAt)}</TableCell>
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
