
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
      <DialogContent className="sm:max-w-md max-w-[90vw] w-full p-0 overflow-hidden bg-gradient-to-br from-dark-secondary to-dark-background border-dark-border/70 shadow-lg animate-scale-in">
        <DialogTitle className="sr-only">Game Result</DialogTitle>
        
        {/* Content section */}
        <div className="p-4 bg-dark-secondary/70">
          {/* Success/failure message */}
          <div className={cn(
            "mb-3 p-3 rounded-md text-center",
            isSuccessful ? "bg-green-500/20 text-green-400" : "bg-dutch-orange/20 text-dutch-orange"
          )}>
            <p className="font-medium">
              {isSuccessful ? "Great guess!" : "Nice try!"}
            </p>
            <p className="text-sm">
              {isSuccessful
                ? "You're within 1 kilometer of the actual location"
                : `You missed by ${formattedDistance}`}
            </p>
          </div>
          
          {/* Location information - Improved to handle long street names */}
          <div className="mb-3 p-3 bg-dark-primary/30 rounded-md">
            <div className="flex items-center gap-1 justify-center">
              <span className="text-sm text-white/80">The actual location was</span>
              <MapPin size={14} className="text-dutch-orange flex-shrink-0 mx-1" />
              <div className="font-bold text-dutch-orange text-sm max-w-full overflow-hidden">
                <span className="line-clamp-2 text-center">{locationDisplay}</span>
              </div>
            </div>
          </div>
          
          {/* Play again button */}
          <Button 
            onClick={startNewGame}
            className={cn(
              "w-full bg-gradient-to-r from-dutch-orange to-dutch-red hover:bg-dutch-orange",
              "text-white transition-all"
            )}
          >
            <RefreshCw size={16} className="mr-2" />
            Play Again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResultModal;
