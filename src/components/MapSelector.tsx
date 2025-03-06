
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";
import { calculateDistance } from "@/utils/locationUtils";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

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
  
  const [isGuessReady, setIsGuessReady] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Initialize Google Maps when component mounts
  useEffect(() => {
    if (!apiKey || !mapRef.current || gameState !== "playing" || loadingMaps) return;

    const loadMapsScript = () => {
      setLoadingMaps(true);
      
      // Check if Google Maps API is already loaded
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Create and load the script
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => {
        console.error("Failed to load Google Maps API");
        setLoadingMaps(false);
      };
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current) return;
      
      try {
        // Initialize the map centered on a neutral location (world view)
        const mapOptions: google.maps.MapOptions = {
          center: { lat: 20, lng: 0 },
          zoom: 2,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: true,
          zoomControl: true,
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          styles: [
            {
              featureType: "all",
              elementType: "labels",
              stylers: [{ visibility: "on" }]
            }
          ]
        };

        const map = new google.maps.Map(mapRef.current, mapOptions);
        googleMapRef.current = map;

        // Add click listener to place a marker
        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          
          // Remove existing marker if any
          if (markerRef.current) {
            markerRef.current.setMap(null);
          }
          
          // Create new marker
          const marker = new google.maps.Marker({
            position: e.latLng,
            map: map,
            animation: google.maps.Animation.DROP,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#3b82f6",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2
            }
          });
          
          markerRef.current = marker;
          
          // Update guess location
          const latLng = e.latLng.toJSON();
          setGuessedLocation(latLng);
          setIsGuessReady(true);
        });
        
        setLoadingMaps(false);
      } catch (error) {
        console.error("Error initializing Map:", error);
        setLoadingMaps(false);
      }
    };

    loadMapsScript();
  }, [apiKey, gameState, loadingMaps]);

  const handleConfirmGuess = () => {
    if (!currentLocation || !guessedLocation) return;
    
    setIsCalculating(true);
    
    // Simulate calculation for better UX
    setTimeout(() => {
      const distance = calculateDistance(currentLocation, guessedLocation);
      const isWinner = distance <= 500; // Win if within 500km
      
      setDistance(distance);
      setIsWinner(isWinner);
      setGameState("result");
      setIsCalculating(false);
    }, 1000);
  };

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      {loadingMaps && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="spinner mx-auto mb-3"></div>
            <p className="text-lg font-light">Loading Map...</p>
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
        <div className="absolute bottom-4 right-4 z-10 glass-panel p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1 text-sm">
            <MapPin size={16} className="text-primary" />
            <span>Click on the map to place your guess</span>
          </div>
          
          <Button
            onClick={handleConfirmGuess}
            disabled={!isGuessReady || isCalculating}
            className={cn(
              "w-full bg-primary/90 hover:bg-primary transition-all duration-300",
              "font-light tracking-wide button-hover-effect"
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
      )}
    </div>
  );
};

export default MapSelector;
