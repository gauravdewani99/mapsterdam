
import React from "react";
import { GameProvider, useGame } from "@/context/GameContext";
import ApiKeyForm from "@/components/ApiKeyForm";
import ApiKeyError from "@/components/ApiKeyError";
import StreetView from "@/components/StreetView";
import MapSelector from "@/components/MapSelector";
import ResultModal from "@/components/ResultModal";
import { Button } from "@/components/ui/button";
import { MapPin, RefreshCw, Map, Bike } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import BikePulse from "@/components/animations/BikePulse";
import GlitterBorder from "@/components/animations/GlitterBorder";

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
        <GlitterBorder className="max-w-md neo-blur p-8 amsterdam-fade-in">
          <div className="flex justify-center mb-4">
            <BikePulse size={48} />
          </div>
          <h1 className="text-3xl font-light mb-4 text-white">Welcome to Mapsterdam</h1>
          <p className="text-muted-foreground mb-6">
            Explore the streets of Amsterdam and test your geography skills. Can you guess where you are in the city?
          </p>
          <Button 
            onClick={startNewGame}
            className="w-full h-12 font-light tracking-wide button-glow canal-ripple"
            variant="amsterdam"
            size="xl"
          >
            <MapPin className="mr-2" />
            Start Adventure
          </Button>
        </GlitterBorder>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col">
      <div className="flex flex-col items-center px-6 py-4">
        <div className="flex items-center">
          <BikePulse size={24} className="mr-2" />
          <h1 className="text-2xl font-light tracking-tight text-white">Mapsterdam</h1>
        </div>
        <p className="text-muted-foreground mt-1 text-center text-sm max-w-md">
          Discover the streets of Amsterdam
        </p>
      </div>
      
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlitterBorder 
          className="w-full h-[calc(100vh-15rem)] min-h-[400px] transition-all duration-500 flex flex-col relative"
          borderColor="#1e88e5"
        >
          <div className="flex-1 rounded-xl overflow-hidden">
            <StreetView className="w-full h-full" />
          </div>
          
          {gameState === "playing" && (
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="canal"
                size="sm"
                onClick={startNewGame}
                className="font-light canal-ripple"
              >
                <RefreshCw size={14} className="mr-2" />
                New Location
              </Button>
            </div>
          )}
        </GlitterBorder>
        
        <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 h-[calc(100vh-15rem)] min-h-[400px] mt-6">
          <Separator orientation="vertical" className="h-full bg-gray-700/30" />
        </div>
        
        <div className="block lg:hidden w-full">
          <Separator className="bg-gray-700/30 my-2" />
        </div>
        
        <GlitterBorder 
          className="w-full h-[calc(100vh-15rem)] min-h-[400px] transition-all duration-500"
          borderColor="#e04e39"
        >
          <MapSelector className="w-full h-full" />
        </GlitterBorder>
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
