
import React from 'react';
import P5Wrapper from '../P5Wrapper';
import { Bike } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BikePulseProps {
  size?: number;
  color?: string;
  className?: string;
}

const BikePulse: React.FC<BikePulseProps> = ({ 
  size = 48, 
  color = '#e04e39',
  className 
}) => {
  const bikeRef = React.useRef<HTMLDivElement>(null);
  
  const sketch = (p: any) => {
    let breathValue = 0;
    let breathDirection = 1;
    
    p.setup = () => {
      // Create canvas that's large enough to include glow effect
      p.createCanvas(size * 1.5, size * 1.5);
      p.angleMode(p.DEGREES);
      p.noStroke();
    };
    
    p.draw = () => {
      p.clear();
      
      // Update breath animation
      breathValue += 0.5 * breathDirection;
      if (breathValue > 10 || breathValue < 0) {
        breathDirection *= -1;
      }
      
      // Draw glowing effect
      const glowSize = size + breathValue;
      p.fill(p.color(color.replace('#', '')));
      p.drawingContext.shadowBlur = 20 + breathValue;
      p.drawingContext.shadowColor = color;
      
      // Only draw the glow, actual bike icon is rendered using Lucide
      p.noFill();
      p.ellipse(p.width/2, p.height/2, glowSize * 0.8, glowSize * 0.8);
    };
  };
  
  return (
    <div className={cn("relative", className)} ref={bikeRef}>
      <P5Wrapper sketch={sketch} className="absolute inset-0 z-0" />
      <div className="relative z-10 flex items-center justify-center h-full">
        <Bike 
          className="text-dutch-orange" 
          style={{ width: size, height: size }}
        />
      </div>
    </div>
  );
};

export default BikePulse;
