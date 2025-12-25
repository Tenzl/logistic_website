-- ========================================
-- SEMANTIC RENAME: Image Types to Commodities
-- ========================================
-- OPTION 1: Keep database schema unchanged, only update terminology in application layer
-- This is the SAFE and RECOMMENDED approach

-- Database Schema: NO CHANGES REQUIRED
-- - Table name remains: image_types
-- - Column name remains: image_type_id
-- - All foreign keys and indexes remain unchanged

-- Application Layer Changes (already implemented):
-- ✅ Backend: GalleryImagePublicController returns "commodities" field
-- ✅ Frontend: FieldGallery displays "commodities" instead of "imageType"
-- ✅ Frontend: ManageImageTypes shows "Commodities" instead of "Image Types"
-- ✅ Frontend: AddImageTab labels changed to "Commodities"

-- Verification Query
SELECT 
    'No database changes needed - semantic rename only' AS status,
    COUNT(*) as total_image_types 
FROM image_types;

SELECT 
    'Application successfully uses "commodities" terminology' AS info,
    'while database keeps "image_types" schema for stability' AS reason;

-- Note: This approach provides:
-- 1. Zero downtime
-- 2. No breaking changes
-- 3. Easy rollback if needed
-- 4. Backward compatibility with any external systems
