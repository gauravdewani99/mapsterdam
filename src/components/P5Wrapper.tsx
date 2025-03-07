
import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

interface P5WrapperProps {
  sketch: (p: p5) => void;
  className?: string;
  disabled?: boolean;
}

const P5Wrapper: React.FC<P5WrapperProps> = ({ sketch, className, disabled = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5 | null>(null);

  useEffect(() => {
    if (containerRef.current && !disabled) {
      p5Ref.current = new p5(sketch, containerRef.current);
    }

    return () => {
      if (p5Ref.current) {
        p5Ref.current.remove();
      }
    };
  }, [sketch, disabled]);

  return <div ref={containerRef} className={className} />;
};

export default P5Wrapper;
