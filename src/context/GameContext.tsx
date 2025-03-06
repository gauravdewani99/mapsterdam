
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GameContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  currentLocation: google.maps.LatLngLiteral | null;
  setCurrentLocation: (location: google.maps.LatLngLiteral | null) => void;
  guessedLocation: google.maps.LatLngLiteral | null;
  setGuessedLocation: (location: google.maps.LatLngLiteral | null) => void;
  distance: number | null;
  setDistance: (distance: number | null) => void;
  gameState: "initial" | "loading" | "playing" | "guessing" | "result" | "error";
  setGameState: (state: "initial" | "loading" | "playing" | "guessing" | "result" | "error") => void;
  isWinner: boolean;
  setIsWinner: (isWinner: boolean) => void;
  loadingMaps: boolean;
  setLoadingMaps: (loading: boolean) => void;
  startNewGame: () => void;
  errorMessage: string | null;
  setErrorMessage: (message: string | null) => void;
  retryFetchApiKey: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string>("");
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [guessedLocation, setGuessedLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [gameState, setGameState] = useState<"initial" | "loading" | "playing" | "guessing" | "result" | "error">("loading");
  const [isWinner, setIsWinner] = useState<boolean>(false);
  const [loadingMaps, setLoadingMaps] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchApiKey = async () => {
    try {
      setGameState("loading");
      
      const { data, error } = await supabase.functions.invoke('get-maps-api-key');
      
      if (error) {
        console.error('Error fetching API key:', error);
        setErrorMessage(`Failed to retrieve Google Maps API key: ${error.message}`);
        setGameState("error");
        toast({
          title: "Error",
          description: "Failed to retrieve Google Maps API key. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      if (data && data.apiKey) {
        setApiKey(data.apiKey);
        setGameState("initial");
      } else {
        setErrorMessage("API key not found in the response.");
        setGameState("error");
        toast({
          title: "Error",
          description: "Google Maps API key not found. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in fetchApiKey:', error);
      setErrorMessage(`An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`);
      setGameState("error");
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const retryFetchApiKey = async () => {
    setErrorMessage(null);
    await fetchApiKey();
  };

  // Fetch API key on initial load
  useEffect(() => {
    fetchApiKey();
  }, []);

  const startNewGame = () => {
    setGuessedLocation(null);
    setDistance(null);
    
    // If we're already in playing state but want a new location,
    // set currentLocation to null to trigger re-initialization of Street View
    if (gameState === "playing") {
      setCurrentLocation(null);
    } else {
      setCurrentLocation(null);
      setGameState("playing");
    }
    
    setIsWinner(false);
  };

  return (
    <GameContext.Provider
      value={{
        apiKey,
        setApiKey,
        currentLocation,
        setCurrentLocation,
        guessedLocation,
        setGuessedLocation,
        distance,
        setDistance,
        gameState,
        setGameState,
        isWinner,
        setIsWinner,
        loadingMaps,
        setLoadingMaps,
        startNewGame,
        errorMessage,
        setErrorMessage,
        retryFetchApiKey,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
