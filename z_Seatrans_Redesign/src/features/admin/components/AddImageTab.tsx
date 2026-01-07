'use client'

import { useState, useEffect } from 'react'
import { Upload, Image as ImageIcon, Loader2, Check, MapPin, Anchor, Briefcase, Trash2, Info, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Label } from '@/shared/components/ui/label'
import { Button } from '@/shared/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { useToast } from '@/shared/hooks/use-toast'
import { toast as sonnerToast } from 'sonner'
import Image from 'next/image'
import { provinceService, Province } from '@/features/logistics/services/provinceService'
import { portService, Port } from '@/features/logistics/services/portService'
import { serviceTypeService, ServiceType } from '@/features/services-config/services/serviceTypeService'
import { imageTypeService, ImageType } from '@/features/gallery/services/imageTypeService'
import { galleryService } from '@/features/gallery/services/galleryService'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from '@/shared/components/ui/file-upload'

export function AddImageTab() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')

  const [provincesWithPorts, setProvincesWithPorts] = useState<Province[]>([])
  const [ports, setPorts] = useState<Port[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [imageTypes, setImageTypes] = useState<ImageType[]>([])

  const [selectedProvince, setSelectedProvince] = useState<number | null>(null)
  const [selectedPort, setSelectedPort] = useState<number | null>(null)
  const [selectedService, setSelectedService] = useState<number | null>(null)
  const [selectedImageType, setSelectedImageType] = useState<number | null>(null)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [existingCount, setExistingCount] = useState<number | null>(null)
  const MAX_IMAGES = 36

  useEffect(() => {
    loadProvinces()
    loadServices()
  }, [])

  useEffect(() => {
    if (selectedProvince) {
      loadPorts(selectedProvince)
    } else {
      setPorts([])
      setSelectedPort(null)
      setSelectedService(null)
      setSelectedImageType(null)
    }
  }, [selectedProvince])

  useEffect(() => {
    if (selectedService) {
      loadImageTypes(selectedService)
    } else {
      setImageTypes([])
      setSelectedImageType(null)
    }
  }, [selectedService])

  useEffect(() => {
    const shouldCount = selectedProvince && selectedPort && selectedService && selectedImageType
    if (shouldCount) {
      fetchCount()
    } else {
      setExistingCount(null)
    }
  }, [selectedProvince, selectedPort, selectedService, selectedImageType])

  const onFileReject = (file: File, message: string) => {
    sonnerToast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    })
  }

  const loadProvinces = async () => {
    try {
      const data = await provinceService.getAllProvinces()
      const allPorts = await portService.getAllPorts()
      const provinceIdsWithPorts = new Set(allPorts.map(port => port.provinceId))
      setProvincesWithPorts(data.filter(p => provinceIdsWithPorts.has(p.id)))
    } catch (error) {
      console.error('Error loading provinces:', error)
    }
  }

  const loadServices = async () => {
    try {
      const data = await serviceTypeService.getAllServiceTypes()
      setServiceTypes(data)
    } catch (error) {
      console.error('Error loading services:', error)
    }
  }

  const loadPorts = async (provinceId: number) => {
    try {
      setLoading(true)
      const data = await portService.getPortsByProvince(provinceId)
      setPorts(data)
    } catch (error) {
      console.error('Error loading ports:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadImageTypes = async (serviceTypeId: number) => {
    try {
      setLoading(true)
      const data = await imageTypeService.getImageTypesByServiceType(serviceTypeId)
      setImageTypes(data)
    } catch (error) {
      console.error('Error loading image types:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCount = async () => {
    if (!selectedProvince || !selectedPort || !selectedService || !selectedImageType) return
    try {
      const count = await imageTypeService.getImageCount(selectedImageType, selectedProvince, selectedPort, selectedService)
      setExistingCount(count.current)
    } catch (error) {
      console.error('Error fetching image count:', error)
      setExistingCount(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const merged = [...pendingFiles, ...files]
      setPendingFiles(merged)
      const first = files[0]
      if (first) {
        setSelectedFile(first)
        const reader = new FileReader()
        reader.onloadend = () => setPreview(reader.result as string)
        reader.readAsDataURL(first)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProvince || !selectedPort || !selectedService || !selectedImageType || pendingFiles.length === 0) {
      toast({ title: 'Missing info', description: 'Select province, port, service, commodity and at least one file', variant: 'destructive' })
      return
    }

    const current = existingCount ?? 0
    const totalAfter = current + pendingFiles.length
    if (totalAfter > MAX_IMAGES) {
      toast({ title: 'Limit exceeded', description: `Remove ${totalAfter - MAX_IMAGES} file(s) to stay within ${MAX_IMAGES}.`, variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      let uploaded = 0
      for (const file of pendingFiles) {
        await galleryService.uploadImage(file, selectedProvince, selectedPort, selectedService, selectedImageType)
        uploaded += 1
      }
      toast({ title: 'Success', description: `Uploaded ${uploaded} image(s)` })
      setPendingFiles([])
      setSelectedFile(null)
      setPreview('')
      // refresh count
      fetchCount()
    } catch (error) {
      console.error('Upload error', error)
      toast({ title: 'Error', description: 'Failed to upload image', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const disablePort = !selectedProvince
  const disableService = !selectedPort
  const disableImageType = !selectedService
  const totalAfterAdd = (existingCount ?? 0) + pendingFiles.length
  const overLimit = totalAfterAdd > MAX_IMAGES
  const duplicateCount = pendingFiles.length - new Set(pendingFiles.map(f => `${f.name}-${f.size}`)).size
  const disableUpload = loading || !selectedProvince || !selectedPort || !selectedService || !selectedImageType || pendingFiles.length === 0 || overLimit || duplicateCount > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Add New Image
        </CardTitle>
        <CardDescription>
          Select province → port → service → commodity, then upload.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Province */}
          <div className="space-y-2">
            <Label>Province</Label>
            <Select
              value={selectedProvince ? selectedProvince.toString() : ''}
              onValueChange={(value) => setSelectedProvince(value ? Number(value) : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select province (with ports)" />
              </SelectTrigger>
              <SelectContent>
                {provincesWithPorts.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Port */}
          <div className="space-y-2">
            <Label>Port</Label>
            <Select
              value={selectedPort ? selectedPort.toString() : ''}
              onValueChange={(value) => setSelectedPort(value ? Number(value) : null)}
              disabled={disablePort || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select port" />
              </SelectTrigger>
              <SelectContent>
                {ports.map((port) => (
                  <SelectItem key={port.id} value={port.id.toString()}>{port.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Service */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> Service</Label>
            <Select
              value={selectedService ? selectedService.toString() : ''}
              onValueChange={(value) => setSelectedService(value ? Number(value) : null)}
              disabled={disableService || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((service) => (
                  <SelectItem key={service.id} value={service.id.toString()}>{service.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Image Type */}
          <div className="space-y-2">
            <Label>Commodity (Image Type)</Label>
            <Select
              value={selectedImageType ? selectedImageType.toString() : ''}
              onValueChange={(value) => setSelectedImageType(value ? Number(value) : null)}
              disabled={disableImageType || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select commodity" />
              </SelectTrigger>
              <SelectContent>
                {imageTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>{type.displayName || type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Image File(s)</Label>
            <FileUpload
              maxFiles={MAX_IMAGES}
              maxSize={10 * 1024 * 1024}
              className="w-full"
              value={pendingFiles}
              onValueChange={setPendingFiles}
              onFileReject={onFileReject}
              multiple
              accept="image/*"
            >
              <FileUploadDropzone>
                <div className="flex flex-col items-center gap-1 text-center">
                  <div className="flex items-center justify-center rounded-full border p-2.5">
                    <Upload className="size-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-sm">Drag & drop images here</p>
                  <p className="text-muted-foreground text-xs">
                    Or click to browse (max {MAX_IMAGES} files, up to 10MB each)
                  </p>
                </div>
                <FileUploadTrigger asChild>
                  <Button variant="outline" size="sm" className="mt-2 w-fit">
                    Browse files
                  </Button>
                </FileUploadTrigger>
              </FileUploadDropzone>
              <FileUploadList>
                {pendingFiles.map((file, index) => (
                  <FileUploadItem key={index} value={file}>
                    <FileUploadItemPreview />
                    <FileUploadItemMetadata />
                    <FileUploadItemDelete asChild>
                      <Button variant="ghost" size="icon" className="size-7">
                        <X />
                      </Button>
                    </FileUploadItemDelete>
                  </FileUploadItem>
                ))}
              </FileUploadList>
            </FileUpload>
          </div>

          <Button type="submit" disabled={disableUpload} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Upload Image
              </>
            )}
          </Button>

          {/* Counts */}
          {selectedProvince && selectedPort && selectedService && selectedImageType && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>
                {(existingCount ?? 0)} / {MAX_IMAGES} existing; adding {pendingFiles.length} → {totalAfterAdd}/{MAX_IMAGES}
              </span>
              {overLimit && (
                <span className="text-red-600 font-medium">Remove {totalAfterAdd - MAX_IMAGES} file(s) to proceed.</span>
              )}
              {duplicateCount > 0 && (
                <span className="text-orange-600 font-medium">Remove {duplicateCount} duplicate file(s).</span>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
