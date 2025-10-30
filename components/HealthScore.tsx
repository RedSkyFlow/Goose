import React from 'react';

interface HealthScoreProps {
  score: number;
  label: string;
}

const getScoreColor = (score: number) => {
  if (score > 70) return 'text-accent';
  if (score > 40) return 'text-primary';
  return 'text-red-500';
};

export const HealthScore: React.FC<HealthScoreProps> = ({ score, label }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-28 h-28 md:w-32 md:h-32">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          <circle
            className="text-primary/20"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
          />
          <circle
            className={getScoreColor(score)}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
        </div>
      </div>
      <p className="text-center mt-2 text-sm font-medium text-foreground/80">{label}</p>
    </div>
  );
};
