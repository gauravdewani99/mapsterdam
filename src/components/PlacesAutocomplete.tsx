
import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";
import { Search, X, Bike } from "lucide-react";
import { isWithinAmsterdam } from "@/utils/locationUtils";
import { cn } from "@/lib/utils";

interface PlacesAutocompleteProps {
  onPlaceSelected: (location: google.maps.LatLngLiteral) => void;
  className?: string;
}

const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({ 
  onPlaceSelected,
  className 
}) => {
  const { apiKey } = useGame();
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [isInvalid, setIsInvalid] = useState<boolean>(false);
  
  useEffect(() => {
    if (!apiKey || !inputRef.current || !window.google || !window.google.maps || !window.google.maps.places) return;
    
    // Amsterdam bounds for restricting search results
    const amsterdamBounds = {
      north: 52.4308,
      south: 52.3182,
      east: 5.0219,
      west: 4.7287
    };
    
    const bounds = new window.google.maps.LatLngBounds(
      new window.google.maps.LatLng(amsterdamBounds.south, amsterdamBounds.west),
      new window.google.maps.LatLng(amsterdamBounds.north, amsterdamBounds.east)
    );
    
    // Initialize autocomplete
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      bounds: bounds,
      componentRestrictions: { country: "nl" },
      fields: ["geometry", "name"],
      strictBounds: true
    });
    
    autocompleteRef.current = autocomplete;
    
    // Add listener for place selection
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      
      if (!place.geometry || !place.geometry.location) {
        console.error("No location data for this place");
        return;
      }
      
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
      
      // Check if the selected place is within Amsterdam
      if (!isWithinAmsterdam(location)) {
        setIsInvalid(true);
        setTimeout(() => setIsInvalid(false), 3000);
        return;
      }
      
      setIsInvalid(false);
      onPlaceSelected(location);
    });
    
    return () => {
      // Clean up the autocomplete listener
      if (autocompleteRef.current && window.google) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [apiKey, onPlaceSelected]);
  
  const handleClear = () => {
    setSearchValue("");
    setIsInvalid(false);
  };
  
  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "relative flex items-center transition-all",
        isInvalid ? "animate-shake" : ""
      )}>
        <div className="absolute left-3 z-10 text-gray-400">
          <Search className="h-4 w-4" />
        </div>
        
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for a place in Amsterdam..."
          className={cn(
            "pl-10 pr-10 neo-input transition-colors rounded-full h-11",
            "shadow-[0_0_10px_rgba(59,130,246,0.1)] backdrop-blur-lg border-white/10",
            isInvalid ? "border-destructive text-destructive" : ""
          )}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        
        {searchValue && (
          <div className="absolute right-3 z-10">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-white"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      {isInvalid && (
        <div className="absolute right-0 -bottom-8 text-xs text-destructive font-medium animate-fade-in flex items-center">
          <Bike className="h-3 w-3 mr-1" />
          <span>Invalid location: Outside of Amsterdam</span>
        </div>
      )}
    </div>
  );
};

export default PlacesAutocomplete;
