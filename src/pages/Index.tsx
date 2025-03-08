
import React from "react";
import { GameProvider, useGame } from "@/context/GameContext";
import ApiKeyForm from "@/components/ApiKeyForm";
import ApiKeyError from "@/components/ApiKeyError";
import StreetView from "@/components/StreetView";
import MapSelector from "@/components/MapSelector";
import ResultModal from "@/components/ResultModal";
import { Button } from "@/components/ui/button";
import { Bike, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const GameContent: React.FC = () => {
  const { apiKey, gameState, startNewGame } = useGame();

  if (gameState === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center amsterdam-fade-in">
          <div className="spinner mx-auto mb-4"></div>
          <h2 className="text-xl font-light text-white">Loading Mapsterdam...</h2>
          <p className="text-muted-foreground mt-2">Connecting to Google Maps</p>
        </div>
      </div>
    );
  }

  if (gameState === "error") {
    return <ApiKeyError />;
  }

  if (gameState === "initial") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 dutch-pattern">
        <div className="text-center max-w-md neo-blur p-10 amsterdam-fade-in">
          <h1 className="text-4xl font-light mb-2 text-white flex items-center justify-center">
            Mapsterdam <Bike className="text-dutch-orange h-7 w-7 ml-2" />
          </h1>
          <p className="text-muted-foreground mb-6">Welcome to the GeoGuessr for Amsterdam!</p>
          <div className="text-muted-foreground mb-8 space-y-2">
            <p>Explore the city.</p>
            <p>Get an AI clue about the street you are on.</p>
            <p>Guess where you are.</p>
          </div>
          <Button 
            onClick={startNewGame}
            className="w-full h-14 text-lg font-light tracking-wide button-glow canal-ripple"
            variant="amsterdam"
            size="xl"
          >
            Start Guessing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col">
      <div className="flex flex-col items-center px-6 py-5">
        <h1 className="text-3xl font-light tracking-tight text-white flex items-center">
          Mapsterdam <Bike className="text-dutch-orange h-6 w-6 ml-2" />
        </h1>
        <p className="text-muted-foreground mt-1 mb-2">Welcome to the GeoGuessr for Amsterdam!</p>
        <p className="text-muted-foreground text-center text-base max-w-lg mb-2 px-4">
          Explore the city. Get an AI clue about the street you are on.<br />
          Guess where you are.
        </p>
      </div>
      
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={cn(
          "w-full h-[calc(100vh-16rem)] min-h-[450px] transition-all duration-500 flex flex-col relative",
        )}>
          <div className="flex-1 shadow-glow rounded-xl overflow-hidden">
            <StreetView className="w-full h-full" />
          </div>
          
          {gameState === "playing" && (
            <div className="absolute top-5 right-5 z-10">
              <Button
                variant="canal"
                size="sm"
                onClick={startNewGame}
                className="font-light canal-ripple text-sm px-3 py-2 h-10"
              >
                <RefreshCw size={16} className="mr-2" />
                New Location
              </Button>
            </div>
          )}
        </div>
        
        <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 h-[calc(100vh-16rem)] min-h-[450px] mt-6">
          <Separator orientation="vertical" className="h-full bg-gray-700/30" />
        </div>
        
        <div className="block lg:hidden w-full">
          <Separator className="bg-gray-700/30 my-3" />
        </div>
        
        <div className={cn(
          "w-full h-[calc(100vh-16rem)] min-h-[450px] transition-all duration-500",
          "shadow-glow rounded-xl"
        )}>
          <MapSelector className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <GameProvider>
      <div className="min-h-screen bg-dark-background animate-fade-in">
        <GameContent />
        <ResultModal />
      </div>
    </GameProvider>
  );
};

export default Index;
