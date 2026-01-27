-- Add Cloudinary fields to inquiry_documents table
ALTER TABLE inquiry_documents 
ADD COLUMN cloudinary_url TEXT AFTER checksum,
ADD COLUMN cloudinary_public_id TEXT AFTER cloudinary_url;
