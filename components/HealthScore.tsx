
import React from 'react';

interface HealthScoreProps {
  score: number;
  label: string;
}

const getScoreColor = (score: number) => {
  if (score > 70) return 'text-green-400';
  if (score > 40) return 'text-yellow-400';
  return 'text-red-400';
};

export const HealthScore: React.FC<HealthScoreProps> = ({ score, label }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score).replace('text-', ''); // Extract color name

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          <circle
            className="text-brand-gray-700"
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
      <p className="text-center mt-2 text-sm font-medium text-gray-300">{label}</p>
    </div>
  );
};
