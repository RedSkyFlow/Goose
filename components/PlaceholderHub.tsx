import React from 'react';
import { SparklesIcon } from './icons';

interface PlaceholderHubProps {
  title: string;
}

export const PlaceholderHub: React.FC<PlaceholderHubProps> = ({ title }) => {
  return (
    <main className="flex-1 bg-background p-8 flex items-center justify-center">
      <div className="text-center">
        <SparklesIcon className="w-16 h-16 text-secondary mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-foreground/80">{title}</h2>
        <p className="text-foreground/60 mt-2">This hub is under construction. Check back soon for new features!</p>
      </div>
    </main>
  );
};