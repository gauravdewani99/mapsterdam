
import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const ResultModal: React.FC = () => {
  const { gameState, currentLocation, guessedLocation, distance, startNewGame } = useGame();
  const mapRef = useRef<HTMLDivElement>(null);
  const [actualStreet, setActualStreet] = useState<string>("Loading...");
  const [guessedStreet, setGuessedStreet] = useState<string>("Loading...");
  
  const isOpen = gameState === "result";
  const isSuccessful = distance !== null && distance <= 1;
  const formattedDistance = distance !== null ? `${Math.round(distance)} km` : "Calculating...";

  // Function to fetch street name based on coordinates
  const fetchStreetName = async (location: google.maps.LatLngLiteral, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (!window.google || !window.google.maps) {
      setter("Street name unavailable");
      return;
    }

    try {
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ location }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK && results && results.length > 0) {
          // Look for the street name in address components
          const addressComponents = results[0].address_components;
          const streetComponent = addressComponents.find(
            component => component.types.includes("route")
          );
          
          if (streetComponent) {
            setter(streetComponent.long_name);
          } else {
            // If no street component found, use formatted address
            setter(results[0].formatted_address.split(',')[0]);
          }
        } else {
          setter("Unknown street");
        }
      });
    } catch (error) {
      console.error("Error fetching street name:", error);
      setter("Street name unavailable");
    }
  };

  // Initialize the result map and fetch street names when the modal is open
  useEffect(() => {
    if (!isOpen || !mapRef.current || !currentLocation || !guessedLocation || !window.google || !window.google.maps) {
      return;
    }

    // Fetch street names
    fetchStreetName(currentLocation, setActualStreet);
    fetchStreetName(guessedLocation, setGuessedStreet);

    const map = new window.google.maps.Map(mapRef.current, {
      center: currentLocation,
      zoom: 10,
      disableDefaultUI: true,
      zoomControl: true,
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
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [{ "color": "#17263c" }]
        }
      ]
    });

    // Add marker for the actual location
    new window.google.maps.Marker({
      position: currentLocation,
      map: map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#10b981", // green
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2
      },
      title: "Actual Location"
    });

    // Add marker for the guessed location - now using orange to match branding
    new window.google.maps.Marker({
      position: guessedLocation,
      map: map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#e04e39", // Dutch orange
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2
      },
      title: "Your Guess"
    });

    // Draw a line between the two points
    new window.google.maps.Polyline({
      path: [currentLocation, guessedLocation],
      map: map,
      strokeColor: "#ffffff",
      strokeOpacity: 0.8,
      strokeWeight: 2
    });

    // Adjust bounds to show both markers
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(currentLocation);
    bounds.extend(guessedLocation);
    map.fitBounds(bounds, 50); // Add some padding
  }, [isOpen, currentLocation, guessedLocation]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && startNewGame()}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-gradient-to-br from-dark-secondary to-dark-background border-dark-border/70 shadow-lg animate-scale-in">
        <DialogTitle className="sr-only">Game Result</DialogTitle>
        <div className="w-full h-44 relative">
          <div ref={mapRef} className="w-full h-full"></div>
          
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-md px-2 py-1.5 text-xs">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 mr-1.5"></div>
                <span className="text-white/80">Actual</span>
              </div>
              <div className="flex items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-dutch-orange mr-1.5"></div>
                <span className="text-white/80">Your Guess</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 pt-2 bg-dark-secondary/70">
          {/* Distance display with success/failure message */}
          <div className={cn(
            "mb-3 p-3 rounded-md text-center",
            isSuccessful ? "bg-green-500/20 text-green-400" : "bg-dutch-orange/20 text-dutch-orange"
          )}>
            <p className="font-medium mb-1">
              {isSuccessful ? "Great guess!" : "Nice try!"}
            </p>
            <p className="text-sm">
              {isSuccessful
                ? "You're within 1 kilometer of the actual location!"
                : `You missed by ${formattedDistance}`}
            </p>
          </div>
          
          <div className="flex justify-between mb-3 text-sm text-white/80">
            <div className="flex-1">
              <p className="text-xs text-white/60 mb-0.5">Actual Location</p>
              <p className="font-medium truncate">{actualStreet}</p>
            </div>
            <div className="flex-1 text-right">
              <p className="text-xs text-white/60 mb-0.5">Your Guess</p>
              <p className="font-medium truncate">{guessedStreet}</p>
            </div>
          </div>
          
          <Button 
            onClick={startNewGame}
            className={cn(
              "w-full bg-gradient-to-r from-dutch-orange to-dutch-red hover:bg-dutch-orange",
              "text-white transition-all"
            )}
          >
            <RefreshCw size={16} className="mr-2" />
            Play Again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResultModal;
