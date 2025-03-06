
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";
import { calculateDistance, isWithinNetherlands } from "@/utils/locationUtils";
import { cn } from "@/lib/utils";
import { MapPin, AlertTriangle } from "lucide-react";
import PlacesAutocomplete from "./PlacesAutocomplete";

interface MapSelectorProps {
  className?: string;
}

const MapSelector: React.FC<MapSelectorProps> = ({ className }) => {
  const { 
    apiKey, 
    currentLocation, 
    setGuessedLocation, 
    guessedLocation,
    gameState,
    setGameState,
    setDistance,
    setIsWinner,
    loadingMaps,
    setLoadingMaps
  } = useGame();

  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const scriptLoadedRef = useRef(false);
  
  const [isGuessReady, setIsGuessReady] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [invalidLocation, setInvalidLocation] = useState(false);

  // Initialize Google Maps when component mounts
  useEffect(() => {
    if (!apiKey || !mapRef.current || gameState !== "playing") return;

    const initializeMap = () => {
      if (!mapRef.current || !window.google || !window.google.maps || !window.google.maps.Map) {
        console.error("Google Maps API not fully loaded yet");
        setLoadingMaps(false);
        return;
      }
      
      try {
        // Initialize the map centered on the Netherlands
        const mapOptions = {
          center: { lat: 52.1326, lng: 5.2913 }, // Center of the Netherlands
          zoom: 7,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: true,
          zoomControl: true,
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          styles: [
            {
              "elementType": "geometry",
              "stylers": [{ "color": "#242f3e" }]
            },
            {
              "elementType": "labels.text.stroke",
              "stylers": [{ "color": "#242f3e" }]
            },
            {
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#746855" }]
            },
            {
              "featureType": "administrative.locality",
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#d59563" }]
            },
            {
              "featureType": "poi",
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#d59563" }]
            },
            {
              "featureType": "poi.park",
              "elementType": "geometry",
              "stylers": [{ "color": "#263c3f" }]
            },
            {
              "featureType": "poi.park",
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#6b9a76" }]
            },
            {
              "featureType": "road",
              "elementType": "geometry",
              "stylers": [{ "color": "#38414e" }]
            },
            {
              "featureType": "road",
              "elementType": "geometry.stroke",
              "stylers": [{ "color": "#212a37" }]
            },
            {
              "featureType": "road",
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#9ca5b3" }]
            },
            {
              "featureType": "road.highway",
              "elementType": "geometry",
              "stylers": [{ "color": "#746855" }]
            },
            {
              "featureType": "road.highway",
              "elementType": "geometry.stroke",
              "stylers": [{ "color": "#1f2835" }]
            },
            {
              "featureType": "road.highway",
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#f3d19c" }]
            },
            {
              "featureType": "transit",
              "elementType": "geometry",
              "stylers": [{ "color": "#2f3948" }]
            },
            {
              "featureType": "transit.station",
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#d59563" }]
            },
            {
              "featureType": "water",
              "elementType": "geometry",
              "stylers": [{ "color": "#17263c" }]
            },
            {
              "featureType": "water",
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#515c6d" }]
            },
            {
              "featureType": "water",
              "elementType": "labels.text.stroke",
              "stylers": [{ "color": "#17263c" }]
            }
          ]
        };

        const map = new window.google.maps.Map(mapRef.current, mapOptions);
        googleMapRef.current = map;

        // Draw the Netherlands border
        const netherlandsBounds = {
          north: 53.7253,
          south: 50.7503,
          east: 7.2274,
          west: 3.3316
        };
        
        const netherlandsCoords = [
          { lat: netherlandsBounds.north, lng: netherlandsBounds.west },
          { lat: netherlandsBounds.north, lng: netherlandsBounds.east },
          { lat: netherlandsBounds.south, lng: netherlandsBounds.east },
          { lat: netherlandsBounds.south, lng: netherlandsBounds.west }
        ];
        
        const netherlandsBorder = new window.google.maps.Polygon({
          paths: netherlandsCoords,
          strokeColor: "#3b82f6",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#3b82f6",
          fillOpacity: 0.05
        });
        
        netherlandsBorder.setMap(map);

        // Add click listener to place a marker
        map.addListener("click", (e) => {
          if (!e.latLng) return;
          
          const clickedLocation = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
          };
          
          // Check if the clicked location is within the Netherlands
          if (!isWithinNetherlands(clickedLocation)) {
            setInvalidLocation(true);
            setTimeout(() => setInvalidLocation(false), 3000);
            return;
          }
          
          // Remove existing marker if any
          if (markerRef.current) {
            markerRef.current.setMap(null);
          }
          
          // Create new marker
          const marker = new window.google.maps.Marker({
            position: e.latLng,
            map: map,
            animation: window.google.maps.Animation.DROP,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#3b82f6",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2
            }
          });
          
          markerRef.current = marker;
          
          // Update guess location
          setGuessedLocation(clickedLocation);
          setIsGuessReady(true);
          setInvalidLocation(false);
        });
        
        setLoadingMaps(false);
      } catch (error) {
        console.error("Error initializing Map:", error);
        setLoadingMaps(false);
      }
    };

    const loadMapsScript = () => {
      // Check if Google Maps API is already loaded and fully initialized
      if (window.google && window.google.maps && window.google.maps.Map) {
        initializeMap();
        return;
      }
      
      // If script is already being loaded, wait for it
      if (scriptLoadedRef.current) {
        const checkGoogleMapsInterval = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.Map) {
            clearInterval(checkGoogleMapsInterval);
            initializeMap();
          }
        }, 100);
        return;
      }
      
      // Otherwise load the script
      setLoadingMaps(true);
      scriptLoadedRef.current = true;
      
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.defer = true;
      
      script.onload = () => {
        // Add a small delay to ensure API is fully initialized
        setTimeout(initializeMap, 100);
      };
      
      script.onerror = () => {
        console.error("Failed to load Google Maps API");
        setLoadingMaps(false);
        scriptLoadedRef.current = false;
      };
      document.head.appendChild(script);
    };

    loadMapsScript();
  }, [apiKey, gameState]);

  const handleConfirmGuess = () => {
    if (!currentLocation || !guessedLocation) return;
    
    setIsCalculating(true);
    
    // Simulate calculation for better UX
    setTimeout(() => {
      const distance = calculateDistance(currentLocation, guessedLocation);
      const isWinner = distance <= 25; // Win if within 25km (since we're focusing on smaller Netherlands)
      
      setDistance(distance);
      setIsWinner(isWinner);
      setGameState("result");
      setIsCalculating(false);
    }, 1000);
  };

  const handlePlaceSelected = (location: google.maps.LatLngLiteral) => {
    if (!googleMapRef.current) return;
    
    // Pan to the selected location
    googleMapRef.current.panTo(location);
    googleMapRef.current.setZoom(14);
    
    // Remove existing marker if any
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
    
    // Create new marker
    const marker = new window.google.maps.Marker({
      position: location,
      map: googleMapRef.current,
      animation: window.google.maps.Animation.DROP,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#3b82f6",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2
      }
    });
    
    markerRef.current = marker;
    
    // Update guess location
    setGuessedLocation(location);
    setIsGuessReady(true);
  };

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      {loadingMaps && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="spinner mx-auto mb-3"></div>
            <p className="text-lg font-light text-white">Loading Map...</p>
          </div>
        </div>
      )}

      <div 
        ref={mapRef} 
        className={cn(
          "w-full h-full transition-opacity duration-500",
          loadingMaps ? "opacity-50" : "opacity-100"
        )}
      />
      
      {gameState === "playing" && (
        <>
          <div className="absolute top-4 left-4 right-4 z-10 glow-panel">
            <PlacesAutocomplete 
              onPlaceSelected={handlePlaceSelected} 
              className="w-full"
            />
          </div>
          
          <div className="absolute bottom-4 right-4 z-10 neo-blur p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1 text-sm text-white">
              <MapPin size={16} className="text-primary" />
              <span>Click on the map within the Netherlands</span>
            </div>
            
            {invalidLocation && (
              <div className="flex items-center gap-2 text-xs text-destructive animate-pulse">
                <AlertTriangle size={14} />
                <span>Invalid location: Outside the Netherlands</span>
              </div>
            )}
            
            <Button
              onClick={handleConfirmGuess}
              disabled={!isGuessReady || isCalculating || invalidLocation}
              className={cn(
                "w-full bg-primary/90 hover:bg-primary transition-all duration-300",
                "font-light tracking-wide button-glow"
              )}
            >
              {isCalculating ? (
                <div className="flex items-center gap-2">
                  <div className="spinner !w-4 !h-4"></div>
                  <span>Calculating...</span>
                </div>
              ) : (
                "Confirm Guess"
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default MapSelector;
