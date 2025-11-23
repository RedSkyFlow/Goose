import React from 'react';
import { ROIProjection } from '../../types';
import { ShieldCheckIcon, SparklesIcon, TrendingUpIcon, CheckCircleIcon, FireIcon } from '../icons';

interface ExecutiveSummaryProps {
    summary: string;
    challenges: string;
    roiProjections: ROIProjection[];
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ summary, challenges, roiProjections }) => {
    return (
        <section id="executive-summary" className="py-20 px-8 md:px-16 max-w-7xl mx-auto print:py-10 print:px-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Left Column: The Narrative */}
                <div className="space-y-8">
                    <div>
                        <h3 className="text-primary font-bold tracking-widest uppercase mb-2 print:text-black">The Flow Commitment</h3>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 print:text-black">Executive Summary</h2>
                        <div className="prose prose-invert prose-lg text-gray-300 print:text-black leading-relaxed">
                            <p>{summary}</p>
                        </div>
                    </div>
                    
                    <div className="p-6 bg-background-light/50 border-l-4 border-secondary rounded-r-lg print:bg-gray-100 print:border-black">
                        <h4 className="text-xl font-bold text-white mb-2 print:text-black">Understanding Your Challenges</h4>
                        <p className="text-gray-300 print:text-black">{challenges}</p>
                    </div>
                </div>

                {/* Right Column: Key Benefits & ROI */}
                <div className="space-y-8">
                    <h3 className="text-white text-2xl font-bold mb-6 border-b border-white/10 pb-4 print:text-black print:border-black">Key Benefits & Impact</h3>
                    
                    <div className="space-y-4">
                        {/* Static Benefits List as per requirements */}
                        <div className="flex items-start p-4 rounded-lg bg-white/5 print:border print:border-gray-300">
                            <div className="flex-shrink-0 mr-4 mt-1">
                                <ShieldCheckIcon className="w-8 h-8 text-primary print:text-black" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-white print:text-black">Enterprise Security</p>
                                <p className="text-sm text-gray-400 mt-1 print:text-black">Next-gen threat protection and unified policy management.</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start p-4 rounded-lg bg-white/5 print:border print:border-gray-300">
                             <div className="flex-shrink-0 mr-4 mt-1">
                                <FireIcon className="w-8 h-8 text-accent print:text-black" />
                            </div>
                             <div>
                                <p className="text-lg font-bold text-white print:text-black">High-Speed Connectivity</p>
                                <p className="text-sm text-gray-400 mt-1 print:text-black">Seamless roaming and gigabit throughput for all zones.</p>
                            </div>
                        </div>

                        {/* Dynamic ROI Items */}
                        {roiProjections.map((roi, index) => (
                            <div key={index} className="flex items-start p-4 rounded-lg hover:bg-white/5 transition-colors print:border print:border-gray-300">
                                <div className="flex-shrink-0 mr-4 mt-1">
                                     <TrendingUpIcon className="w-8 h-8 text-secondary print:text-black" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-white print:text-black">{roi.value}</p>
                                    <p className="text-lg font-semibold text-gray-200 print:text-black">{roi.metric}</p>
                                    <p className="text-sm text-gray-400 mt-1 print:text-black">{roi.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};