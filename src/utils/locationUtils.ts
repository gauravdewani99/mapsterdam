
export const getRandomLocation = (): google.maps.LatLngLiteral => {
  // These are coordinates with good Street View coverage in the Netherlands
  const locations = [
    { lat: 52.3676, lng: 4.9041 },    // Amsterdam
    { lat: 51.9244, lng: 4.4777 },    // Rotterdam
    { lat: 52.0705, lng: 4.3007 },    // The Hague
    { lat: 52.0893, lng: 5.1213 },    // Utrecht
    { lat: 51.8125, lng: 5.8372 },    // Nijmegen
    { lat: 53.2194, lng: 6.5665 },    // Groningen
    { lat: 50.8513, lng: 5.6909 },    // Maastricht
    { lat: 51.4393, lng: 5.4738 },    // Eindhoven
    { lat: 52.5088, lng: 6.0953 },    // Zwolle
    { lat: 52.0022, lng: 4.3736 },    // Delft
    { lat: 52.1583, lng: 5.3889 },    // Amersfoort
    { lat: 51.9851, lng: 5.8987 },    // Arnhem
    { lat: 53.1750, lng: 4.8528 },    // Texel
    { lat: 52.1582, lng: 4.4932 },    // Leiden
    { lat: 51.5748, lng: 4.7677 },    // Breda
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

// Check if a location is within the Netherlands boundaries
export const isWithinNetherlands = (location: google.maps.LatLngLiteral): boolean => {
  // Approximate bounding box for the Netherlands
  const netherlandsBounds = {
    north: 53.7253, // Northern-most point
    south: 50.7503, // Southern-most point
    east: 7.2274,   // Eastern-most point
    west: 3.3316    // Western-most point
  };
  
  return (
    location.lat >= netherlandsBounds.south &&
    location.lat <= netherlandsBounds.north &&
    location.lng >= netherlandsBounds.west &&
    location.lng <= netherlandsBounds.east
  );
};

