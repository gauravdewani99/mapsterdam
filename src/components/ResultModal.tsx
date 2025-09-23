
import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";
import { RefreshCw, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const ResultModal: React.FC = () => {
  const { gameState, currentLocationName, distance, startNewGame } = useGame();
  
  const isOpen = gameState === "result";
  const isSuccessful = distance !== null && distance <= 1;
  const formattedDistance = distance !== null ? `${Math.round(distance)} km` : "Calculating...";
  const locationDisplay = currentLocationName || "an interesting location in Amsterdam";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && startNewGame()}>
      <DialogContent className="sm:max-w-lg max-w-[95vw] w-full p-0 overflow-hidden bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl animate-scale-in mx-2 rounded-3xl">
        <DialogTitle className="sr-only">Game Result</DialogTitle>
        
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
        
        {/* Content section */}
        <div className="relative p-4 sm:p-6">
          {/* Success/failure message */}
          <div className={cn(
            "mb-6 p-4 sm:p-5 rounded-2xl text-center backdrop-blur-sm border transition-all duration-300",
            isSuccessful 
              ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-300 shadow-lg shadow-emerald-500/10" 
              : "bg-orange-500/20 border-orange-400/30 text-orange-300 shadow-lg shadow-orange-500/10"
          )}>
            <p className="font-semibold text-lg sm:text-xl mb-2">
              {isSuccessful ? "🎉 Great guess!" : "🎯 Nice try!"}
            </p>
            <p className="text-sm sm:text-base text-white/90">
              {isSuccessful
                ? "You're within 1 kilometer of the actual location"
                : `You missed by ${formattedDistance}`}
            </p>
          </div>
          
          {/* Location information - Glass card style */}
          <div className="mb-6 p-4 sm:p-5 bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-1 justify-center text-center">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base text-white/90">The actual location was</span>
                <MapPin size={18} className="text-dutch-orange flex-shrink-0 drop-shadow-lg" />
              </div>
              <div className="font-bold text-dutch-orange text-base sm:text-lg max-w-full drop-shadow-sm">
                <span className="break-words">{locationDisplay}</span>
              </div>
            </div>
          </div>
          
          {/* Play again button - Glass style */}
          <Button 
            onClick={startNewGame}
            variant="glassOrange"
            size="xl"
            className="w-full font-semibold text-lg"
          >
            <RefreshCw size={20} className="mr-2" />
            Play Again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResultModal;
