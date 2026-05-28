
"use client"

import React, { useEffect, useState } from 'react';

interface ScoreGaugeProps {
  score: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = (s: number) => {
    if (s >= 80) return 'stroke-green-500';
    if (s >= 60) return 'stroke-primary';
    if (s >= 40) return 'stroke-yellow-500';
    return 'stroke-destructive';
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-40 h-40 transform -rotate-90">
        <circle
          className="text-muted stroke-current"
          strokeWidth="10"
          fill="transparent"
          r={radius}
          cx="80"
          cy="80"
        />
        <circle
          className={`${getColor(displayScore)} stroke-current transition-all duration-1000 ease-out`}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="80"
          cy="80"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-4xl font-headline font-bold text-foreground leading-none">
          {displayScore}
        </span>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">
          ATS Score
        </span>
      </div>
    </div>
  );
};
