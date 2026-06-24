"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetHours?: number;
}

export function CountdownTimer({ targetHours = 4 }: CountdownTimerProps) {
  const [time, setTime] = useState({
    hours: targetHours,
    minutes: 59,
    seconds: 47,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-text-secondary">Offer ends in:</span>
      <div className="flex items-center gap-1">
        {[pad(time.hours), pad(time.minutes), pad(time.seconds)].map(
          (unit, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className="bg-text-primary text-white text-xs font-mono font-bold px-1.5 py-0.5 rounded">
                {unit}
              </span>
              {i < 2 && <span className="text-text-primary font-bold text-xs">:</span>}
            </span>
          )
        )}
      </div>
    </div>
  );
}
