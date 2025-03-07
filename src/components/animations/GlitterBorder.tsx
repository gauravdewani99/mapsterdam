
import React from 'react';
import P5Wrapper from '../P5Wrapper';
import { cn } from '@/lib/utils';

interface GlitterBorderProps {
  children: React.ReactNode;
  className?: string;
  borderColor?: string;
  glowIntensity?: number;
  disabled?: boolean;
}

const GlitterBorder: React.FC<GlitterBorderProps> = ({ 
  children, 
  className,
  borderColor = '#e04e39',
  glowIntensity = 15,
  disabled = false
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
  
  React.useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          setDimensions({ width, height });
        }
      });
      
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);
  
  const sketch = React.useCallback((p: any) => {
    let particles: any[] = [];
    const numParticles = 100;
    let glitterScaleDirection = 1;
    let glitterScale = 0;
    
    class Particle {
      x: number;
      y: number;
      speed: number;
      direction: number;
      size: number;
      hue: number;
      alpha: number;
      
      constructor() {
        // Randomly position on the border
        const side = Math.floor(p.random(4));
        if (side === 0) { // top
          this.x = p.random(dimensions.width);
          this.y = 0;
          this.direction = p.random(90, 270);
        } else if (side === 1) { // right
          this.x = dimensions.width;
          this.y = p.random(dimensions.height);
          this.direction = p.random(180, 360);
        } else if (side === 2) { // bottom
          this.x = p.random(dimensions.width);
          this.y = dimensions.height;
          this.direction = p.random(270, 450);
        } else { // left
          this.x = 0;
          this.y = p.random(dimensions.height);
          this.direction = p.random(0, 180);
        }
        
        this.speed = p.random(0.2, 1);
        this.size = p.random(1, 3);
        this.hue = p.random(0, 60); // Gold to orange-ish colors
        this.alpha = p.random(150, 255);
      }
      
      update() {
        // Move along the border
        this.x += this.speed * p.cos(this.direction);
        this.y += this.speed * p.sin(this.direction);
        
        // Stay on border or reset if off screen
        if (this.x < 0 || this.x > dimensions.width || 
            this.y < 0 || this.y > dimensions.height) {
          this.reset();
        }
        
        // Occasionally change direction to follow the border
        if (p.random() < 0.02) {
          this.adjustDirectionToBorder();
        }
        
        // Fade over time
        this.alpha -= p.random(0.5, 1.5);
        if (this.alpha <= 0) {
          this.reset();
        }
      }
      
      adjustDirectionToBorder() {
        const margin = 5;
        if (this.x < margin) {
          this.direction = 90;
        } else if (this.x > dimensions.width - margin) {
          this.direction = 270;
        } else if (this.y < margin) {
          this.direction = 0;
        } else if (this.y > dimensions.height - margin) {
          this.direction = 180;
        }
        
        // Add small randomness
        this.direction += p.random(-20, 20);
      }
      
      reset() {
        const side = Math.floor(p.random(4));
        if (side === 0) { // top
          this.x = p.random(dimensions.width);
          this.y = 0;
        } else if (side === 1) { // right
          this.x = dimensions.width;
          this.y = p.random(dimensions.height);
        } else if (side === 2) { // bottom
          this.x = p.random(dimensions.width);
          this.y = dimensions.height;
        } else { // left
          this.x = 0;
          this.y = p.random(dimensions.height);
        }
        
        this.alpha = p.random(150, 255);
      }
      
      display() {
        p.noStroke();
        const col = p.color(`hsla(${this.hue}, 100%, 60%, ${this.alpha/255})`);
        p.fill(col);
        p.circle(this.x, this.y, this.size);
      }
    }
    
    p.setup = () => {
      p.createCanvas(dimensions.width, dimensions.height);
      p.colorMode(p.HSB);
      p.noStroke();
      
      // Initialize particles
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };
    
    p.draw = () => {
      p.clear();
      
      // Update global glitter scale for pulsing effect
      glitterScale += 0.025 * glitterScaleDirection;
      if (glitterScale > 1 || glitterScale < 0) {
        glitterScaleDirection *= -1;
      }
      
      // Draw glowing border
      p.noFill();
      p.drawingContext.shadowBlur = glowIntensity * (0.8 + glitterScale * 0.4);
      p.drawingContext.shadowColor = borderColor;
      p.stroke(p.color(borderColor));
      p.strokeWeight(2);
      p.rect(0, 0, dimensions.width, dimensions.height, 12);
      
      // Update and display particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].display();
      }
    };
    
    p.windowResized = () => {
      if (containerRef.current) {
        p.resizeCanvas(dimensions.width, dimensions.height);
      }
    };
  }, [dimensions, borderColor, glowIntensity]);
  
  return (
    <div className={cn("relative rounded-xl border border-opacity-20", disabled ? "border-gray-700" : "", className)} ref={containerRef}>
      {!disabled && (
        <P5Wrapper 
          sketch={sketch} 
          className="absolute inset-0 z-0 rounded-xl pointer-events-none" 
          disabled={disabled}
        />
      )}
      <div className="relative z-10 h-full rounded-xl overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default GlitterBorder;
