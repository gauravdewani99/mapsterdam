
import React, { useEffect, useRef, useState } from "react";
import { useGame } from "@/context/GameContext";
import { getRandomLocation } from "@/utils/locationUtils";
import { cn } from "@/lib/utils";

interface StreetViewProps {
  className?: string;
}

const StreetView: React.FC<StreetViewProps> = ({ className }) => {
  const { 
    apiKey, 
    setCurrentLocation, 
    currentLocation, 
    gameState,
    loadingMaps,
    setLoadingMaps
  } = useGame();
  
  const mapRef = useRef<HTMLDivElement>(null);
  const streetViewRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const [loadingStreetView, setLoadingStreetView] = useState(true);

  // Initialize Street View when component mounts
  useEffect(() => {
    if (!apiKey || !mapRef.current || gameState !== "playing") return;

    const loadMapsScript = () => {
      setLoadingMaps(true);
      
      // Check if Google Maps API is already loaded
      if (window.google && window.google.maps) {
        initializeStreetView();
        return;
      }

      // Create and load the script
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeStreetView;
      script.onerror = () => {
        console.error("Failed to load Google Maps API");
        setLoadingMaps(false);
      };
      document.head.appendChild(script);
    };

    const initializeStreetView = () => {
      if (!mapRef.current) return;

      setLoadingStreetView(true);
      
      try {
        // Generate a random location with Street View
        const randomLocation = getRandomLocation();
        
        // Initialize StreetView panorama
        const panorama = new google.maps.StreetViewPanorama(mapRef.current, {
          position: randomLocation,
          pov: { heading: 0, pitch: 0 },
          zoom: 1,
          addressControl: false,
          showRoadLabels: false,
          motionTracking: false,
          motionTrackingControl: false,
          fullscreenControl: false,
          enableCloseButton: false,
          linksControl: true
        });
        
        streetViewRef.current = panorama;
        
        // Listen for position changes
        panorama.addListener("position_changed", () => {
          if (streetViewRef.current) {
            const position = streetViewRef.current.getPosition();
            if (position) {
              setCurrentLocation({
                lat: position.lat(),
                lng: position.lng()
              });
            }
          }
        });
        
        // Set initial location
        setCurrentLocation(randomLocation);
        setLoadingStreetView(false);
        setLoadingMaps(false);
      } catch (error) {
        console.error("Error initializing Street View:", error);
        setLoadingStreetView(false);
        setLoadingMaps(false);
      }
    };

    loadMapsScript();
  }, [apiKey, gameState]);

  // Add keyboard navigation for Street View
  useEffect(() => {
    if (!streetViewRef.current || gameState !== "playing") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!streetViewRef.current) return;
      
      const panorama = streetViewRef.current;
      const currentPOV = panorama.getPov();
      
      switch (e.key) {
        case "ArrowUp":
          panorama.setPov({
            heading: currentPOV.heading,
            pitch: Math.min(currentPOV.pitch + 10, 90)
          });
          break;
        case "ArrowDown":
          panorama.setPov({
            heading: currentPOV.heading,
            pitch: Math.max(currentPOV.pitch - 10, -90)
          });
          break;
        case "ArrowLeft":
          panorama.setPov({
            heading: (currentPOV.heading - 10) % 360,
            pitch: currentPOV.pitch
          });
          break;
        case "ArrowRight":
          panorama.setPov({
            heading: (currentPOV.heading + 10) % 360,
            pitch: currentPOV.pitch
          });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [streetViewRef.current, gameState]);

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      {(loadingMaps || loadingStreetView) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="spinner mx-auto mb-3"></div>
            <p className="text-lg font-light">Loading Street View...</p>
          </div>
        </div>
      )}

      <div 
        ref={mapRef}
        className={cn(
          "w-full h-full transition-opacity duration-500",
          (loadingMaps || loadingStreetView) ? "opacity-50" : "opacity-100"
        )}
      />
      
      {gameState === "playing" && (
        <div className="absolute bottom-4 left-4 z-10 glass-panel px-4 py-2 text-sm">
          <span>Navigate using arrow keys</span>
        </div>
      )}
    </div>
  );
};

export default StreetView;
