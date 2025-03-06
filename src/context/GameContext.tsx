
import React, { createContext, useContext, useState, ReactNode } from "react";

interface GameContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  currentLocation: google.maps.LatLngLiteral | null;
  setCurrentLocation: (location: google.maps.LatLngLiteral | null) => void;
  guessedLocation: google.maps.LatLngLiteral | null;
  setGuessedLocation: (location: google.maps.LatLngLiteral | null) => void;
  distance: number | null;
  setDistance: (distance: number | null) => void;
  gameState: "initial" | "playing" | "guessing" | "result";
  setGameState: (state: "initial" | "playing" | "guessing" | "result") => void;
  isWinner: boolean;
  setIsWinner: (isWinner: boolean) => void;
  loadingMaps: boolean;
  setLoadingMaps: (loading: boolean) => void;
  startNewGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string>("");
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [guessedLocation, setGuessedLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [gameState, setGameState] = useState<"initial" | "playing" | "guessing" | "result">("initial");
  const [isWinner, setIsWinner] = useState<boolean>(false);
  const [loadingMaps, setLoadingMaps] = useState<boolean>(false);

  const startNewGame = () => {
    setCurrentLocation(null);
    setGuessedLocation(null);
    setDistance(null);
    setGameState("playing");
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
