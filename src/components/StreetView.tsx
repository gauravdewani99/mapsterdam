
import React, { useEffect, useRef, useState } from "react";
import { useGame } from "@/context/GameContext";
import { getRandomLocation } from "@/utils/locationUtils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sparkles, Bot, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StreetViewProps {
  className?: string;
}

const StreetView: React.FC<StreetViewProps> = ({ className }) => {
  const { 
    apiKey, 
    setCurrentLocation,
    setCurrentLocationName,
    currentLocation, 
    gameState,
    loadingMaps,
    setLoadingMaps,
    startNewGame
  } = useGame();
  
  const mapRef = useRef<HTMLDivElement>(null);
  const streetViewRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const [loadingStreetView, setLoadingStreetView] = useState(true);
  const scriptLoadedRef = useRef(false);
  const [showClue, setShowClue] = useState(false);
  const [clue, setClue] = useState<string | null>(null);
  const [loadingClue, setLoadingClue] = useState(false);
  const { toast } = useToast();
  const clueTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const locationChangedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (clueTimeoutRef.current) {
        clearTimeout(clueTimeoutRef.current);
      }
    };
  }, []);

  const fetchStreetName = async (position: google.maps.LatLng): Promise<string | null> => {
    if (!geocoderRef.current) {
      if (window.google && window.google.maps && window.google.maps.Geocoder) {
        geocoderRef.current = new window.google.maps.Geocoder();
      } else {
        return null;
      }
    }

    try {
      const response = await geocoderRef.current.geocode({ location: position });
      
      if (response.results && response.results.length > 0) {
        const addressComponents = response.results[0].address_components;
        const routeComponent = addressComponents.find(
          component => component.types.includes('route')
        );
        
        if (routeComponent) {
          setCurrentLocationName(routeComponent.long_name);
          return routeComponent.long_name;
        }
        
        const formattedAddress = response.results[0].formatted_address;
        const addressParts = formattedAddress.split(',');
        if (addressParts.length > 0) {
          setCurrentLocationName(addressParts[0].trim());
          return addressParts[0].trim();
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching street name:", error);
      return null;
    }
  };

  const generateAIClue = async () => {
    if (!streetViewRef.current || loadingClue) return;
    
    setLoadingClue(true);
    setClue(null);
    
    try {
      const position = streetViewRef.current.getPosition();
      if (!position) {
        setLoadingClue(false);
        return;
      }
      
      const streetName = await fetchStreetName(position);
      if (!streetName) {
        setClue("This area has interesting historical significance in Amsterdam.");
        setLoadingClue(false);
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('generate-clue', {
        body: { streetName, city: "Amsterdam" }
      });
      
      if (error) {
        console.error("Error generating clue:", error);
        setClue("This location has charming Dutch architecture typical of Amsterdam's historic areas.");
        toast({
          title: "Couldn't generate a clue",
          description: "Using a generic clue instead",
          variant: "destructive",
        });
      } else if (data && data.clue) {
        setClue(data.clue);
      } else {
        setClue("This neighborhood is known for its typical Amsterdam charm and character.");
      }
    } catch (error) {
      console.error("Error in generateAIClue:", error);
      setClue("This spot showcases the unique blend of old and new that defines Amsterdam.");
    } finally {
      setLoadingClue(false);
    }
  };

  const toggleClue = async () => {
    if (!showClue) {
      setShowClue(true);
      if (!clue && !loadingClue) {
        generateAIClue();
      }
    } else {
      setShowClue(false);
      
      if (clueTimeoutRef.current) {
        clearTimeout(clueTimeoutRef.current);
      }
      
      clueTimeoutRef.current = setTimeout(() => {
        setClue(null);
      }, 300);
    }
  };

  const loadRandomLocation = () => {
    if (!streetViewRef.current || gameState !== "playing") return;
    
    setLoadingStreetView(true);
    setClue(null);
    setShowClue(false);
    locationChangedRef.current = true;
    
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

  useEffect(() => {
    if (gameState === "playing" && !currentLocation && streetViewRef.current) {
      loadRandomLocation();
    }
  }, [gameState, currentLocation]);

  useEffect(() => {
    if (!apiKey || !mapRef.current || gameState !== "playing") return;

    const loadMapsScript = () => {
      setLoadingMaps(true);
      
      if (window.google && window.google.maps && window.google.maps.StreetViewPanorama) {
        initializeStreetView();
        return;
      }

      if (scriptLoadedRef.current) {
        const checkGoogleMapsInterval = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.StreetViewPanorama) {
            clearInterval(checkGoogleMapsInterval);
            initializeStreetView();
          }
        }, 100);
        return;
      }

      scriptLoadedRef.current = true;
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.defer = true;
      
      script.onload = () => {
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
        const randomLocation = getRandomLocation();
        
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
        
        if (window.google.maps.Geocoder) {
          geocoderRef.current = new window.google.maps.Geocoder();
        }
        
        panorama.addListener("position_changed", () => {
          if (streetViewRef.current) {
            const position = streetViewRef.current.getPosition();
            if (position) {
              setCurrentLocation({
                lat: position.lat(),
                lng: position.lng()
              });
              
              // Fetch and store the street name when position changes
              fetchStreetName(position);
              
              setClue(null);
              
              if (showClue) {
                setTimeout(() => {
                  generateAIClue();
                }, 500);
              }
            }
          }
        });
        
        setCurrentLocation(randomLocation);
        
        // Fetch the initial street name
        if (geocoderRef.current) {
          const position = new google.maps.LatLng(randomLocation.lat, randomLocation.lng);
          fetchStreetName(position);
        }
        
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
      
      {gameState === "playing" && !loadingStreetView && (
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <Button 
            variant="glass" 
            size="lg" 
            onClick={toggleClue}
            className="font-semibold tracking-wide h-11 sm:h-12 px-6 sm:px-8 text-base sm:text-lg shadow-xl"
          >
            <Sparkles className="mr-1 sm:mr-2 w-4 h-4" />
            AI Clue
          </Button>
        </div>
      )}

      {showClue && gameState === "playing" && (
        <div className="absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-20 w-[95%] sm:w-[90%] max-w-md px-2 sm:px-0">
          <Card className="bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden animate-fade-in rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
            <CardHeader className="relative pb-2 pt-3 sm:pt-4 px-4 sm:px-5 flex flex-row items-center justify-between">
              <CardTitle className="text-sm sm:text-base font-semibold flex items-center">
                <Bot className="mr-2 text-blue-400 drop-shadow-lg" size={16} />
                <span className="text-white">AI Location Clue</span>
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all" onClick={toggleClue}>
                ×
              </Button>
            </CardHeader>
            <CardContent className="relative px-4 sm:px-5 pb-3 sm:pb-4 pt-0">
              {loadingClue ? (
                <div className="flex items-center text-white/90 text-sm sm:text-base">
                  <Loader2 className="animate-spin mr-2 text-blue-400" size={14} />
                  Generating insight about this location...
                </div>
              ) : (
                <p className="text-white/90 text-sm sm:text-base leading-relaxed font-medium">{clue || "This area has some interesting features typical of Amsterdam's urban design."}</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StreetView;
