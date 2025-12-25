'use client'

import { useState, useEffect } from 'react'
import { Upload, Image as ImageIcon, Loader2, Check, MapPin, Anchor, Briefcase, Trash2, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Label } from '@/shared/components/ui/label'
import { Button } from '@/shared/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { useToast } from '@/shared/hooks/use-toast'
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
            <Label>Image File</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
              <input
                id="image"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="image" className="cursor-pointer">
                {preview ? (
                  <div className="relative w-full h-64 mb-4">
                    <Image src={preview} alt="Preview" fill className="object-contain" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </label>
            </div>
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

          {/* Pending files table */}
          {pendingFiles.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-semibold">Files to upload ({pendingFiles.length})</div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead className="w-20">Preview</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-32">Size</TableHead>
                    <TableHead className="w-24">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingFiles.map((file, idx) => (
                    <TableRow key={`${file.name}-${idx}`}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        <div className="h-12 w-16 overflow-hidden rounded border bg-muted">
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            width={64}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>{file.name}</TableCell>
                      <TableCell>{(file.size / 1024).toFixed(1)} KB</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPendingFiles(prev => prev.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
