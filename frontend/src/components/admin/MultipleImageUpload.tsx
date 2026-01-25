import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface CloudinaryUploadResponse {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
}

interface GalleryImageDTO {
  id: number;
  imageUrl: string;
  cloudinaryPublicId: string;
  uploadedAt: string;
  serviceType: any;
  imageType: any;
  province: any;
  port: any;
}

interface MultipleImageUploadProps {
  provinceId: number;
  portId: number;
  serviceTypeId: number;
  imageTypeId: number;
  onUploadComplete?: (images: GalleryImageDTO[]) => void;
  maxFiles?: number;
  className?: string;
}

export default function MultipleImageUpload({
  provinceId,
  portId,
  serviceTypeId,
  imageTypeId,
  onUploadComplete,
  maxFiles = 10,
  className = '',
}: MultipleImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Validate file count
    if (selectedFiles.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file types
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError(`Invalid file type: ${file.name}`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setError(`File too large: ${file.name} (max 10MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Generate previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
    setError(null);
  }, [selectedFiles.length, maxFiles]);

  // Remove file
  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index]); // Clean up
      return newPreviews;
    });
  }, []);

  // Upload files
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('province_id', provinceId.toString());
      formData.append('port_id', portId.toString());
      formData.append('service_type_id', serviceTypeId.toString());
      formData.append('image_type_id', imageTypeId.toString());

      const response = await fetch('/api/v1/admin/gallery-images/upload-multiple', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      
      // Clear selection
      setSelectedFiles([]);
      previews.forEach(preview => URL.revokeObjectURL(preview));
      setPreviews([]);
      setUploadProgress(100);

      // Callback
      if (onUploadComplete && result.data) {
        onUploadComplete(result.data);
      }

      // Success message
      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Drag and drop handlers
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    // Simulate file input change
    const input = document.createElement('input');
    input.type = 'file';
    const dataTransfer = new DataTransfer();
    files.forEach(file => dataTransfer.items.add(file));
    input.files = dataTransfer.files;
    
    handleFileSelect({ target: input } as any);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center justify-center"
        >
          <Upload className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            PNG, JPG, WEBP up to 10MB (max {maxFiles} files)
          </p>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Selected Images ({selectedFiles.length}/{maxFiles})
            </h4>
            <button
              onClick={() => {
                setSelectedFiles([]);
                previews.forEach(preview => URL.revokeObjectURL(preview));
                setPreviews([]);
              }}
              className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={preview}
                    alt={selectedFiles[index].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                  {selectedFiles[index].name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              Uploading {selectedFiles.length} images...
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {uploadProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={selectedFiles.length === 0 || uploading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'Image' : 'Images'}
          </>
        )}
      </button>
    </div>
  );
}
