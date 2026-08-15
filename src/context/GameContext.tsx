
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
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
  currentLocationName: string | null;
  setCurrentLocationName: (name: string | null) => void;
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
  const [currentLocationName, setCurrentLocationName] = useState<string | null>(null);
  const { toast } = useToast();

  // The Maps key is a build-time env var rather than a server round-trip.
  // A Maps JS key is necessarily public (the browser sends it to Google either
  // way), so it is protected by HTTP referrer + API restrictions in the Google
  // Cloud console, not by hiding it behind an endpoint.
  const fetchApiKey = async () => {
    setGameState("loading");

    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!key) {
      console.error('VITE_GOOGLE_MAPS_API_KEY is not set at build time.');
      setErrorMessage(
        "Google Maps API key is not configured. Set VITE_GOOGLE_MAPS_API_KEY and rebuild the app."
      );
      setGameState("error");
      toast({
        title: "Configuration error",
        description: "Google Maps API key is missing.",
        variant: "destructive",
      });
      return;
    }

    setApiKey(key);
    setErrorMessage(null);
    setGameState("initial");
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
    setCurrentLocationName(null);
    
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
        currentLocationName,
        setCurrentLocationName,
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
