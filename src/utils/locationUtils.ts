
export const getRandomLocation = (): google.maps.LatLngLiteral => {
  // These are coordinates with good Street View coverage
  const locations = [
    // North America
    { lat: 40.7128, lng: -74.006 }, // New York
    { lat: 34.0522, lng: -118.2437 }, // Los Angeles
    { lat: 41.8781, lng: -87.6298 }, // Chicago
    { lat: 49.2827, lng: -123.1207 }, // Vancouver
    
    // Europe
    { lat: 51.5074, lng: -0.1278 }, // London
    { lat: 48.8566, lng: 2.3522 }, // Paris
    { lat: 52.5200, lng: 13.4050 }, // Berlin
    { lat: 41.9028, lng: 12.4964 }, // Rome
    { lat: 40.4168, lng: -3.7038 }, // Madrid
    
    // Asia
    { lat: 35.6762, lng: 139.6503 }, // Tokyo
    { lat: 22.3193, lng: 114.1694 }, // Hong Kong
    { lat: 1.3521, lng: 103.8198 }, // Singapore
    
    // Australia
    { lat: -33.8688, lng: 151.2093 }, // Sydney
    { lat: -37.8136, lng: 144.9631 }, // Melbourne
    
    // South America
    { lat: -22.9068, lng: -43.1729 }, // Rio de Janeiro
    { lat: -34.6037, lng: -58.3816 }, // Buenos Aires
  ];

  return locations[Math.floor(Math.random() * locations.length)];
};

export const calculateDistance = (
  point1: google.maps.LatLngLiteral,
  point2: google.maps.LatLngLiteral
): number => {
  // Haversine formula to calculate distance between two points on Earth
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance); // Return distance in kilometers
};

export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} meters`;
  }
  return `${distance} km`;
};
