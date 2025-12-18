'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Loader2, Package, Cog } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { useToast } from '@/shared/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Badge } from '@/shared/components/ui/badge'

interface ImageType {
  id: number
  name: string
  description?: string
  displayName?: string
  serviceTypeId?: number
  serviceTypeName?: string
}

interface ServiceTypeOption { id: number; name: string; displayName?: string }

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export function ManageImageTypes() {
  const { toast } = useToast()
  const [imageTypes, setImageTypes] = useState<ImageType[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingType, setEditingType] = useState<ImageType | null>(null)
  const [services, setServices] = useState<ServiceTypeOption[]>([])
  const [selectedService, setSelectedService] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: ''
  })

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    if (selectedService) {
      fetchImageTypes(selectedService)
    } else {
      setImageTypes([])
    }
  }, [selectedService])

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE_URL}/api/service-types`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        const payload = data.data || data
        setServices(Array.isArray(payload) ? payload : [])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchImageTypes = async (serviceId: string) => {
    if (!serviceId) return
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE_URL}/api/image-types/service-type/${serviceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        const payload = data.data || data
        const list = Array.isArray(payload) ? payload : []
        setImageTypes(list.map((item: any) => ({
          id: item.id,
          name: item.name,
          displayName: item.displayName,
          description: item.description,
          serviceTypeId: item.serviceTypeId ?? item.serviceType?.id,
          serviceTypeName: item.serviceTypeName ?? item.serviceType?.name
        })))
      }
    } catch (error) {
      console.error('Error fetching image types:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const serviceId = editingType?.serviceTypeId || (selectedService ? Number(selectedService) : null)
    if (!serviceId) {
      toast({ title: 'Choose a service', description: 'Select a service before saving.', variant: 'destructive' })
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      const url = editingType
        ? `${API_BASE_URL}/api/image-types/${editingType.id}`
        : `${API_BASE_URL}/api/image-types`
      
      const response = await fetch(url, {
        method: editingType ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceTypeId: serviceId,
          name: formData.name,
          displayName: formData.displayName,
          description: formData.description,
          requiredImageCount: null
        })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Image type ${editingType ? 'updated' : 'created'} successfully`
        })
        if (selectedService) {
          fetchImageTypes(selectedService)
        }
        handleCloseDialog()
      } else {
        throw new Error('Operation failed')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${editingType ? 'update' : 'create'} image type`,
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this image type? This may affect existing images.')) return

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE_URL}/api/image-types/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Image type deleted successfully'
        })
        if (selectedService) {
          fetchImageTypes(selectedService)
        }
      } else {
        throw new Error('Delete failed')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete image type',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (type: ImageType) => {
    setEditingType(type)
    setFormData({
      name: type.name,
      displayName: type.displayName || '',
      description: type.description || ''
    })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingType(null)
    setFormData({
      name: '',
      displayName: '',
      description: ''
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                <Package className="w-5 h-5" />
                Manage Image Types
              </CardTitle>
              <CardDescription>
                Choose a service to see and manage its commodities
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger className="w-56">
                  <Cog className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.displayName || s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setDialogOpen(true)} disabled={!selectedService}>
              <Plus className="mr-2 h-4 w-4" />
              Add Type
            </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedService && (
            <div className="text-sm text-muted-foreground mb-4">Select a service to view its commodities.</div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Service</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {imageTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell>{type.displayName || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {type.description || 'No description'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{type.serviceTypeName || services.find(s => s.id === type.serviceTypeId)?.displayName || '—'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(type)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(type.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {imageTypes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {selectedService ? 'No image types for this service. Add one to organize your gallery.' : 'No service selected.'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingType ? 'Edit Image Type' : 'Add New Image Type'}</DialogTitle>
            <DialogDescription>
              {editingType ? 'Update image type information' : 'Create a new category for organizing gallery images'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Type Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Ships, Ports, Cargo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Shown to users"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this image type"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingType ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
