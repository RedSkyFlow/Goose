import React from 'react';
import { ChevronDownIcon } from '../icons';

interface ProposalHeroProps {
    title: string;
    clientName: string;
    date: string;
}

export const ProposalHero: React.FC<ProposalHeroProps> = ({ title, clientName, date }) => {
    const scrollToNext = () => {
        const nextSection = document.getElementById('executive-summary');
        if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="relative h-screen w-full flex flex-col justify-between p-12 text-white bg-[#1c203c] overflow-hidden print:h-auto print:min-h-0 print:p-0 print:bg-white print:text-black print:block">
            {/* Background Image Placeholder with Overlay - using a Hotel/Lobby vibe */}
            <div className="absolute inset-0 z-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80')] bg-cover bg-center print:hidden"></div>
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#1c203c] via-[#1c203c]/90 to-transparent print:hidden"></div>
            
            {/* Top Left Logo */}
            <div className="relative z-10 flex items-center">
                <div className="goose-logo h-12 w-12 mr-4 bg-primary print:text-black"></div>
                <h2 className="text-xl font-bold tracking-wider uppercase print:text-black">Flow Networks</h2>
            </div>

            {/* Center Content */}
            <div className="relative z-10 max-w-4xl mt-20 print:mt-10">
                <div className="w-24 h-2 bg-secondary mb-8 print:bg-black"></div>
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight print:text-black print:text-4xl">
                    {title || "Budgetary Proposal"}
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 font-light print:text-black">
                    Prepared for <span className="text-white font-semibold print:text-black">{clientName}</span>
                </p>
                <p className="text-lg text-primary mt-4 font-medium print:text-black">{new Date(date).toLocaleDateString()}</p>
            </div>

            {/* Bottom CTA */}
            <div className="relative z-10 flex flex-col items-center mb-8 print:hidden">
                <p className="text-sm uppercase tracking-widest mb-2 text-gray-400">Scroll to view solution</p>
                <button 
                    onClick={scrollToNext}
                    className="animate-bounce p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                    aria-label="Scroll down"
                >
                    <ChevronDownIcon className="w-8 h-8" />
                </button>
            </div>
        </section>
    );
};