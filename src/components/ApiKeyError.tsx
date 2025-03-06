import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useGame } from "@/context/GameContext";
import { cn } from "@/lib/utils";

const ApiKeyError: React.FC = () => {
  const { errorMessage, retryFetchApiKey } = useGame();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    await retryFetchApiKey();
    setIsRetrying(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 animate-fade-in">
      <Card className={cn(
        "w-full max-w-md glass-panel",
        "transition-all duration-300 ease-out animate-scale-in"
      )}>
        <CardHeader>
          <CardTitle className="text-2xl font-light text-center">Unable to Start GeoQuest</CardTitle>
          <CardDescription className="text-center mt-2">
            We were unable to connect to our servers to start the game.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 rounded-lg text-sm">
              <strong>Error:</strong> {errorMessage || "An unknown error occurred."}
            </div>
            <div className="text-sm text-muted-foreground">
              Please try again. If the problem persists, the server may be down or the API key may be misconfigured.
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleRetry}
            disabled={isRetrying}
            className={cn(
              "w-full bg-primary/90 hover:bg-primary transition-all duration-300",
              "h-12 font-light tracking-wide button-hover-effect"
            )}
          >
            {isRetrying ? (
              <div className="flex items-center">
                <div className="spinner mr-2 !w-5 !h-5"></div>
                <span>Retrying...</span>
              </div>
            ) : (
              <>
                <RefreshCw size={16} className="mr-2" />
                Try Again
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ApiKeyError;
