
import React, { useEffect, useRef, useState } from "react";
import { useGame } from "@/context/GameContext";
import { getRandomLocation } from "@/utils/locationUtils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Zap, Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const scriptLoadedRef = useRef(false);
  const [showClue, setShowClue] = useState(false);

  // Function to load a new random location
  const loadRandomLocation = () => {
    if (!streetViewRef.current || gameState !== "playing") return;
    
    setLoadingStreetView(true);
    const randomLocation = getRandomLocation();
    
    try {
      streetViewRef.current.setPosition(randomLocation);
      setCurrentLocation(randomLocation);
      setLoadingStreetView(false);
    } catch (error) {
      console.error("Error setting new Street View location:", error);
      setLoadingStreetView(false);
    }
  };

  // Make the function available to GameContext via the ref
  useEffect(() => {
    // Update the location when "New Location" is clicked
    if (gameState === "playing" && !currentLocation && streetViewRef.current) {
      loadRandomLocation();
    }
  }, [gameState, currentLocation]);

  // Initialize Street View when component mounts
  useEffect(() => {
    if (!apiKey || !mapRef.current || gameState !== "playing") return;

    const loadMapsScript = () => {
      setLoadingMaps(true);
      
      // Check if Google Maps API is already loaded and fully initialized
      if (window.google && window.google.maps && window.google.maps.StreetViewPanorama) {
        initializeStreetView();
        return;
      }

      // If script is already being loaded, wait for it
      if (scriptLoadedRef.current) {
        const checkGoogleMapsInterval = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.StreetViewPanorama) {
            clearInterval(checkGoogleMapsInterval);
            initializeStreetView();
          }
        }, 100);
        return;
      }

      // Create and load the script
      scriptLoadedRef.current = true;
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.defer = true;
      
      script.onload = () => {
        // Add a small delay to ensure API is fully initialized
        setTimeout(initializeStreetView, 100);
      };
      
      script.onerror = () => {
        console.error("Failed to load Google Maps API");
        setLoadingMaps(false);
        scriptLoadedRef.current = false;
      };
      document.head.appendChild(script);
    };

    const initializeStreetView = () => {
      if (!mapRef.current || !window.google || !window.google.maps || !window.google.maps.StreetViewPanorama) {
        console.error("Google Maps API not fully loaded yet");
        setLoadingMaps(false);
        return;
      }

      setLoadingStreetView(true);
      
      try {
        // Generate a random location with Street View in the Netherlands
        const randomLocation = getRandomLocation();
        
        // Initialize StreetView panorama
        const panorama = new window.google.maps.StreetViewPanorama(mapRef.current, {
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

  const toggleClue = () => {
    setShowClue(!showClue);
  };

  // Generate a random clue based on the location
  const getRandomClue = () => {
    const clues = [
      "This area is known for its historic architecture.",
      "Look for water nearby - this might be close to a canal.",
      "Notice the style of buildings - typical Amsterdam residential area.",
      "This area might be close to a major landmark or tourist attraction.",
      "The street layout here follows Amsterdam's concentric canal pattern.",
      "This neighborhood likely has shops and cafes nearby.",
      "The architecture suggests this is in a more modern part of the city.",
      "This could be near one of Amsterdam's many parks or green spaces."
    ];
    
    return clues[Math.floor(Math.random() * clues.length)];
  };

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      {(loadingMaps || loadingStreetView) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="spinner mx-auto mb-3"></div>
            <p className="text-lg font-light text-white">Loading Street View...</p>
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
      
      {/* AI Clue Button */}
      {gameState === "playing" && !loadingStreetView && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <Button 
            variant="amsterdam" 
            size="lg" 
            onClick={toggleClue}
            className="shadow-lg canal-ripple"
          >
            <Zap className="mr-1" />
            <Bot className="mr-1" />
            AI Clue
          </Button>
        </div>
      )}

      {/* AI Clue Window */}
      {showClue && gameState === "playing" && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 w-[90%] max-w-md">
          <Card className="bg-dark-card/90 backdrop-blur-md border-dark-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-light flex items-center">
                <Bot className="mr-2 text-dutch-orange" size={18} />
                AI Location Clue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{getRandomClue()}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StreetView;
