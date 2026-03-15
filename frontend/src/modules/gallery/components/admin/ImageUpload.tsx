import { useState, useEffect } from 'react'
import { Upload, X, MapPin, Anchor, Briefcase, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { provinceService, Province } from '@/modules/logistics/services/provinceService'
import { portService, Port } from '@/modules/logistics/services/portService'
import { serviceTypeService, ServiceType } from '@/modules/service-types/services/serviceTypeService'
import { imageTypeService, ImageType, ImageCountDTO } from '@/modules/gallery/services/imageTypeService'
import { galleryService } from '@/modules/gallery/services/galleryService'

const AREA_OPTIONS = ['NORTHERN', 'MIDDLE', 'SOUTHERN'] as const

export function AddImageTab() {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  
  const [selectedArea, setSelectedArea] = useState<string>('')
  const [selectedPort, setSelectedPort] = useState<number | null>(null)
  const [selectedServiceType, setSelectedServiceType] = useState<number | null>(null)
  const [selectedImageType, setSelectedImageType] = useState<number | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null)
  const [loading, setLoading] = useState(false)

  const [availablePorts, setAvailablePorts] = useState<Port[]>([])
  const [availableImageTypes, setAvailableImageTypes] = useState<ImageType[]>([])
  const [imageTypeCounts, setImageTypeCounts] = useState<Record<string, ImageCountDTO>>({})
  const selectedPortData = selectedPort ? availablePorts.find((port) => port.id === selectedPort) : null
  const selectedProvinceId = selectedPortData?.provinceId ?? null
  const provinceNameById = new Map(provinces.map((province) => [province.id, province.name]))

  useEffect(() => {
    loadServiceTypes()
  }, [])

  // Fetch data only after area is selected, then reset dependent fields.
  useEffect(() => {
    if (!selectedArea) {
      setProvinces([])
      setAvailablePorts([])
      setSelectedPort(null)
      setSelectedServiceType(null)
      setSelectedImageType(null)
      return
    }

    const loadAreaData = async () => {
      try {
        setLoading(true)
        const [provinceData, portData] = await Promise.all([
          provinceService.getAllProvinces(),
          portService.getAllPorts(),
        ])

        const provincesInArea = provinceData.filter((province) => province.area === selectedArea)
        const provinceIdsByArea = new Set(provincesInArea.map((province) => province.id))
        const portsInArea = portData.filter((port) => provinceIdsByArea.has(port.provinceId))

        setProvinces(provincesInArea)
        setAvailablePorts(portsInArea)
      } catch (error) {
        console.error('Error loading area data:', error)
        setProvinces([])
        setAvailablePorts([])
      } finally {
        setSelectedPort(null)
        setSelectedServiceType(null)
        setSelectedImageType(null)
        setLoading(false)
      }
    }

    void loadAreaData()
  }, [selectedArea])

  // Reset dependent fields when service type changes
  useEffect(() => {
    if (selectedServiceType) {
      loadImageTypes(selectedServiceType)
    } else {
      setAvailableImageTypes([])
      setSelectedImageType(null)
    }
  }, [selectedServiceType])

  // Load counts for all image types when all required fields are selected
  useEffect(() => {
    if (selectedProvinceId && selectedPort && selectedServiceType && availableImageTypes.length > 0) {
      availableImageTypes.forEach(type => {
        loadImageTypeCount(type.id, selectedProvinceId, selectedPort, selectedServiceType)
      })
    }
  }, [selectedProvinceId, selectedPort, selectedServiceType, availableImageTypes])

  // Load image count when image type is selected
  useEffect(() => {
    if (selectedImageType && selectedProvinceId && selectedPort && selectedServiceType) {
      loadImageTypeCount(selectedImageType, selectedProvinceId, selectedPort, selectedServiceType)
    }
  }, [selectedImageType, selectedProvinceId, selectedPort, selectedServiceType])

  const loadServiceTypes = async () => {
    try {
      const data = await serviceTypeService.getAllServiceTypes()
      setServiceTypes(data)
    } catch (error) {
      console.error('Error loading service types:', error)
    }
  }

  const loadImageTypes = async (serviceTypeId: number) => {
    try {
      setLoading(true)
      const data = await imageTypeService.getImageTypesByServiceType(serviceTypeId)
      setAvailableImageTypes(data)
      setSelectedImageType(null)
    } catch (error) {
      console.error('Error loading image types:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadImageTypeCount = async (imageTypeId: number, provinceId?: number, portId?: number, serviceTypeId?: number) => {
    try {
      const countData = await imageTypeService.getImageCount(imageTypeId, provinceId, portId, serviceTypeId)
      const key = `${provinceId || 0}_${portId || 0}_${serviceTypeId || 0}_${imageTypeId}`
      setImageTypeCounts(prev => ({ ...prev, [key]: countData }))
    } catch (error) {
      console.error('Error loading image count:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setSelectedFiles([...selectedFiles, ...newFiles])
    }
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (!selectedProvinceId || !selectedPort || !selectedServiceType || !selectedImageType || selectedFiles.length === 0) {
      alert('Please complete all fields and select files')
      return
    }

    setIsUploading(true)
    setUploadResult(null)

    let successCount = 0
    let failedCount = 0
    const errors: string[] = []

    // Upload each file separately
    for (const file of selectedFiles) {
      try {
        await galleryService.uploadImage(
          file,
          selectedProvinceId,
          selectedPort,
          selectedServiceType,
          selectedImageType
        )
        successCount++
      } catch (error: any) {
        failedCount++
        const errorMsg = error.message || 'Unknown error'
        errors.push(`${file.name}: ${errorMsg}`)
        console.error('Error uploading file:', file.name, error)
      }
    }

    setIsUploading(false)
    setUploadResult({ success: successCount, failed: failedCount, errors })
    
    // Reload all image type counts if successful
    if (successCount > 0 && selectedProvinceId && selectedPort && selectedServiceType) {
      availableImageTypes.forEach(type => {
        loadImageTypeCount(type.id, selectedProvinceId, selectedPort, selectedServiceType)
      })
    }

    // Clear files after upload
    setSelectedFiles([])

    // Auto-hide result after 8 seconds
    setTimeout(() => {
      setUploadResult(null)
    }, 8000)
  }

  const canUpload = selectedArea && selectedPort && selectedServiceType && selectedImageType && selectedFiles.length > 0

  const key = selectedImageType && selectedProvinceId && selectedPort && selectedServiceType 
    ? `${selectedProvinceId}_${selectedPort}_${selectedServiceType}_${selectedImageType}`
    : null
  const selectedImageTypeData = key ? imageTypeCounts[key] : null

  return (
    <div className="space-y-6">
      {/* Upload Result Alert */}
      {uploadResult && (
        <div className={`border rounded-lg p-4 ${
          uploadResult.failed === 0 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-semibold">
                Upload Complete: {uploadResult.success} uploaded, {uploadResult.failed} failed
              </p>
              {uploadResult.failed > 0 && uploadResult.errors.length > 0 && (
                <div className="mt-2 text-sm">
                  <p className="font-medium mb-1">Errors:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {uploadResult.errors.slice(0, 3).map((error, idx) => (
                      <li key={idx} className="text-red-700">{error}</li>
                    ))}
                    {uploadResult.errors.length > 3 && (
                      <li>...and {uploadResult.errors.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            <button
              onClick={() => setUploadResult(null)}
              className="cursor-pointer"
              aria-label="Close upload result"
              title="Close upload result"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-card border rounded-lg p-6">
        <h2 className="mb-6 flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload Images to Gallery
        </h2>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                1. Select Area <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                title="Select area"
                aria-label="Select area"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Select Area --</option>
                {AREA_OPTIONS.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
              {!selectedArea && (
                <p className="text-sm text-muted-foreground mt-1">Please select an area first</p>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-2 flex items-center gap-2">
                <Anchor className="h-4 w-4 text-primary" />
                2. Select Port <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedPort || ''}
                onChange={(e) => setSelectedPort(e.target.value ? Number(e.target.value) : null)}
                disabled={!selectedArea}
                title="Select port"
                aria-label="Select port"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
              >
                <option value="">-- Select Port --</option>
                {availablePorts.map(port => (
                  <option key={port.id} value={port.id}>
                    {port.name} ({provinceNameById.get(port.provinceId) || 'Unknown Province'})
                  </option>
                ))}
              </select>
              {!selectedPort && (
                <p className="text-sm text-muted-foreground mt-1">Please select a port first</p>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                3. Select Service Type <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedServiceType || ''}
                onChange={(e) => setSelectedServiceType(e.target.value ? Number(e.target.value) : null)}
                disabled={!selectedPort}
                title="Select service type"
                aria-label="Select service type"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
              >
                <option value="">-- Select Service Type --</option>
                {serviceTypes.map(service => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
              {!selectedServiceType && (
                <p className="text-sm text-muted-foreground mt-1">Please select a service type first</p>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-2 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                4. Select Commodity <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedImageType || ''}
                onChange={(e) => setSelectedImageType(e.target.value ? Number(e.target.value) : null)}
                disabled={!selectedServiceType}
                title="Select image type"
                aria-label="Select image type"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
              >
                <option value="">-- Select Image Type --</option>
                {availableImageTypes.map(type => {
                  const key = selectedProvinceId && selectedPort && selectedServiceType
                    ? `${selectedProvinceId}_${selectedPort}_${selectedServiceType}_${type.id}`
                    : null
                  const count = key ? imageTypeCounts[key] : null
                  const current = count ? count.current : 0
                  const required = count ? count.required : type.requiredImageCount
                  return (
                    <option key={type.id} value={type.id}>
                      {type.displayName} ({current}/{required} uploaded)
                    </option>
                  )
                })}
              </select>
            </div>
          </div>

          {selectedImageTypeData && (
            <div className={`p-3 rounded-lg flex items-center gap-2 ${
              selectedImageTypeData.current >= selectedImageTypeData.required
                ? 'bg-green-50 text-green-700'
                : 'bg-orange-50 text-orange-700'
            }`}>
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">
                {selectedImageTypeData.current >= selectedImageTypeData.required
                  ? `This type already has ${selectedImageTypeData.required} images. Additional uploads will exceed the limit.`
                  : `${selectedImageTypeData.required - selectedImageTypeData.current} more images needed to reach the required ${selectedImageTypeData.required}.`
                }
              </span>
            </div>
          )}

          {/* Step 5: Upload Files */}
          <div>
            <label className="block font-semibold mb-2 flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              5. Select Files to Upload <span className="text-red-500">*</span>
            </label>
            
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-primary hover:underline">Click to select files</span>
                <span className="text-muted-foreground"> or drag and drop</span>
              </label>
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={!selectedImageType}
              />
              <p className="text-sm text-muted-foreground mt-2">PNG, JPG, WebP up to 10MB each</p>
            </div>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="font-semibold">{selectedFiles.length} file(s) selected:</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                        aria-label={`Remove ${file.name}`}
                        title={`Remove ${file.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={handleUpload}
              disabled={!canUpload || isUploading}
              className="w-full cursor-pointer disabled:cursor-not-allowed"
              size="lg"
            >
              {isUploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload {selectedFiles.length > 0 && `${selectedFiles.length} File(s)`}
                </>
              )}
            </Button>
            {!canUpload && !isUploading && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                Complete all fields and select files to enable upload
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
