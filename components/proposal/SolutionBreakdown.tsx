import React from 'react';
import { ProposalItem } from '../../types';
import { CheckCircleIcon } from '../icons';

interface SolutionBreakdownProps {
    items: ProposalItem[];
}

export const SolutionBreakdown: React.FC<SolutionBreakdownProps> = ({ items }) => {
    return (
        <section className="py-20 bg-background-light/30 print:bg-white print:py-10">
            <div className="px-8 md:px-16 max-w-7xl mx-auto">
                <div className="text-center mb-16 print:mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 print:text-black">Proposed Solution Stack</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto print:text-black">
                        A comprehensive breakdown of the technology and services tailored to meet your business objectives.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map((item) => (
                        <div key={item.id} className="bg-[#1c203c] border border-primary/20 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-primary/50 transition-all duration-300 flex flex-col print:bg-white print:border-gray-300 print:shadow-none print:break-inside-avoid">
                            <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
                            <div className="p-6 flex-grow">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-white print:text-black">{item.name}</h3>
                                </div>
                                <p className="text-gray-400 text-sm mb-6 print:text-black">{item.description}</p>
                                
                                <ul className="space-y-3">
                                    {item.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start text-sm text-gray-300 print:text-black">
                                            <CheckCircleIcon className="w-5 h-5 text-primary mr-2 flex-shrink-0 print:text-black" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="p-4 bg-white/5 border-t border-white/5 print:bg-gray-50 print:border-gray-200">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 print:text-black">
                                    {item.type === 'recurring' ? 'Monthly Subscription' : 'One-Time Purchase'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};