
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";
import { formatDistance } from "@/utils/locationUtils";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const ResultModal: React.FC = () => {
  const { gameState, distance, isWinner, startNewGame } = useGame();
  
  const isOpen = gameState === "result";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && startNewGame()}>
      <DialogContent className="glass-panel border-none max-w-md animate-scale-in">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-light mb-2">
            {isWinner ? "Impressive!" : "Not Quite..."}
          </DialogTitle>
          <DialogDescription className="text-base">
            {isWinner 
              ? "You have a remarkable sense of geography!"
              : "Keep exploring and improving your geographic intuition."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-6 space-y-4">
          <div 
            className={cn(
              "flex items-center justify-center w-20 h-20 rounded-full",
              isWinner 
                ? "bg-green-100 text-green-600" 
                : "bg-red-100 text-red-600"
            )}
          >
            {isWinner 
              ? <CheckCircle size={40} /> 
              : <XCircle size={40} />}
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-medium mb-1">
              {isWinner ? "You Won!" : "You Lost"}
            </h3>
            <p className="text-muted-foreground">
              {distance !== null && (
                <>Your guess was <span className="font-medium">{formatDistance(distance)}</span> away</>
              )}
            </p>
          </div>
        </div>
        
        <div className="mt-2">
          <Button 
            onClick={startNewGame}
            className="w-full bg-primary/90 hover:bg-primary button-hover-effect"
          >
            <RefreshCw size={16} className="mr-2" />
            New Game
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResultModal;
