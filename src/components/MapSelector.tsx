import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";
import { calculateDistance, isWithinNetherlands } from "@/utils/locationUtils";
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
        const mapOptions = {
          center: { lat: 52.1326, lng: 5.2913 },
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

        const initialPosition = { lat: 52.1326, lng: 5.2913 };
        
        const customBikeIcon = {
          url: '/lovable-uploads/f9c378eb-cf03-48ee-91de-11ac46cf37b3.png',
          scaledSize: new window.google.maps.Size(48, 48),
          origin: new window.google.maps.Point(0, 0),
          anchor: new window.google.maps.Point(24, 24)
        };
        
        const marker = new window.google.maps.Marker({
          position: initialPosition,
          map: map,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
          icon: customBikeIcon
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
            
            if (!isWithinNetherlands(newLocation)) {
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
