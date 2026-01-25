import React, { useState } from 'react';
import MultipleImageUpload from '@/components/admin/MultipleImageUpload';

interface GalleryImageDTO {
  id: number;
  imageUrl: string;
  cloudinaryPublicId: string;
  uploadedAt: string;
}

export default function GalleryUploadExample() {
  const [uploadedImages, setUploadedImages] = useState<GalleryImageDTO[]>([]);

  const handleUploadComplete = (images: GalleryImageDTO[]) => {
    console.log('Upload complete:', images);
    setUploadedImages(prev => [...prev, ...images]);
    
    // Show success notification
    alert(`Successfully uploaded ${images.length} images!`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Upload Gallery Images</h1>

      {/* Upload Component */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <MultipleImageUpload
          provinceId={1}
          portId={1}
          serviceTypeId={1}
          imageTypeId={1}
          maxFiles={10}
          onUploadComplete={handleUploadComplete}
        />
      </div>

      {/* Uploaded Images List */}
      {uploadedImages.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Uploaded Images ({uploadedImages.length})
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {uploadedImages.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={image.imageUrl}
                    alt={`Image ${image.id}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <p className="truncate">ID: {image.id}</p>
                  <p className="truncate">
                    {new Date(image.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
