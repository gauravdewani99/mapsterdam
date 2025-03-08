
import React, { useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";
import { RefreshCw, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const ResultModal: React.FC = () => {
  const { gameState, currentLocation, currentLocationName, guessedLocation, distance, startNewGame } = useGame();
  const mapRef = useRef<HTMLDivElement>(null);
  
  const isOpen = gameState === "result";
  const isSuccessful = distance !== null && distance <= 1;
  const formattedDistance = distance !== null ? `${Math.round(distance)} km` : "Calculating...";
  const locationDisplay = currentLocationName || "an interesting location in Amsterdam";

  // Initialize the result map when the modal is open
  useEffect(() => {
    if (!isOpen || !mapRef.current || !currentLocation || !guessedLocation || !window.google || !window.google.maps) {
      return;
    }

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

    // Add marker for the guessed location - using orange to match branding
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
      <DialogContent className="max-w-md p-0 overflow-hidden bg-gradient-to-br from-dark-secondary to-dark-background border-dark-border/70 shadow-lg animate-scale-in rounded-xl">
        {/* Map display - takes up more space in the new design */}
        <div className="w-full h-48 relative">
          <div ref={mapRef} className="w-full h-full rounded-t-xl"></div>
        </div>
        
        {/* Result content */}
        <div className="p-5 bg-dark-secondary/80">
          {/* Success/failure badge */}
          <div className={cn(
            "inline-block px-3 py-1 rounded-full text-sm font-medium mb-3",
            isSuccessful ? "bg-green-500/30 text-green-300" : "bg-dutch-orange/30 text-dutch-orange"
          )}>
            {isSuccessful ? "Great Guess!" : "Nice Try!"}
          </div>
          
          {/* Main result card */}
          <Card className="bg-dark-primary/40 border-dark-border/50 mb-4 overflow-hidden">
            <CardContent className="p-0">
              {/* Distance result */}
              <div className="p-4 border-b border-dark-border/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Your Result</h3>
                    <p className="text-muted-foreground text-sm">
                      {isSuccessful 
                        ? "You're within 1 kilometer of the location!"
                        : `You missed by ${formattedDistance}`}
                    </p>
                  </div>
                  <div className={cn(
                    "text-2xl font-bold",
                    isSuccessful ? "text-green-400" : "text-dutch-orange"
                  )}>
                    {isSuccessful ? "🎯" : formattedDistance}
                  </div>
                </div>
              </div>
              
              {/* Location information */}
              <div className="p-4 flex items-start">
                <MapPin className="text-dutch-orange mr-2 mt-0.5 h-5 w-5 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-medium">Actual Location</h3>
                  <p className="text-muted-foreground text-sm">{locationDisplay}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Play again button */}
          <Button 
            onClick={startNewGame}
            className="w-full bg-gradient-to-r from-dutch-orange to-dutch-red hover:bg-dutch-orange text-white transition-all"
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
