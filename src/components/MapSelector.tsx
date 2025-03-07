
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";
import { calculateDistance, isWithinAmsterdam } from "@/utils/locationUtils";
import { cn } from "@/lib/utils";
import { AlertTriangle, Move, Bike } from "lucide-react";
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
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!apiKey || !mapRef.current || gameState !== "playing") return;

    const initializeMap = () => {
      if (!mapRef.current || !window.google || !window.google.maps || !window.google.maps.Map) {
        console.error("Google Maps API not fully loaded yet");
        setLoadingMaps(false);
        return;
      }
      
      try {
        // Amsterdam center coordinates
        const amsterdamCenter = { lat: 52.3676, lng: 4.9041 };
        
        const mapOptions = {
          center: amsterdamCenter,
          zoom: 12,
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

        const amsterdamBounds = {
          north: 52.4308,
          south: 52.3182,
          east: 5.0219,
          west: 4.7287
        };
        
        const amsterdamCoords = [
          { lat: amsterdamBounds.north, lng: amsterdamBounds.west },
          { lat: amsterdamBounds.north, lng: amsterdamBounds.east },
          { lat: amsterdamBounds.south, lng: amsterdamBounds.east },
          { lat: amsterdamBounds.south, lng: amsterdamBounds.west }
        ];
        
        const amsterdamBorder = new window.google.maps.Polygon({
          paths: amsterdamCoords,
          strokeColor: "#e04e39",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#e04e39",
          fillOpacity: 0.05
        });
        
        amsterdamBorder.setMap(map);

        const initialPosition = amsterdamCenter;
        
        const bikeIcon = {
          path: "M 12,0 C 5.736,0 0.636,5.04 0.636,11.244 c 0,3.888 2.088,7.548 5.496,9.54 L 12,27 l 5.868,-6.216 c 3.408,-1.992 5.496,-5.652 5.496,-9.54 C 23.364,5.04 18.264,0 12,0 Z M 8.004,6.96 h 1.992 v 3.36 L 11.556,9 h 2.568 l 1.992,3.756 c 0.336,0.168 0.66,0.372 0.96,0.612 l 0.624,0.552 -1.128,1.884 -0.612,-0.54 c -0.756,-0.672 -1.716,-1.044 -2.712,-1.044 -0.696,0 -1.344,0.18 -1.932,0.48 L 9.12,11.424 8.004,13.38 V 6.96 Z m 5.544,1.68 h -1.884 l 1.548,2.568 h 1.884 l -1.548,-2.568 z m -1.896,6.948 c 0.972,0 1.764,0.792 1.764,1.764 0,0.972 -0.792,1.764 -1.764,1.764 -0.972,0 -1.764,-0.792 -1.764,-1.764 0,-0.972 0.792,-1.764 1.764,-1.764 z",
          fillColor: "#8B5CF6",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
          scale: 1.5,
          anchor: new window.google.maps.Point(12, 27)
        };
        
        const marker = new window.google.maps.Marker({
          position: initialPosition,
          map: map,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
          icon: bikeIcon
        });
        
        markerRef.current = marker;
        
        marker.addListener('dragstart', () => {
          setIsDragging(true);
          setIsGuessReady(false);
        });
        
        marker.addListener('dragend', () => {
          setIsDragging(false);
          const position = marker.getPosition();
          if (position) {
            const newLocation = {
              lat: position.lat(),
              lng: position.lng()
            };
            
            if (!isWithinAmsterdam(newLocation)) {
              marker.setPosition(initialPosition);
              setInvalidLocation(true);
              setTimeout(() => setInvalidLocation(false), 3000);
              return;
            }
            
            setGuessedLocation(newLocation);
            setIsGuessReady(true);
          }
        });
        
        setGuessedLocation(initialPosition);
        setIsGuessReady(true);
        
        setLoadingMaps(false);
      } catch (error) {
        console.error("Error initializing Map:", error);
        setLoadingMaps(false);
      }
    };

    const loadMapsScript = () => {
      if (window.google && window.google.maps && window.google.maps.Map) {
        initializeMap();
        return;
      }
      
      if (scriptLoadedRef.current) {
        const checkGoogleMapsInterval = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.Map) {
            clearInterval(checkGoogleMapsInterval);
            initializeMap();
          }
        }, 100);
        return;
      }
      
      setLoadingMaps(true);
      scriptLoadedRef.current = true;
      
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.defer = true;
      
      script.onload = () => {
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
    
    setTimeout(() => {
      const distance = calculateDistance(currentLocation, guessedLocation);
      const isWinner = distance <= 25;
      
      setDistance(distance);
      setIsWinner(isWinner);
      setGameState("result");
      setIsCalculating(false);
    }, 1000);
  };

  const handlePlaceSelected = (location: google.maps.LatLngLiteral) => {
    if (!googleMapRef.current || !markerRef.current) return;
    
    googleMapRef.current.panTo(location);
    googleMapRef.current.setZoom(14);
    
    markerRef.current.setPosition(location);
    
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
          <div className="absolute top-4 left-0 right-0 z-10 flex justify-center">
            <div className="glow-panel px-4 py-2 w-full max-w-md mx-4">
              <PlacesAutocomplete 
                onPlaceSelected={handlePlaceSelected} 
                className="w-full"
              />
            </div>
          </div>
          
          <div className="absolute bottom-4 right-4 z-10 neo-blur p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1 text-sm text-white">
              <Bike size={16} className="text-primary" />
              <span>{isDragging ? "Release to place bike" : "Drag the bike to select your guess"}</span>
            </div>
            
            {invalidLocation && (
              <div className="flex items-center gap-2 text-xs text-destructive animate-pulse">
                <AlertTriangle size={14} />
                <span>Invalid location: Outside of Amsterdam</span>
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
