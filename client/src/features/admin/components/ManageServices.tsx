'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { useToast } from '@/shared/hooks/use-toast'
import { Loader2, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react'

interface ServiceType {
  id: number
  name: string
  displayName?: string
  description?: string
  isActive?: boolean
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export function ManageServices() {
  const { toast } = useToast()
  const [services, setServices] = useState<ServiceType[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ServiceType | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: ''
  })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE_URL}/api/service-types`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error('Failed to load services')
      const data = await response.json()
      const payload = data.data || data
      setServices(Array.isArray(payload) ? payload : [])
    } catch (error) {
      toast({ title: 'Load failed', description: 'Could not load services', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('auth_token')
      const url = editing
        ? `${API_BASE_URL}/api/service-types/${editing.id}`
        : `${API_BASE_URL}/api/service-types`

      const response = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Save failed')
      toast({
        title: 'Saved',
        description: `Service ${editing ? 'updated' : 'created'} successfully`,
      })
      setDialogOpen(false)
      setEditing(null)
      setFormData({ name: '', displayName: '', description: '' })
      fetchServices()
    } catch (error) {
      toast({ title: 'Save failed', description: 'Could not save service', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this service? Images linked to it will block deletion.')) return
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE_URL}/api/service-types/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        const message = payload.message || payload.error || 'Deletion blocked'
        throw new Error(message)
      }

      toast({ title: 'Deleted', description: 'Service removed successfully' })
      fetchServices()
    } catch (error: any) {
      toast({ title: 'Delete failed', description: error?.message || 'Could not delete service', variant: 'destructive' })
    }
  }

  const openEditor = (service?: ServiceType) => {
    if (service) {
      setEditing(service)
      setFormData({
        name: service.name || '',
        displayName: service.displayName || '',
        description: service.description || '',
      })
    } else {
      setEditing(null)
      setFormData({ name: '', displayName: '', description: '' })
    }
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" /> Service Types
              </CardTitle>
              <CardDescription>Manage logistics service offerings</CardDescription>
            </div>
            <Button onClick={() => openEditor()}>
              <Plus className="mr-2 h-4 w-4" /> New Service
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.displayName || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{service.description || '—'}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={service.isActive ? 'default' : 'secondary'}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditor(service)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(service.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {services.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">No services configured.</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Service' : 'Add Service'}</DialogTitle>
            <DialogDescription>Define the logistics service and display details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., shipping-agency"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
                  placeholder="e.g., Shipping Agency"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
