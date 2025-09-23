
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
        <div className="text-center max-w-sm sm:max-w-md neo-blur p-6 sm:p-8 lg:p-10 amsterdam-fade-in mx-4">
          <h1 className="text-3xl sm:text-4xl font-light mb-2 text-white flex items-center justify-center">
            Mapsterdam <Bike className="text-dutch-orange h-6 w-6 sm:h-7 sm:w-7 ml-2" />
          </h1>
          <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">Welcome to the GeoGuessr for Amsterdam!</p>
          <div className="text-muted-foreground mb-6 sm:mb-8 space-y-1 sm:space-y-2 text-sm sm:text-base">
            <p>Explore the street</p>
            <p>Get an AI clue</p>
            <p>Guess where you are</p>
          </div>
          <Button 
            onClick={startNewGame}
            className="w-full h-12 sm:h-14 text-base sm:text-lg font-light tracking-wide button-glow canal-ripple"
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
      {/* Header - responsive spacing and text sizes */}
      <div className="flex flex-col items-center px-4 sm:px-6 py-3 sm:py-5">
        <h1 className="text-2xl sm:text-3xl lg:text-3xl font-light tracking-tight text-white flex items-center">
          Mapsterdam <Bike className="text-dutch-orange h-5 w-5 sm:h-6 sm:w-6 ml-2" />
        </h1>
        <p className="text-muted-foreground mt-1 mb-1 text-sm sm:text-base">Welcome to the GeoGuessr for Amsterdam!</p>
        <p className="text-muted-foreground text-center max-w-3xl mb-2 px-2 sm:px-4 text-xs sm:text-sm">
          Explore the street. Get an AI clue. Guess where you are.
        </p>
      </div>
      
      {/* Main content - responsive layout */}
      <div className="flex-1 p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Street View Panel */}
        <div className={cn(
          "w-full transition-all duration-500 flex flex-col relative",
          // Mobile: reduced height for better fit
          "h-[40vh] min-h-[280px]",
          // Tablet: medium height
          "sm:h-[45vh] sm:min-h-[320px]",
          // Desktop: full height
          "lg:h-[calc(100vh-16rem)] lg:min-h-[450px]"
        )}>
          <div className="flex-1 shadow-glow rounded-xl overflow-hidden">
            <StreetView className="w-full h-full" />
          </div>
          
          {gameState === "playing" && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 lg:top-5 lg:right-5 z-10">
              <Button
                variant="canal"
                size="sm"
                onClick={startNewGame}
                className="font-light canal-ripple text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 h-8 sm:h-9 lg:h-10"
              >
                <RefreshCw size={14} className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">New Location</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          )}
        </div>
        
        {/* Vertical separator for desktop */}
        <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 h-[calc(100vh-16rem)] min-h-[450px] mt-6">
          <Separator orientation="vertical" className="h-full bg-gray-700/30" />
        </div>
        
        {/* Horizontal separator for mobile/tablet */}
        <div className="block lg:hidden w-full">
          <Separator className="bg-gray-700/30 my-2 sm:my-3" />
        </div>
        
        {/* Map Panel */}
        <div className={cn(
          "w-full transition-all duration-500 shadow-glow rounded-xl",
          // Mobile: reduced height for better fit
          "h-[40vh] min-h-[280px]",
          // Tablet: medium height
          "sm:h-[45vh] sm:min-h-[320px]",
          // Desktop: full height
          "lg:h-[calc(100vh-16rem)] lg:min-h-[450px]"
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
