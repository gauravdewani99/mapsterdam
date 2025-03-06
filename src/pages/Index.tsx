
import React from "react";
import { GameProvider, useGame } from "@/context/GameContext";
import ApiKeyForm from "@/components/ApiKeyForm";
import ApiKeyError from "@/components/ApiKeyError";
import StreetView from "@/components/StreetView";
import MapSelector from "@/components/MapSelector";
import ResultModal from "@/components/ResultModal";
import { Button } from "@/components/ui/button";
import { MapPin, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const GameContent: React.FC = () => {
  const { apiKey, gameState, startNewGame } = useGame();

  // Show loading state
  if (gameState === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <h2 className="text-xl font-light text-white">Loading GeoQuest...</h2>
          <p className="text-muted-foreground mt-2">Connecting to Google Maps</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (gameState === "error") {
    return <ApiKeyError />;
  }

  // We no longer need this check since we're managing the API key on the backend
  // Now we use this state to show the initial "Start Game" screen
  if (gameState === "initial") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md neo-blur p-8 animate-scale-in">
          <h1 className="text-3xl font-light mb-4 text-white">Welcome to GeoQuest Netherlands</h1>
          <p className="text-muted-foreground mb-6">
            Explore the Netherlands and test your geography skills. Can you guess where you are?
          </p>
          <Button 
            onClick={startNewGame}
            className="w-full h-12 font-light tracking-wide button-glow"
          >
            <MapPin className="mr-2" />
            Start Adventure
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col">
      <div className="flex flex-col items-center px-6 py-4">
        <h1 className="text-2xl font-light tracking-tight text-white">GeoQuest <span className="text-primary">Netherlands</span></h1>
        <p className="text-muted-foreground mt-1 text-center text-sm max-w-md">
          Explore Dutch streets in Street View and pin your guess on the map. How close can you get?
        </p>
      </div>
      
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cn(
          "w-full h-[calc(100vh-15rem)] min-h-[400px] transition-all duration-500 flex flex-col",
        )}>
          <div className="flex-1 shadow-glow rounded-xl overflow-hidden">
            <StreetView className="w-full h-full" />
          </div>
          
          {gameState === "playing" && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={startNewGame}
                className="font-light dark-button"
              >
                <RefreshCw size={14} className="mr-2" />
                New Location
              </Button>
            </div>
          )}
        </div>
        
        <div className={cn(
          "w-full h-[calc(100vh-15rem)] min-h-[400px] transition-all duration-500",
          "shadow-glow rounded-xl"
        )}>
          <MapSelector className="w-full h-full" />
        </div>
      </div>
      
      <ResultModal />
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <GameProvider>
      <div className="min-h-screen bg-gradient-to-br from-dark-background to-dark-secondary animate-fade-in">
        <GameContent />
      </div>
    </GameProvider>
  );
};

export default Index;
