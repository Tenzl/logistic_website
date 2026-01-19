/**
 * Province mapping utilities for newvn.geojson
 * 
 * newvn.geojson structure:
 * - properties.ma_tinh: Province code (e.g., "01", "48", "79")
 * - properties.ten_tinh: Province name in Vietnamese
 */

/**
 * Normalize province name for comparison
 * Removes common prefixes and standardizes format
 */
export const normalizeProvinceName = (name: string): string => {
  return name
    .replace(/^TP\.\s*/i, '') // Remove "TP." prefix
    .replace(/^Thành phố\s*/i, '') // Remove "Thành phố" prefix  
    .replace(/^Tỉnh\s*/i, '') // Remove "Tỉnh" prefix
    .trim()
    .toLowerCase()
}

/**
 * Mapping table between database province names and geojson names
 * Use this when names don't match exactly
 */
export const PROVINCE_NAME_MAPPING: Record<string, string> = {
  // Database name -> GeoJSON name
  'TP. Hồ Chí Minh': 'TP. Hồ Chí Minh',
  'Hồ Chí Minh': 'TP. Hồ Chí Minh',
  'Hồ Chí Minh city': 'TP. Hồ Chí Minh',
  'Sài Gòn': 'TP. Hồ Chí Minh',
  'Thừa Thiên - Huế': 'Huế',
  'Thừa Thiên Huế': 'Huế',
  'TT-Huế': 'Huế',
  // Add more mappings as needed
}

/**
 * Get the standardized province name for geojson lookup
 */
export const getGeoJsonProvinceName = (dbProvinceName: string): string => {
  // Check if there's a direct mapping
  if (PROVINCE_NAME_MAPPING[dbProvinceName]) {
    return PROVINCE_NAME_MAPPING[dbProvinceName]
  }
  
  return dbProvinceName
}

/**
 * Find feature in geojson by province name
 */
export const findProvinceFeature = (
  geojson: any,
  provinceName: string
): any | null => {
  if (!geojson?.features) return null
  
  const targetName = getGeoJsonProvinceName(provinceName)
  
  return geojson.features.find((feature: any) => {
    const geoName = feature.properties?.ten_tinh || ''
    
    const normalizedGeoName = normalizeProvinceName(geoName)
    const normalizedTargetName = normalizeProvinceName(targetName)
    
    return normalizedGeoName === normalizedTargetName
  })
}

/**
 * Debug helper: List all available province names in geojson
 */
export const listGeoJsonProvinces = (geojson: any): string[] => {
  if (!geojson?.features) return []
  
  return geojson.features
    .map((f: any) => f.properties?.ten_tinh)
    .filter(Boolean)
    .sort()
}

/**
 * Debug helper: Check mapping coverage
 * Returns provinces from database that don't have matching geojson data
 */
export const checkMappingCoverage = (
  geojson: any,
  dbProvinces: string[]
): {
  matched: string[]
  unmatched: string[]
} => {
  const matched: string[] = []
  const unmatched: string[] = []
  
  dbProvinces.forEach(provinceName => {
    const feature = findProvinceFeature(geojson, provinceName)
    if (feature) {
      matched.push(provinceName)
    } else {
      unmatched.push(provinceName)
    }
  })
  
  return { matched, unmatched }
}



