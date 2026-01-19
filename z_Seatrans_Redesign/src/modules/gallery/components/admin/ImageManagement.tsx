import { useState, useEffect } from 'react'
import { Image as ImageIcon, Filter, X, ChevronLeft, ChevronRight, Trash2, AlertTriangle, Info } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog'
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
import { ImageWithFallback } from '@/shared/components/ImageWithFallback'
import { provinceService, Province } from '@/modules/logistics/services/provinceService'
import { portService, Port } from '@/modules/logistics/services/portService'
import { serviceTypeService, ServiceType } from '@/modules/service-types/services/serviceTypeService'
import { imageTypeService, ImageType } from '@/modules/gallery/services/imageTypeService'
import { galleryService, GalleryImage } from '@/modules/gallery/services/galleryService'
import { API_CONFIG } from '@/shared/config/api.config'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { Checkbox } from '@/shared/components/ui/checkbox'

// Helper function to construct proper image URL
const getImageUrl = (url: string) => {
  if (!url) return ''
  // If it's already a full URL, return it
  if (url.startsWith('http')) return url
  
  // Normalize slashes
  const normalizedPath = url.replace(/\\/g, '/')
  
  // Ensure it starts with / if not present
  const path = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
  
  const assetBase = API_CONFIG.ASSET_BASE_URL
  return `${assetBase}${path}`
}

export function ManageImagesTab() {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [provincesWithPorts, setProvincesWithPorts] = useState<Province[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  
  const [filterProvince, setFilterProvince] = useState<number | null>(null)
  const [filterPort, setFilterPort] = useState<number | null>(null)
  const [filterServiceType, setFilterServiceType] = useState<number | null>(null)
  const [filterImageType, setFilterImageType] = useState<number | null>(null)
  
  const [availablePorts, setAvailablePorts] = useState<Port[]>([])
  const [availableImageTypes, setAvailableImageTypes] = useState<ImageType[]>([])
  
  const [images, setImages] = useState<GalleryImage[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalImages, setTotalImages] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  
  const [currentPage, setCurrentPage] = useState(0)
  const [deleteModalImage, setDeleteModalImage] = useState<GalleryImage | null>(null)
  const [imageTypeCounts, setImageTypeCounts] = useState<Record<string, number>>({})

  const imagesPerPage = 20

  useEffect(() => {
    loadProvinces()
    loadServiceTypes()
  }, [])

  // Update available ports when province changes
  useEffect(() => {
    if (filterProvince) {
      loadPorts(filterProvince)
    } else {
      setAvailablePorts([])
      setFilterPort(null)
    }
  }, [filterProvince])

  // Update available image types when service type changes
  useEffect(() => {
    if (filterServiceType) {
      loadImageTypes(filterServiceType)
    } else {
      setAvailableImageTypes([])
      setFilterImageType(null)
    }
  }, [filterServiceType])

  // Load image type counts
  useEffect(() => {
    if (filterImageType) {
      loadImageTypeCount(filterImageType)
    }
  }, [filterImageType])

  // kick off initial load
  useEffect(() => {
    loadPage(0)
  }, [])

  useEffect(() => {
    setSelectedIds(new Set())
  }, [images])

  const loadProvinces = async () => {
    try {
      const data = await provinceService.getAllProvinces()
      setProvinces(data)
      
      // Load all ports to filter provinces with at least one port
      const allPorts = await portService.getAllPorts()
      const provinceIdsWithPorts = new Set(allPorts.map(port => port.provinceId))
      const filtered = data.filter(province => provinceIdsWithPorts.has(province.id))
      setProvincesWithPorts(filtered)
    } catch (error) {
      console.error('Error loading provinces:', error)
    }
  }

  const loadServiceTypes = async () => {
    try {
      const data = await serviceTypeService.getAllServiceTypes()
      setServiceTypes(data)
    } catch (error) {
      console.error('Error loading service types:', error)
    }
  }

  const loadPorts = async (provinceId: number) => {
    try {
      const data = await portService.getPortsByProvince(provinceId)
      setAvailablePorts(data)
      setFilterPort(null)
    } catch (error) {
      console.error('Error loading ports:', error)
    }
  }

  const loadImageTypes = async (serviceTypeId: number) => {
    try {
      const data = await imageTypeService.getImageTypesByServiceType(serviceTypeId)
      setAvailableImageTypes(data)
      setFilterImageType(null)
    } catch (error) {
      console.error('Error loading image types:', error)
    }
  }

  const loadImageTypeCount = async (imageTypeId: number, provinceId?: number, portId?: number, serviceTypeId?: number) => {
    try {
      const countData = await imageTypeService.getImageCount(imageTypeId, provinceId, portId, serviceTypeId)
      const key = `${provinceId || 0}_${portId || 0}_${serviceTypeId || 0}_${imageTypeId}`
      console.log('Loading count for key:', key, 'count:', countData.current, 'params:', { provinceId, portId, serviceTypeId, imageTypeId })
      setImageTypeCounts(prev => ({ ...prev, [key]: countData.current }))
    } catch (error) {
      console.error('Error loading image count:', error)
    }
  }

  const handleClearAll = () => {
    setFilterProvince(null)
    setFilterPort(null)
    setFilterServiceType(null)
    setFilterImageType(null)
    setImages([])
    setCurrentPage(0)
    setTotalPages(0)
    setTotalImages(0)
  }

  const handleDeleteClick = (image: GalleryImage) => {
    setDeleteModalImage(image)
  }

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(images.map(img => img.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const toggleSelectOne = (id: number, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return
    const confirmed = typeof window === 'undefined' ? true : window.confirm('Delete selected images? This cannot be undone.')
    if (!confirmed) return

    setIsLoading(true)
    const ids = Array.from(selectedIds)
    try {
      await Promise.allSettled(ids.map(id => galleryService.deleteImage(id)))
      setSelectedIds(new Set())
      await loadPage(currentPage)
    } catch (error) {
      console.error('Error deleting selected images:', error)
      alert('Failed to delete some images')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteModalImage) return

    try {
      await galleryService.deleteImage(deleteModalImage.id)
      
      // Remove from list
      setImages(images.filter(img => img.id !== deleteModalImage.id))
      
      // Update count
      const key = `${deleteModalImage.provinceId}_${deleteModalImage.portId}_${deleteModalImage.serviceTypeId}_${deleteModalImage.imageTypeId}`
      if (imageTypeCounts[key]) {
        setImageTypeCounts({
          ...imageTypeCounts,
          [key]: imageTypeCounts[key] - 1
        })
      }

      setDeleteModalImage(null)
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Failed to delete image')
    }
  }

  const getDeleteWarningType = (image: GalleryImage): 'over' | 'below' | 'normal' => {
    const key = `${image.provinceId}_${image.portId}_${image.serviceTypeId}_${image.imageTypeId}`
    const count = imageTypeCounts[key] || 0
    if (count > 18) return 'over'
    if (count === 18) return 'below'
    return 'normal'
  }

  const hasActiveFilters = filterProvince || filterPort || filterServiceType || filterImageType

  // Load when filters or page changes (realtime)
  useEffect(() => {
    loadPage(currentPage)
  }, [currentPage, filterProvince, filterPort, filterServiceType, filterImageType])

  const loadPage = async (page: number) => {
    setIsLoading(true)
    try {
      const response = await galleryService.getAllImages(
        filterProvince || undefined,
        filterPort || undefined,
        filterServiceType || undefined,
        filterImageType || undefined,
        page,
        imagesPerPage
      )
      setImages(response.content)
      setTotalPages(response.totalPages)
      setTotalImages(response.totalElements)
      
      // Load counts for each unique combination on this page
      const uniqueCombinations = new Set<string>()
      response.content.forEach(img => {
        const key = `${img.provinceId}_${img.portId}_${img.serviceTypeId}_${img.imageTypeId}`
        uniqueCombinations.add(key)
      })
      
      // Load counts in parallel
      const countPromises = Array.from(uniqueCombinations).map(key => {
        const [provinceId, portId, serviceTypeId, imageTypeId] = key.split('_').map(Number)
        return loadImageTypeCount(imageTypeId, provinceId, portId, serviceTypeId)
      })
      await Promise.all(countPromises)
    } catch (error) {
      console.error('Error loading images:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="mb-6 flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          Filter Images
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Province</label>
            <select
              value={filterProvince || ''}
              onChange={(e) => setFilterProvince(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Provinces</option>
              {provincesWithPorts.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Port</label>
            <select
              value={filterPort || ''}
              onChange={(e) => setFilterPort(e.target.value ? Number(e.target.value) : null)}
              disabled={!filterProvince}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
            >
              <option value="">All Ports</option>
              {availablePorts.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Service Type</label>
            <select
              value={filterServiceType || ''}
              onChange={(e) => setFilterServiceType(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Services</option>
              {serviceTypes.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Image Type</label>
            <select
              value={filterImageType || ''}
              onChange={(e) => setFilterImageType(e.target.value ? Number(e.target.value) : null)}
              disabled={!filterServiceType}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
            >
              <option value="">All Types</option>
              {availableImageTypes.map(t => (
                <option key={t.id} value={t.id}>
                  {t.displayName} ({imageTypeCounts[t.id] || t.requiredImageCount}/{t.requiredImageCount})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button variant="outline" onClick={handleClearAll} className="cursor-pointer">
              <X className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
          {images.length > 0 && (
            <Button
              variant="destructive"
              onClick={deleteSelected}
              disabled={selectedIds.size === 0 || isLoading}
              className="cursor-pointer"
            >
              Delete Selected ({selectedIds.size})
            </Button>
          )}
        </div>
      </div>

      {/* Images Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading images...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="p-12 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No images found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectedIds.size === 0 ? false : selectedIds.size === images.length ? true : 'indeterminate'}
                        onCheckedChange={(checked) => toggleSelectAll(Boolean(checked))}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="min-w-[120px]">Thumbnail</TableHead>
                    <TableHead>Province</TableHead>
                    <TableHead>Port</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Commodities</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {images.map((image) => {
                    const warningType = getDeleteWarningType(image)
                    const key = `${image.provinceId}_${image.portId}_${image.serviceTypeId}_${image.imageTypeId}`
                    const count = imageTypeCounts[key] || 0

                    return (
                      <TableRow key={image.id} className="hover:bg-muted/20">
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(image.id)}
                            onCheckedChange={(checked) => toggleSelectOne(image.id, Boolean(checked))}
                            aria-label="Select row"
                          />
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <div className="cursor-pointer hover:opacity-80 transition-opacity inline-block">
                                <ImageWithFallback
                                  src={getImageUrl(image.url)}
                                  alt={image.fileName}
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogTitle className="sr-only">{image.fileName}</DialogTitle>
                              <DialogDescription className="sr-only">
                                {image.portName} - {image.provinceName}
                              </DialogDescription>
                              <ImageWithFallback
                                src={getImageUrl(image.url)}
                                alt={image.fileName}
                                width={1200}
                                height={800}
                                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                              />
                              <div className="mt-4 space-y-2">
                                <h3 className="text-xl font-semibold">{image.portName}</h3>
                                <div className="flex gap-2 flex-wrap">
                                  <Badge variant="secondary">{image.provinceName}</Badge>
                                  <Badge variant="secondary">{image.serviceTypeName}</Badge>
                                  <Badge variant="outline">{image.imageTypeName}</Badge>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                        <TableCell className="text-sm">{image.provinceName}</TableCell>
                        <TableCell className="text-sm">{image.portName}</TableCell>
                        <TableCell className="text-sm">{image.serviceTypeName}</TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-2">
                            <span>{image.imageTypeName}</span>
                            {warningType === 'over' && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                OVER
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">{count}/18</div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(image.uploadedAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(image)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage + 1} of {totalPages} ({totalImages} images)
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="cursor-pointer disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`bg-card rounded-lg p-6 max-w-md w-full mx-4 border-2 ${
            getDeleteWarningType(deleteModalImage) === 'over' 
              ? 'border-orange-500' 
              : getDeleteWarningType(deleteModalImage) === 'below'
              ? 'border-blue-500'
              : 'border-red-500'
          }`}>
            <div className="flex items-start gap-4 mb-4">
              {getDeleteWarningType(deleteModalImage) === 'over' ? (
                <AlertTriangle className="h-8 w-8 text-orange-500 flex-shrink-0" />
              ) : getDeleteWarningType(deleteModalImage) === 'below' ? (
                <Info className="h-8 w-8 text-blue-500 flex-shrink-0" />
              ) : (
                <Trash2 className="h-8 w-8 text-red-500 flex-shrink-0" />
              )}
              <div>
                <h3 className="font-semibold mb-2">
                  {getDeleteWarningType(deleteModalImage) === 'over' 
                    ? '⚠️ Image Limit Exceeded'
                    : getDeleteWarningType(deleteModalImage) === 'below'
                    ? 'ℹ️ Warning: Below Required Limit'
                    : 'Delete Image?'
                  }
                </h3>
                <p className="text-sm text-muted-foreground">
                  {getDeleteWarningType(deleteModalImage) === 'over' ? (
                    <>
                      This type has <strong>{imageTypeCounts[deleteModalImage.imageTypeId]}/18 images</strong>. 
                      You MUST delete this image to meet the requirement.
                    </>
                  ) : getDeleteWarningType(deleteModalImage) === 'below' ? (
                    <>
                      Deleting this image will bring the count below 18. 
                      After deletion: <strong>{(imageTypeCounts[deleteModalImage.imageTypeId] || 18) - 1}/18</strong>
                    </>
                  ) : (
                    <>
                      Are you sure you want to delete <strong>{deleteModalImage.fileName}</strong>?
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteModalImage(null)} className="cursor-pointer">
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleConfirmDelete}
                className={
                  getDeleteWarningType(deleteModalImage) === 'over' 
                    ? 'bg-orange-500 hover:bg-orange-600 cursor-pointer' 
                    : 'bg-red-500 hover:bg-red-600 cursor-pointer'
                }
              >
                {getDeleteWarningType(deleteModalImage) === 'over' ? 'Delete (Required)' : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteModalImage} onOpenChange={(open) => !open && setDeleteModalImage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {deleteModalImage && getDeleteWarningType(deleteModalImage) === 'over' && (
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              )}
              {deleteModalImage && getDeleteWarningType(deleteModalImage) === 'below' && (
                <Info className="h-5 w-5 text-blue-500" />
              )}
              {deleteModalImage && getDeleteWarningType(deleteModalImage) === 'over' 
                ? '⚠️ Image Limit Exceeded'
                : deleteModalImage && getDeleteWarningType(deleteModalImage) === 'below'
                ? 'ℹ️ Warning: Below Required Limit'
                : 'Delete Image?'
              }
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {deleteModalImage && getDeleteWarningType(deleteModalImage) === 'over' ? (
                <>
                  This type has <strong>{imageTypeCounts[`${deleteModalImage.provinceId}_${deleteModalImage.portId}_${deleteModalImage.serviceTypeId}_${deleteModalImage.imageTypeId}`]}/18 images</strong>. 
                  You MUST delete this image to meet the requirement.
                </>
              ) : deleteModalImage && getDeleteWarningType(deleteModalImage) === 'below' ? (
                <>
                  Deleting this image will bring the count below 18. 
                  After deletion: <strong>{(imageTypeCounts[`${deleteModalImage.provinceId}_${deleteModalImage.portId}_${deleteModalImage.serviceTypeId}_${deleteModalImage.imageTypeId}`] || 18) - 1}/18</strong>
                </>
              ) : (
                <>
                  Are you sure you want to delete <strong>{deleteModalImage?.fileName}</strong>?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className={
                deleteModalImage && getDeleteWarningType(deleteModalImage) === 'over' 
                  ? 'bg-orange-500 hover:bg-orange-600' 
                  : 'bg-destructive hover:bg-destructive/90'
              }
            >
              {deleteModalImage && getDeleteWarningType(deleteModalImage) === 'over' ? 'Delete (Required)' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
