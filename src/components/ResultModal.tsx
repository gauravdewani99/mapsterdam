
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

    // Add marker for the guessed location
    new window.google.maps.Marker({
      position: guessedLocation,
      map: map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#3b82f6", // blue
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
      <DialogContent className="glass-panel border-none max-w-lg animate-scale-in">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-light mb-2">
            {isWinner ? "Impressive!" : "Not Quite..."}
          </DialogTitle>
          <DialogDescription className="text-base">
            {isWinner 
              ? "You have a remarkable sense of geography!"
              : "Keep exploring and improving your geographic intuition."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-3 space-y-3">
          <div 
            className={cn(
              "flex items-center justify-center w-16 h-16 rounded-full",
              isWinner 
                ? "bg-green-100/20 text-green-500" 
                : "bg-red-100/20 text-red-500"
            )}
          >
            {isWinner 
              ? <CheckCircle size={32} /> 
              : <XCircle size={32} />}
          </div>
          
          <div className="text-center mb-2">
            <h3 className="text-xl font-medium mb-1">
              {isWinner ? "You Won!" : "You Lost"}
            </h3>
            <p className="text-muted-foreground">
              {distance !== null && (
                <>Your guess was <span className="font-medium text-white">{formatDistance(distance)}</span> away</>
              )}
            </p>
          </div>
          
          <div className="w-full h-48 rounded-lg overflow-hidden">
            <div ref={mapRef} className="w-full h-full"></div>
          </div>
          
          <div className="w-full flex flex-col space-y-1 text-sm text-muted-foreground mt-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span>Actual Location</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span>Your Guess</span>
            </div>
          </div>
        </div>
        
        <div className="mt-2">
          <Button 
            onClick={startNewGame}
            className="w-full bg-primary/90 hover:bg-primary button-hover-effect"
          >
            <RefreshCw size={16} className="mr-2" />
            New Game
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResultModal;
