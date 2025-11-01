import React from 'react';
import { TrendingUpIcon, TrendingDownIcon } from './icons';

interface HealthScoreProps {
  score: number;
  label: string;
  history?: { date: string, score: number }[];
}

const getScoreColor = (score: number) => {
  if (score > 70) return 'text-accent';
  if (score > 40) return 'text-primary';
  return 'text-red-500';
};

const Sparkline: React.FC<{ data: number[], trend: 'up' | 'down' | 'stable' }> = ({ data, trend }) => {
    const width = 100;
    const height = 25;
    const strokeWidth = 2;

    if (data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min === 0 ? 1 : max - min;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d - min) / range) * (height - strokeWidth) + strokeWidth / 2;
        return `${x},${y}`;
    }).join(' ');

    const trendColor = trend === 'up' ? 'text-accent' : trend === 'down' ? 'text-red-500' : 'text-primary';

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="none">
            <polyline
                fill="none"
                stroke="currentColor"
                className={trendColor}
                strokeWidth={strokeWidth}
                points={points}
            />
        </svg>
    )
}

export const HealthScore: React.FC<HealthScoreProps> = ({ score, label, history }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const trend = history && history.length > 1 
    ? history[history.length - 1].score > history[0].score ? 'up' : 'down'
    : 'stable';

  return (
    <div 
        className="flex flex-col items-center justify-center w-full"
        title="AI-powered score predicting deal success based on recent interactions and sentiment."
    >
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
      
      {history && history.length > 0 && (
          <div className="w-full max-w-[120px] mt-2">
            <Sparkline data={history.map(h => h.score)} trend={trend} />
            <div className={`flex items-center justify-center text-xs mt-1 ${
                trend === 'up' ? 'text-accent' : trend === 'down' ? 'text-red-400' : 'text-foreground/60'
            }`}>
                {trend === 'up' && <TrendingUpIcon className="w-3.5 h-3.5 mr-1" />}
                {trend === 'down' && <TrendingDownIcon className="w-3.5 h-3.5 mr-1" />}
                <span>30-Day Trend</span>
            </div>
          </div>
      )}
    </div>
  );
};