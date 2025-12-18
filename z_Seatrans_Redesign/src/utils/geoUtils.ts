
// Calculate a coastal point for a province (for port markers)
// Returns a point closer to the coast/sea rather than the geometric center
export function calculateCentroid(geometry: any): [number, number] {
  if (!geometry) return [0, 0];

  let coordinates = geometry.coordinates;
  let type = geometry.type;

  if (type === 'Polygon') {
    return getCoastalPoint(coordinates);
  } else if (type === 'MultiPolygon') {
    // Find the largest polygon (main landmass)
    let maxPoints = 0;
    let mainPolygon = coordinates[0];
    
    for (const poly of coordinates) {
        if (poly[0].length > maxPoints) {
            maxPoints = poly[0].length;
            mainPolygon = poly;
        }
    }
    return getCoastalPoint(mainPolygon);
  }

  return [0, 0];
}

function getCoastalPoint(coordinates: any[]): [number, number] {
  // coordinates[0] is the outer ring (coastline)
  const ring = coordinates[0];
  
  // For coastal provinces, we want a point on the eastern or southern edge
  // Find the point with maximum longitude (eastmost) or minimum latitude (southmost)
  // This approximates a coastal location for Vietnam's geography
  
  let eastmostPoint = ring[0];
  let maxLon = ring[0][0];
  
  for (let i = 1; i < ring.length; i++) {
    const lon = ring[i][0];
    if (lon > maxLon) {
      maxLon = lon;
      eastmostPoint = ring[i];
    }
  }

  return [eastmostPoint[0], eastmostPoint[1]];
}
