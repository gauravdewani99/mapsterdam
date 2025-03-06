
import React from "react";
import { GameProvider, useGame } from "@/context/GameContext";
import ApiKeyForm from "@/components/ApiKeyForm";
import StreetView from "@/components/StreetView";
import MapSelector from "@/components/MapSelector";
import ResultModal from "@/components/ResultModal";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const GameContent: React.FC = () => {
  const { apiKey, gameState, startNewGame } = useGame();

  if (!apiKey) {
    return <ApiKeyForm />;
  }

  return (
    <div className="w-full min-h-screen flex flex-col">
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="text-2xl font-light tracking-tight">GeoQuest</h1>
        
        {gameState === "playing" && (
          <Button
            variant="outline"
            size="sm"
            onClick={startNewGame}
            className="font-light"
          >
            <RefreshCw size={14} className="mr-2" />
            New Location
          </Button>
        )}
      </div>
      
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cn(
          "w-full h-[calc(100vh-12rem)] min-h-[400px] transition-all duration-500",
          "shadow-lg"
        )}>
          <StreetView className="w-full h-full" />
        </div>
        
        <div className={cn(
          "w-full h-[calc(100vh-12rem)] min-h-[400px] transition-all duration-500",
          "shadow-lg"
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
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary animate-fade-in">
        <GameContent />
      </div>
    </GameProvider>
  );
};

export default Index;
