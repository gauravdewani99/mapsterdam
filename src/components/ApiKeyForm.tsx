
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useGame } from "@/context/GameContext";
import { cn } from "@/lib/utils";

const ApiKeyForm: React.FC = () => {
  const { setApiKey } = useGame();
  const [key, setKey] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate a brief loading state for smoother UX
    setTimeout(() => {
      setApiKey(key.trim());
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 animate-fade-in">
      <Card className={cn(
        "w-full max-w-md glass-panel",
        "transition-all duration-300 ease-out animate-scale-in"
      )}>
        <CardHeader>
          <CardTitle className="text-2xl font-light text-center">Welcome to GeoQuest</CardTitle>
          <CardDescription className="text-center mt-2">
            A beautiful journey around the world. Enter your Google Maps API key to begin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter your Google Maps API key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="bg-white/50 border-white/20 focus:border-primary/50 h-12"
                required
              />
              <div className="text-sm text-muted-foreground">
                Your API key needs to have the Maps JavaScript API and Street View API enabled.
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSubmit}
            disabled={!key.trim() || isSubmitting}
            className={cn(
              "w-full bg-primary/90 hover:bg-primary transition-all duration-300",
              "h-12 font-light tracking-wide button-hover-effect"
            )}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="spinner mr-2 !w-5 !h-5"></div>
                <span>Connecting...</span>
              </div>
            ) : (
              "Begin Experience"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ApiKeyForm;
