import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";
import { calculateDistance, isWithinAmsterdam } from "@/utils/locationUtils";
import { cn } from "@/lib/utils";
import { AlertTriangle, MapPin } from "lucide-react";
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
    setLoadingMaps,
    startNewGame
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
              "stylers": [{ "color": "#212835" }]
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
        
        const initialPosition = amsterdamCenter;
        
        // Create custom marker with enhanced visibility
        const marker = new window.google.maps.Marker({
          position: initialPosition,
          map: map,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: "#ff6b35",
            fillOpacity: 0.9,
            strokeColor: "#ffffff",
            strokeWeight: 3,
            scale: 12,
            strokeOpacity: 1,
          }
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
          <div className="absolute top-2 sm:top-4 left-0 right-0 z-10 flex justify-center">
            <div className="glow-panel px-3 sm:px-4 py-2 w-full max-w-md mx-2 sm:mx-4">
              <PlacesAutocomplete 
                onPlaceSelected={handlePlaceSelected} 
                className="w-full"
              />
            </div>
          </div>
          
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 z-20">
            <Button
              onClick={handleConfirmGuess}
              disabled={!isGuessReady || isCalculating || invalidLocation}
              variant="amsterdam" 
              size="lg" 
              className="font-semibold tracking-wide h-11 sm:h-12 px-6 sm:px-8 text-base sm:text-lg shadow-xl"
            >
              {isCalculating ? (
                <div className="flex items-center gap-2">
                  <div className="spinner !w-4 !h-4"></div>
                  <span className="hidden sm:inline">Calculating...</span>
                  <span className="sm:hidden">Calculating</span>
                </div>
              ) : (
                <>
                  <span className="hidden sm:inline">Confirm Guess</span>
                  <span className="sm:hidden">Confirm</span>
                </>
              )}
            </Button>
          </div>
          
          <div className="absolute bottom-12 sm:bottom-16 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-3 sm:p-4 mb-2 sm:mb-3 flex items-center gap-2 text-xs sm:text-sm text-white max-w-[90vw] sm:max-w-none shadow-lg">
              <MapPin size={16} className="text-orange-400 flex-shrink-0 drop-shadow-lg" />
              <span className="text-center font-medium">{isDragging ? "Release to place marker" : "Drag the bright marker to guess"}</span>
            </div>
            
            {invalidLocation && (
              <div className="flex items-center gap-2 text-xs text-red-300 animate-pulse mb-2 sm:mb-3 bg-red-500/20 backdrop-blur-lg border border-red-400/30 px-3 py-2 rounded-xl shadow-lg">
                <AlertTriangle size={14} />
                <span className="font-medium">Outside Amsterdam</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MapSelector;
