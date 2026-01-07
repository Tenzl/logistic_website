"use client"

import * as React from "react"
import { Upload, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Progress } from "@/shared/components/ui/progress"
import { useFileManagement } from "@/features/admin/hooks/useFileManagement"
import { SERVICE_NAMES, ServiceName } from "@/features/admin/types/spreadsheet-file.types"

interface FileUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultService?: ServiceName
  onUploadSuccess?: () => void
}

export function FileUploadDialog({ open, onOpenChange, defaultService, onUploadSuccess }: FileUploadDialogProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [selectedService, setSelectedService] = React.useState<ServiceName>(defaultService || SERVICE_NAMES[0])
  const [uploading, setUploading] = React.useState(false)
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  const { uploadFile, uploadProgress } = useFileManagement()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setUploadError('Only Excel files (.xlsx, .xls) are allowed')
        return
      }
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB')
        return
      }
      setSelectedFile(file)
      setUploadError(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file')
      return
    }

    setUploading(true)
    setUploadError(null)
    setUploadSuccess(false)

    try {
      const result = await uploadFile(selectedFile, selectedService)
      
      if (result.success) {
        setUploadSuccess(true)
        // Gọi callback ngay lập tức để update UI
        onUploadSuccess?.()
        setTimeout(() => {
          handleClose()
        }, 1500)
      } else {
        setUploadError(result.message)
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setUploadError(null)
    setUploadSuccess(false)
    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onOpenChange(false)
  }

  React.useEffect(() => {
    if (defaultService) {
      setSelectedService(defaultService)
    }
  }, [defaultService])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Excel File</DialogTitle>
          <DialogDescription>
            Upload a .xlsx or .xls file for {selectedService}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="service">Service</Label>
            <Select
              value={selectedService}
              onValueChange={(value) => setSelectedService(value as ServiceName)}
              disabled={uploading}
            >
              <SelectTrigger id="service">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_NAMES.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {selectedFile ? selectedFile.name : 'Choose file'}
              </Button>
              <input
                ref={fileInputRef}
                id="file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
            </div>
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Size: {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            )}
          </div>

          {uploading && uploadProgress > 0 && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {uploadError && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {uploadError}
            </div>
          )}

          {uploadSuccess && (
            <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-600">
              File uploaded successfully!
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
