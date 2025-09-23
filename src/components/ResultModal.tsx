
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
      <DialogContent className="sm:max-w-lg max-w-[95vw] w-full p-0 overflow-hidden bg-gradient-to-br from-dark-secondary to-dark-background border-dark-border/70 shadow-lg animate-scale-in mx-2">
        <DialogTitle className="sr-only">Game Result</DialogTitle>
        
        {/* Content section */}
        <div className="p-4 sm:p-6 bg-dark-secondary/70">
          {/* Success/failure message */}
          <div className={cn(
            "mb-4 p-3 sm:p-4 rounded-md text-center",
            isSuccessful ? "bg-green-500/20 text-green-400" : "bg-dutch-orange/20 text-dutch-orange"
          )}>
            <p className="font-medium text-base sm:text-lg">
              {isSuccessful ? "Great guess!" : "Nice try!"}
            </p>
            <p className="text-sm sm:text-base mt-1">
              {isSuccessful
                ? "You're within 1 kilometer of the actual location"
                : `You missed by ${formattedDistance}`}
            </p>
          </div>
          
          {/* Location information - Mobile optimized */}
          <div className="mb-4 p-3 sm:p-4 bg-dark-primary/30 rounded-md">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-1 justify-center text-center">
              <div className="flex items-center gap-1">
                <span className="text-sm sm:text-base text-white/80">The actual location was</span>
                <MapPin size={16} className="text-dutch-orange flex-shrink-0" />
              </div>
              <div className="font-bold text-dutch-orange text-sm sm:text-base max-w-full">
                <span className="break-words">{locationDisplay}</span>
              </div>
            </div>
          </div>
          
          {/* Play again button - Mobile optimized */}
          <Button 
            onClick={startNewGame}
            className={cn(
              "w-full h-12 sm:h-11 bg-gradient-to-r from-dutch-orange to-dutch-red hover:bg-dutch-orange",
              "text-white transition-all text-base sm:text-sm font-medium"
            )}
          >
            <RefreshCw size={18} className="mr-2" />
            Play Again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResultModal;
