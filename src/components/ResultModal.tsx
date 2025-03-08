
import React, { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";
import { formatDistance } from "@/utils/locationUtils";
import { CheckCircle, XCircle, RefreshCw, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const ResultModal: React.FC = () => {
  const { gameState, distance, isWinner, startNewGame, currentLocation, guessedLocation } = useGame();
  const mapRef = useRef<HTMLDivElement>(null);
  
  const isOpen = gameState === "result";

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
        <div className="p-5 pb-4">
          <DialogHeader className="text-center mb-2">
            <DialogTitle className={cn(
              "text-2xl font-light mb-1",
              isWinner ? "text-green-400" : "text-dutch-orange"
            )}>
              {isWinner ? "Impressive!" : "Not Quite..."}
            </DialogTitle>
            <DialogDescription className="text-base text-white/80">
              {isWinner 
                ? "You have a remarkable sense of geography!"
                : "Keep exploring and improving your geographic intuition."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center py-2 space-y-3">
            <div 
              className={cn(
                "flex items-center justify-center w-14 h-14 rounded-full",
                isWinner 
                  ? "bg-green-500/20 text-green-400" 
                  : "bg-dutch-orange/20 text-dutch-orange"
              )}
            >
              {isWinner 
                ? <CheckCircle size={28} /> 
                : <XCircle size={28} />}
            </div>
            
            <div className="text-center">
              <p className="text-white/90 mb-1">
                {distance !== null && (
                  <>Your guess was <span className="font-medium text-white">{formatDistance(distance, 2)}</span> away</>
                )}
              </p>
            </div>
          </div>
        </div>
        
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
        
        <div className="p-4 pt-3 bg-dark-secondary/70">
          <Button 
            onClick={startNewGame}
            className="w-full bg-gradient-to-r from-dutch-orange to-dutch-red hover:bg-dutch-orange text-white transition-all"
          >
            <RefreshCw size={16} className="mr-2" />
            New Adventure
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResultModal;
