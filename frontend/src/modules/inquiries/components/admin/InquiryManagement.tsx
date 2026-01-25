import { useState, useEffect } from 'react'
import { History, Loader2 } from 'lucide-react'
import { inquiryService } from '@/modules/inquiries/services/inquiryService'

interface Inquiry {
  id: number
  name: string
  email: string
  service: string
  date: string
  status: string
}

export const ManageInquiriesTab = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInquiries()
  }, [])

  const loadInquiries = async () => {
    try {
      setLoading(true)
      const data = await inquiryService.getAllInquiries()
      setInquiries(data)
    } catch (err) {
      console.error('Error loading inquiries:', err)
      setError('Failed to load inquiries')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center text-destructive">
        <p>{error}</p>
        <button onClick={loadInquiries} className="mt-4 text-primary hover:underline">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="bg-card border rounded-lg p-6">
      <h2 className="mb-6">Manage Inquiries</h2>

      {inquiries.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <History className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg">No inquiry history yet</p>
          <p className="text-sm mt-2">Your inquiry submissions will appear here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">ID</th>
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Service</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">{inquiry.id}</td>
                  <td className="py-3 px-4">{inquiry.name}</td>
                  <td className="py-3 px-4">{inquiry.email}</td>
                  <td className="py-3 px-4">{inquiry.service}</td>
                  <td className="py-3 px-4">{new Date(inquiry.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      inquiry.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      inquiry.status === 'Replied' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {inquiry.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-primary hover:underline text-sm">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
