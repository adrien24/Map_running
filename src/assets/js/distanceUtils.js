export function sortDistance(infoCity, referenceCoordinates) {
  infoCity.features.sort((a, b) => {
    const coords1 = { lat: a.geometry.coordinates[1], lon: a.geometry.coordinates[0] }
    const coords2 = { lat: b.geometry.coordinates[1], lon: b.geometry.coordinates[0] }
    const distance1 = haversineDistance(referenceCoordinates, coords1)
    const distance2 = haversineDistance(referenceCoordinates, coords2)
    return distance1 - distance2
  })
}

// Fonction pour calculer la distance de Haversine
const haversineDistance = (coords1, coords2) => {
  const toRad = (x) => (x * Math.PI) / 180
  const R = 6371 // Rayon de la Terre en km

  const dLat = toRad(coords2.lat - coords1.lat)
  const dLon = toRad(coords2.lon - coords1.lon)
  const lat1 = toRad(coords1.lat)
  const lat2 = toRad(coords2.lat)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c
  return d
}
