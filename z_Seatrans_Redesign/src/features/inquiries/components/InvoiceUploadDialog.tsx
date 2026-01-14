'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, FileText, X, AlertCircle, CheckCircle2, Loader2, Eye, Download, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'
import { documentService, DocumentType, InquiryDocument } from '@/features/inquiries/services/documentService'

interface InvoiceUploadDialogProps {
  inquiryId: number
  serviceSlug: string
  onUploadSuccess?: (document: InquiryDocument) => void
  onDeleteSuccess?: (documentId: number) => void
  documents?: InquiryDocument[]
}

export function InvoiceUploadDialog({
  inquiryId,
  serviceSlug,
  onUploadSuccess,
  onDeleteSuccess,
  documents = [],
}: InvoiceUploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [note, setNote] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<InquiryDocument | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loadedDocuments, setLoadedDocuments] = useState<InquiryDocument[]>([])
  const [loadingDocs, setLoadingDocs] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load documents when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadDocuments()
    }
  }, [isOpen, inquiryId])

  // Load PDF for preview
  useEffect(() => {
    if (previewDocument) {
      loadPdfPreview(previewDocument)
    } else {
      // Cleanup
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    }
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewDocument])

  const loadDocuments = async () => {
    setLoadingDocs(true)
    try {
      const docs = await documentService.getDocuments(inquiryId, serviceSlug)
      setLoadedDocuments(docs)
    } catch (err) {
      console.error('Failed to load documents:', err)
      setLoadedDocuments([])
    } finally {
      setLoadingDocs(false)
    }
  }

  const loadPdfPreview = async (doc: InquiryDocument) => {
    try {
      const blob = await documentService.downloadDocument(inquiryId, serviceSlug, doc.id)
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
    } catch (err) {
      console.error('Failed to load PDF preview:', err)
      setError('Failed to load PDF preview')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFile(droppedFiles[0])
    }
  }

  const handleFile = (selectedFile: File) => {
    setError(null)
    
    // Validate file
    const validation = documentService.validateFile(selectedFile)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setFile(selectedFile)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file')
      return
    }

    setIsUploading(true)
    setError(null)
    setSuccess(false)

    try {
      const uploadedDocument = await documentService.uploadDocument(
        inquiryId,
        serviceSlug,
        'INVOICE',
        file,
        note,
        (progress) => setUploadProgress(progress)
      )

      setSuccess(true)
      setFile(null)
      setNote('')
      setUploadProgress(0)
      onUploadSuccess?.(uploadedDocument)
      
      // Refresh documents list
      await loadDocuments()
      
      setTimeout(() => {
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownload = async (doc: InquiryDocument) => {
    try {
      const blob = await documentService.downloadDocument(inquiryId, serviceSlug, doc.id)
      const url = URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url
      a.download = doc.originalFileName
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
    }
  }

  const handleDelete = async (documentId: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    setIsDeleting(true)
    try {
      await documentService.deleteDocument(inquiryId, serviceSlug, documentId)
      onDeleteSuccess?.(documentId)
      setPreviewDocument(null)
      
      // Refresh documents list
      await loadDocuments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Manage Invoice
        </Button>
      </DialogTrigger> */}

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Invoice / Document</DialogTitle>
          <DialogDescription>Upload PDF documents for this inquiry</DialogDescription>
        </DialogHeader>

        {/* Documents List */}
        {loadingDocs ? (
          <div className="flex items-center justify-center py-4 border-b">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : loadedDocuments.length > 0 && (
          <div className="space-y-3 border-b pb-4">
            <h3 className="text-sm font-semibold">Uploaded Documents ({loadedDocuments.length})</h3>
            <div className="space-y-2">
              {loadedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100">
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="h-5 w-5 text-red-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.originalFileName}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                        <Badge variant="outline">{documentService.getDocumentTypeLabel(doc.documentType)}</Badge>
                        <span>{documentService.formatFileSize(doc.fileSize)}</span>
                        <span>•</span>
                        <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewDocument(doc)}
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(doc.id)}
                      disabled={isDeleting}
                      title="Delete"
                    >
                      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-red-500" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">Document uploaded successfully!</AlertDescription>
            </Alert>
          )}

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Add any notes for this invoice..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[60px]"
            />
          </div>

          {/* File Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : file
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {file ? (
              <div className="space-y-2">
                <FileText className="h-8 w-8 text-green-600 mx-auto" />
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-gray-600">{documentService.formatFileSize(file.size)}</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Choose another file
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                <p className="font-medium text-sm">Drag & drop your PDF here</p>
                <p className="text-xs text-gray-600">or click to select a file</p>
                <p className="text-xs text-gray-500">Max file size: 10 MB</p>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Uploading...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="flex-1 gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false)
                setFile(null)
                setError(null)
              }}
              disabled={isUploading}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Document Preview Modal */}
      {previewDocument && (
        <Dialog open={!!previewDocument} onOpenChange={() => setPreviewDocument(null)}>
          <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{previewDocument.originalFileName}</DialogTitle>
              <DialogDescription>
                <div className="flex gap-4 text-xs text-gray-600 mt-2">
                  <span>{documentService.getDocumentTypeLabel(previewDocument.documentType)}</span>
                  <span>•</span>
                  <span>{documentService.formatFileSize(previewDocument.fileSize)}</span>
                  <span>•</span>
                  <span>{new Date(previewDocument.uploadedAt).toLocaleString()}</span>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 min-h-0">
              {previewUrl ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full rounded-lg border"
                  title="PDF Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={() => handleDownload(previewDocument)} className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" onClick={() => setPreviewDocument(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  )
}
