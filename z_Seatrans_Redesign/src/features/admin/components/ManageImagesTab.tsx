'use client'

import { useState, useEffect, useMemo } from 'react'
import { Trash2, Loader2, MapPin, Anchor, Cog, Layers, Pencil, ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { ImageWithFallback } from '@/shared/components/ImageWithFallback'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { useToast } from '@/shared/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'

interface GalleryImage {
  id: number
  imageUrl: string
  title: string
  description: string
  imageType: { id: number; name: string; displayName?: string }
  province?: { id: number; name: string }
  port?: { id: number; name: string }
  serviceType?: { id: number; name: string }
  imageTypeId?: number
  provinceId?: number
  portId?: number
  serviceTypeId?: number
  uploadedAt?: string
}

interface BasicOption { id: number; name: string; displayName?: string; serviceTypeId?: number }

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
const FILE_BASE_URL = process.env.NEXT_PUBLIC_FILE_BASE_URL || API_BASE_URL

const formatImageUrl = (url?: string) => {
  if (!url) return ''
  const normalized = url.replace(/\\/g, '/')
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized
  const path = normalized.startsWith('/') ? normalized : `/${normalized}`
  return `${FILE_BASE_URL}${path}`
}

const formatDateTime = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

export function ManageImagesTab() {
  const { toast } = useToast()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [imageTypes, setImageTypes] = useState<BasicOption[]>([])
  const [provinces, setProvinces] = useState<BasicOption[]>([])
  const [ports, setPorts] = useState<BasicOption[]>([])
  const [serviceTypes, setServiceTypes] = useState<BasicOption[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedProvince, setSelectedProvince] = useState<string>('all')
  const [selectedPort, setSelectedPort] = useState<string>('all')
  const [selectedServiceType, setSelectedServiceType] = useState<string>('all')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const pageSize = 20
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [uploadedSort, setUploadedSort] = useState<'asc' | 'desc'>('desc')
  const [imageToDelete, setImageToDelete] = useState<number | null>(null)
  const [previewImage, setPreviewImage] = useState<GalleryImage | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null)
  const [editForm, setEditForm] = useState({
    provinceId: 'all',
    portId: 'all',
    serviceTypeId: 'all',
    imageTypeId: 'all'
  })

  const filteredEditImageTypes = useMemo(() => {
    if (editForm.serviceTypeId === 'all') return imageTypes
    return imageTypes.filter((type) => `${type.serviceTypeId ?? ''}` === editForm.serviceTypeId)
  }, [editForm.serviceTypeId, imageTypes])

  useEffect(() => {
    fetchFilters()
  }, [])

  useEffect(() => {
    if (selectedProvince !== 'all') {
      fetchPortsByProvince(Number(selectedProvince))
    } else {
      setPorts([])
      setSelectedPort('all')
    }
  }, [selectedProvince])

  useEffect(() => {
    setSelectedType('all')
    setSelectedPort('all')
    setPage(0)
  }, [selectedServiceType])

  useEffect(() => {
    setPage(0)
  }, [selectedProvince, selectedPort, selectedServiceType, selectedType])

  useEffect(() => {
    fetchImages()
  }, [selectedProvince, selectedPort, selectedServiceType, selectedType, page])

  useEffect(() => {
    // Drop selections that disappear after filtering/pagination changes
    setSelectedIds((prev) => prev.filter((id) => images.some((img) => img.id === id)))
  }, [images])

  // Keep image type in edit dialog aligned with selected service type
  useEffect(() => {
    if (!editDialogOpen) return
    if (editForm.imageTypeId === 'all') return
    const stillValid = filteredEditImageTypes.some((type) => `${type.id}` === editForm.imageTypeId)
    if (!stillValid) {
      setEditForm((prev) => ({ ...prev, imageTypeId: 'all' }))
    }
  }, [editDialogOpen, editForm.imageTypeId, filteredEditImageTypes])

  const fetchFilters = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const authHeader = { 'Authorization': `Bearer ${token}` }

      const [provinceRes, serviceTypeRes, imageTypeRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/provinces`, { headers: authHeader }),
        fetch(`${API_BASE_URL}/api/service-types`, { headers: authHeader }),
        fetch(`${API_BASE_URL}/api/image-types`, { headers: authHeader })
      ])

      if (provinceRes.ok) {
        const data = await provinceRes.json()
        const provincesPayload = data.data || data
        // keep only provinces that have at least one port
        const portsRes = await fetch(`${API_BASE_URL}/api/ports`, { headers: authHeader })
        let provinceIdsWithPorts = new Set<number>()
        if (portsRes.ok) {
          const portsData = await portsRes.json()
          const list = portsData.data || portsData
          provinceIdsWithPorts = new Set(list.map((p: any) => p.provinceId || p.province?.id))
        }
        const filtered = Array.isArray(provincesPayload)
          ? provincesPayload.filter((p: any) => provinceIdsWithPorts.has(p.id))
          : provincesPayload
        setProvinces(filtered)
      }
      if (serviceTypeRes.ok) {
        const data = await serviceTypeRes.json()
        setServiceTypes(data.data || data)
      }
      if (imageTypeRes.ok) {
        const data = await imageTypeRes.json()
        const payload = data.data?.content ?? data.data ?? data
        const list = Array.isArray(payload) ? payload : []
        setImageTypes(list.map((item: any) => {
          const serviceTypeId = item.serviceTypeId ?? item.serviceType?.id ?? item.serviceTypeID ?? item.serviceType?.serviceTypeId
          return {
            id: item.id,
            name: item.displayName || item.name,
            displayName: item.displayName,
            serviceTypeId
          }
        }))
      }
    } catch (error) {
      console.error('Error fetching filters:', error)
    }
  }

  const fetchPortsByProvince = async (provinceId: number) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE_URL}/api/ports/province/${provinceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setPorts(data.data || data)
      }
    } catch (error) {
      console.error('Error fetching ports:', error)
    }
  }

  const fetchImages = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const params = new URLSearchParams()
      if (selectedProvince !== 'all') params.append('provinceId', selectedProvince)
      if (selectedPort !== 'all') params.append('portId', selectedPort)
      if (selectedServiceType !== 'all') params.append('serviceTypeId', selectedServiceType)
      if (selectedType !== 'all') params.append('imageTypeId', selectedType)
      params.append('page', page.toString())
      params.append('size', pageSize.toString())

      const response = await fetch(`${API_BASE_URL}/api/admin/gallery-images?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const payload = data.data?.content ?? data.data ?? data
        const content = Array.isArray(payload) ? payload : payload?.content
        setImages(content || [])
        const total = data.data?.totalPages ?? data.totalPages ?? 0
        setTotalPages(total)
      }
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!imageToDelete) return

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_BASE_URL}/api/admin/gallery-images/${imageToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Image deleted successfully'
        })
        setImages(prev => prev.filter(img => img.id !== imageToDelete))
        if (page + 1 > totalPages && page > 0) {
          setPage(page - 1)
        }
      } else {
        throw new Error('Delete failed')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete image',
        variant: 'destructive'
      })
    } finally {
      setDeleteDialogOpen(false)
      setImageToDelete(null)
    }
  }

  const filteredImages = useMemo(() => {
    const filtered = images.filter(image => {
      const matchesType = selectedType === 'all' ||
        image.imageType?.id?.toString() === selectedType ||
        image.imageTypeId?.toString() === selectedType
      const matchesProvince = selectedProvince === 'all' ||
        image.province?.id?.toString() === selectedProvince ||
        image.provinceId?.toString() === selectedProvince
      const matchesPort = selectedPort === 'all' ||
        image.port?.id?.toString() === selectedPort ||
        image.portId?.toString() === selectedPort
      const matchesServiceType = selectedServiceType === 'all' ||
        image.serviceType?.id?.toString() === selectedServiceType ||
        image.serviceTypeId?.toString() === selectedServiceType

      return matchesType && matchesProvince && matchesPort && matchesServiceType
    })

    return [...filtered].sort((a, b) => {
      const aTime = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0
      const bTime = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0
      return uploadedSort === 'asc' ? aTime - bTime : bTime - aTime
    })
  }, [images, selectedType, selectedProvince, selectedPort, selectedServiceType, uploadedSort])

  const availableImageTypes = useMemo(() => {
    if (selectedServiceType === 'all') return []
    const filtered = imageTypes.filter(type => type.serviceTypeId != null && type.serviceTypeId.toString() === selectedServiceType)
    return filtered.length > 0 ? filtered : imageTypes
  }, [imageTypes, selectedServiceType])

  const allVisibleIds = useMemo(() => filteredImages.map((img) => img.id), [filteredImages])
  const allSelected = allVisibleIds.length > 0 && selectedIds.length === allVisibleIds.length
  const partiallySelected = selectedIds.length > 0 && !allSelected

  const toggleRow = (id: number, checked: boolean | 'indeterminate') => {
    setSelectedIds((prev) => {
      if (checked === true) return Array.from(new Set([...prev, id]))
      return prev.filter((item) => item !== id)
    })
  }

  const toggleAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedIds(allVisibleIds)
    } else {
      setSelectedIds([])
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return

    try {
      const token = localStorage.getItem('auth_token')
      const responses = await Promise.all(selectedIds.map((id) => fetch(`${API_BASE_URL}/api/admin/gallery-images/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })))

      const allOk = responses.every((res) => res.ok)
      if (!allOk) throw new Error('One or more deletions failed')

      toast({ title: 'Deleted', description: `${selectedIds.length} image(s) removed` })
      setSelectedIds([])
      await fetchImages()
    } catch (error) {
      console.error('Error bulk deleting images:', error)
      toast({ title: 'Error', description: 'Failed to delete selected images', variant: 'destructive' })
    } finally {
      setBulkDeleteDialogOpen(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Manage Images</CardTitle>
          <CardDescription>
            View, filter, and delete images from your gallery
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Select value={selectedProvince} onValueChange={(value) => setSelectedProvince(value)}>
              <SelectTrigger className="w-48">
                <MapPin className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Provinces</SelectItem>
                {provinces.map((province) => (
                  <SelectItem key={province.id} value={province.id.toString()}>
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedPort}
              onValueChange={(value) => setSelectedPort(value)}
              disabled={selectedProvince === 'all' || ports.length === 0}
            >
              <SelectTrigger className="w-48">
                <Anchor className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Port" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ports</SelectItem>
                {ports.map((port) => (
                  <SelectItem key={port.id} value={port.id.toString()}>
                    {port.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedServiceType} onValueChange={(value) => setSelectedServiceType(value)}>
              <SelectTrigger className="w-48">
                <Cog className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Service Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {serviceTypes.map((service) => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType} disabled={selectedServiceType === 'all'}>
              <SelectTrigger className="w-48">
                <Layers className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Image Type" />
              </SelectTrigger>
              <SelectContent>
                {selectedServiceType !== 'all' && <SelectItem value="all">All Types</SelectItem>}
                {availableImageTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading…</span>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedProvince('all')
                setSelectedPort('all')
                setSelectedServiceType('all')
                setSelectedType('all')
                setPage(0)
              }}
            >
              Reset
            </Button>

            <div className="flex items-center gap-2 ml-auto">
              {selectedIds.length > 0 && (
                <Badge variant="secondary">{selectedIds.length} selected</Badge>
              )}
              <Button
                variant="destructive"
                size="sm"
                disabled={selectedIds.length === 0}
                onClick={() => setBulkDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete selected
              </Button>
            </div>
          </div>

          {/* Images Table */}
          {filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No images found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allSelected ? true : partiallySelected ? 'indeterminate' : false}
                      onCheckedChange={toggleAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Province</TableHead>
                  <TableHead>Port</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Commodity</TableHead>
                  <TableHead className="whitespace-nowrap">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={() => setUploadedSort((prev) => prev === 'asc' ? 'desc' : 'asc')}
                    >
                      Uploaded
                      {uploadedSort === 'asc' && <ArrowUp className="h-4 w-4" />}
                      {uploadedSort === 'desc' && <ArrowDown className="h-4 w-4" />}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredImages.map((image) => (
                  <TableRow key={image.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(image.id)}
                        onCheckedChange={(checked) => toggleRow(image.id, checked)}
                        aria-label={`Select image ${image.id}`}
                      />
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => setPreviewImage(image)}
                        className="block w-24 h-16 overflow-hidden rounded-md border hover:shadow-md"
                      >
                        <ImageWithFallback
                          src={formatImageUrl(image.imageUrl)}
                          alt={image.title || image.port?.name || 'Gallery image'}
                          width={200}
                          height={120}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    </TableCell>
                    <TableCell>{image.province?.name || '—'}</TableCell>
                    <TableCell>{image.port?.name || '—'}</TableCell>
                    <TableCell>{image.serviceType?.name || '—'}</TableCell>
                    <TableCell>{image.imageType?.displayName || image.imageType?.name || '—'}</TableCell>
                    <TableCell>{formatDateTime(image.uploadedAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingImage(image)
                            setEditForm({
                              provinceId: (image.province?.id || image.provinceId)?.toString() || 'all',
                              portId: (image.port?.id || image.portId)?.toString() || 'all',
                              serviceTypeId: (image.serviceType?.id || image.serviceTypeId)?.toString() || 'all',
                              imageTypeId: (image.imageType?.id || image.imageTypeId)?.toString() || 'all'
                            })
                            if (image.province?.id || image.provinceId) {
                              fetchPortsByProvince(Number(image.province?.id || image.provinceId))
                            }
                            setEditDialogOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setImageToDelete(image.id)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {filteredImages.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {page + 1} of {Math.max(totalPages, 1)} (20 per page)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewImage?.title || previewImage?.port?.name || 'Preview'}</DialogTitle>
            <DialogDescription>{previewImage?.imageType?.displayName || previewImage?.imageType?.name}</DialogDescription>
          </DialogHeader>
          {previewImage && (
            <ImageWithFallback
              src={formatImageUrl(previewImage.imageUrl)}
              alt={previewImage.title || previewImage.port?.name || 'Gallery image'}
              width={1200}
              height={800}
              className="w-full h-auto max-h-[70vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
            <DialogDescription>Update province, port, service, or commodity.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select
              value={editForm.provinceId}
              onValueChange={(value) => {
                setEditForm(prev => ({ ...prev, provinceId: value, portId: 'all' }))
                if (value !== 'all') {
                  fetchPortsByProvince(Number(value))
                } else {
                  setPorts([])
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {provinces.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={editForm.portId}
              onValueChange={(value) => setEditForm(prev => ({ ...prev, portId: value }))}
              disabled={editForm.provinceId === 'all'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select port" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {ports.map((port) => (
                  <SelectItem key={port.id} value={port.id.toString()}>{port.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={editForm.serviceTypeId}
              onValueChange={(value) => setEditForm(prev => ({ ...prev, serviceTypeId: value, imageTypeId: 'all' }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {serviceTypes.map((service) => (
                  <SelectItem key={service.id} value={service.id.toString()}>{service.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={editForm.imageTypeId}
              onValueChange={(value) => setEditForm(prev => ({ ...prev, imageTypeId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select commodity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {filteredEditImageTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!editingImage) return
                try {
                  const token = localStorage.getItem('auth_token')
                  const body: Record<string, string | number | null> = {}
                  if (editForm.provinceId !== 'all') body.provinceId = Number(editForm.provinceId)
                  if (editForm.portId !== 'all') body.portId = Number(editForm.portId)
                  if (editForm.serviceTypeId !== 'all') body.serviceTypeId = Number(editForm.serviceTypeId)
                  if (editForm.imageTypeId !== 'all') body.imageTypeId = Number(editForm.imageTypeId)

                  const response = await fetch(`${API_BASE_URL}/api/admin/gallery-images/${editingImage.id}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(body)
                  })

                  if (!response.ok) throw new Error('Failed to update image')
                  const data = await response.json()
                  const updated = data.data ?? data
                  setImages(prev => prev.map(img => img.id === editingImage.id ? updated : img))
                  setEditDialogOpen(false)
                } catch (error) {
                  console.error('Error updating image:', error)
                  toast({ title: 'Update failed', description: 'Could not update image', variant: 'destructive' })
                }
              }}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected images?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. {selectedIds.length} image(s) will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the image from your gallery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
