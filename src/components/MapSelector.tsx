
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";
import { calculateDistance, isWithinAmsterdam } from "@/utils/locationUtils";
import { cn } from "@/lib/utils";
import { AlertTriangle, Bike, RefreshCw } from "lucide-react";
import PlacesAutocomplete from "./PlacesAutocomplete";

interface MapSelectorProps {
  className?: string;
}

const MapSelector: React.FC<MapSelectorProps> = ({ className }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const {
    apiKey,
    currentLocation,
    setGuessedLocation,
    gameState,
    setGameState,
    startNewGame,
    guessedLocation,
  } = useGame();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGuessReady, setIsGuessReady] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [invalidLocation, setInvalidLocation] = useState(false);
  const [loadingMaps, setLoadingMaps] = useState(true);
  const [hasGuessed, setHasGuessed] = useState(gameState === "result");

  useEffect(() => {
    setHasGuessed(gameState === "result");
  }, [gameState]);

  useEffect(() => {
    if (gameState === "playing") {
      setInvalidLocation(false);
    }
  }, [gameState]);

  useEffect(() => {
    if (!apiKey) {
      return;
    }

    const loadMap = async () => {
      const google = window.google;
      const mapDiv = mapRef.current;

      if (!mapDiv) {
        console.error("Map container not found");
        return;
      }

      const mapOptions: google.maps.MapOptions = {
        center: { lat: 52.3667, lng: 4.9 },
        zoom: 12,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: "cooperative",
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      };

      const newMap = new google.maps.Map(mapDiv, mapOptions);

      const newMarker = new google.maps.Marker({
        map: newMap,
        draggable: true,
        animation: google.maps.Animation.DROP,
        position: newMap.getCenter(),
      });

      newMarker.addListener("dragstart", () => {
        setIsDragging(true);
        setInvalidLocation(false);
      });

      newMarker.addListener("dragend", () => {
        setIsDragging(false);
        if (newMarker.getPosition()) {
          const newPos = {
            lat: newMarker.getPosition()!.lat(),
            lng: newMarker.getPosition()!.lng(),
          };
          setIsGuessReady(true);
          if (!isWithinAmsterdam(newPos)) {
            setInvalidLocation(true);
            setIsGuessReady(false);
          }
        }
      });

      setMap(newMap);
      setMarker(newMarker);
      setLoadingMaps(false);
    };

    loadMap();
  }, [apiKey]);

  useEffect(() => {
    if (map && currentLocation && marker) {
      const google = window.google;
      const target = new google.maps.LatLng(
        currentLocation.lat,
        currentLocation.lng
      );
      map.setCenter(target);
      marker.setPosition(target);
      setIsGuessReady(true);
    }
  }, [map, currentLocation, marker]);

  const handleConfirmGuess = async () => {
    if (!map || !marker || !currentLocation) return;

    setIsCalculating(true);
    setGameState("guessing");

    const guessedLat = marker.getPosition()!.lat();
    const guessedLng = marker.getPosition()!.lng();

    const distance = calculateDistance(
      { lat: currentLocation.lat, lng: currentLocation.lng },
      { lat: guessedLat, lng: guessedLng }
    );

    setGuessedLocation({
      lat: guessedLat,
      lng: guessedLng,
      distance: distance,
    });

    setTimeout(() => {
      setIsCalculating(false);
      setGameState("result");
    }, 1500);
  };

  const handlePlaceSelected = (location: google.maps.LatLngLiteral) => {
    if (!map || !marker) {
      return;
    }

    if (location) {
      const lat = location.lat;
      const lng = location.lng;

      if (!isWithinAmsterdam(location)) {
        setInvalidLocation(true);
        setIsGuessReady(false);
        return;
      }

      setInvalidLocation(false);
      map.setCenter({ lat: lat, lng: lng });
      marker.setPosition({ lat: lat, lng: lng });
      setIsGuessReady(true);
    } else {
      console.error("No location found");
    }
  };

  return (
    <div 
      ref={mapRef} 
      className={cn(
        "w-full h-full rounded-xl",
        className
      )}
    >
      {loadingMaps ? (
        <div className="w-full h-full flex items-center justify-center bg-dark-background/50 rounded-xl">
          <div className="text-center amsterdam-fade-in">
            <div className="spinner mx-auto mb-4"></div>
            <h2 className="text-lg font-light text-white">Loading Map...</h2>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full rounded-xl overflow-hidden">
          {!hasGuessed && (
            <div className="absolute top-4 left-4 right-28 z-10">
              <PlacesAutocomplete
                onPlaceSelected={handlePlaceSelected}
                className=""
              />
            </div>
          )}
          
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="canal"
              size="sm"
              onClick={startNewGame}
              className="font-light canal-ripple text-xs px-2 py-1 h-8"
            >
              <RefreshCw size={14} className="mr-1" />
              New Location
            </Button>
          </div>
          
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center">
            <div className="neo-blur p-3 mb-3 flex items-center gap-2 text-sm text-white">
              <Bike size={16} className="text-dutch-orange" />
              <span>{isDragging ? "Release to place marker" : "Drag the marker to select your guess"}</span>
            </div>
            
            {invalidLocation && (
              <div className="flex items-center gap-2 text-xs text-destructive animate-pulse mb-3">
                <AlertTriangle size={14} />
                <span>Invalid location: Outside of Amsterdam</span>
              </div>
            )}
            
            <Button
              onClick={handleConfirmGuess}
              disabled={!isGuessReady || isCalculating || invalidLocation}
              variant="amsterdam"
              size="lg"
              className="font-light tracking-wide canal-ripple"
            >
              {isCalculating ? (
                <div className="flex items-center gap-2">
                  <div className="spinner w-4 h-4"></div>
                  <span>Calculating...</span>
                </div>
              ) : "Confirm Guess"}
            </Button>
          </div>
          
          <div id="map" className="w-full h-full"></div>
        </div>
      )}
    </div>
  );
};

export default MapSelector;
