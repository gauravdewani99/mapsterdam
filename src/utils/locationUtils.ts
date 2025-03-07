export const getRandomLocation = (): google.maps.LatLngLiteral => {
  // These are coordinates with good Street View coverage in Amsterdam
  const locations = [
    { lat: 52.3676, lng: 4.9041 },    // Amsterdam Center
    { lat: 52.3739, lng: 4.8809 },    // Jordaan
    { lat: 52.3656, lng: 4.8907 },    // Dam Square
    { lat: 52.3584, lng: 4.8811 },    // Museumplein
    { lat: 52.3748, lng: 4.9200 },    // NEMO Science Museum
    { lat: 52.3731, lng: 4.9226 },    // Artis Zoo
    { lat: 52.3769, lng: 4.8983 },    // Central Station
    { lat: 52.3581, lng: 4.8728 },    // Vondelpark
    { lat: 52.3756, lng: 4.8866 },    // Anne Frank House
    { lat: 52.3600, lng: 4.8852 },    // Rijksmuseum
    { lat: 52.3702, lng: 4.8952 },    // Royal Palace
    { lat: 52.3661, lng: 4.9158 },    // Waterlooplein
    { lat: 52.3745, lng: 4.8889 },    // Westerkerk
    { lat: 52.3708, lng: 4.9147 },    // Nieuwmarkt
    { lat: 52.3650, lng: 4.9086 },    // Rembrandtplein
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

// Check if a location is within Amsterdam boundaries
export const isWithinAmsterdam = (location: google.maps.LatLngLiteral): boolean => {
  // Amsterdam bounding box
  const amsterdamBounds = {
    north: 52.4308, // Northern-most point
    south: 52.3182, // Southern-most point
    east: 5.0219,   // Eastern-most point
    west: 4.7287    // Western-most point
  };
  
  return (
    location.lat >= amsterdamBounds.south &&
    location.lat <= amsterdamBounds.north &&
    location.lng >= amsterdamBounds.west &&
    location.lng <= amsterdamBounds.east
  );
};
