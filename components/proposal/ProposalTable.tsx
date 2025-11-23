import React, { useMemo } from 'react';
import { ProposalItem } from '../../types';

interface ProposalTableProps {
    items: ProposalItem[];
    selectedItemIds: Set<string>;
    onToggleItem: (id: string) => void;
    isLocked: boolean;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export const ProposalTable: React.FC<ProposalTableProps> = ({ items, selectedItemIds, onToggleItem, isLocked }) => {
    
    // Group items by inferred category based on type or name
    const groupedItems = useMemo(() => {
        const groups: Record<string, ProposalItem[]> = {
            'Hardware & Implementation': [],
            'Software & Licensing': [],
            'Managed Services': []
        };

        items.forEach(item => {
            if (item.type === 'recurring') {
                groups['Managed Services'].push(item);
            } else if (item.name.toLowerCase().includes('license') || item.name.toLowerCase().includes('software')) {
                groups['Software & Licensing'].push(item);
            } else {
                groups['Hardware & Implementation'].push(item);
            }
        });

        return groups;
    }, [items]);

    const calculateGroupTotal = (groupItems: ProposalItem[]) => {
        return groupItems.reduce((acc, item) => {
            return selectedItemIds.has(item.id) ? acc + (item.price * item.quantity) : acc;
        }, 0);
    };

    const grandTotal = items.reduce((acc, item) => {
        return selectedItemIds.has(item.id) ? acc + (item.price * item.quantity) : acc;
    }, 0);

    return (
        <section className="py-20 px-8 md:px-16 max-w-5xl mx-auto print:py-10 print:px-0">
            <div className="text-center mb-12 print:mb-6">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 print:text-black">Investment Summary</h2>
                <p className="text-gray-400 print:text-black">Transparent pricing tailored to your needs.</p>
            </div>

            <div className="bg-[#1c203c] border border-primary/30 rounded-xl overflow-hidden shadow-2xl print:bg-white print:border-black print:shadow-none">
                {Object.entries(groupedItems).map(([category, categoryItems]) => {
                    if (categoryItems.length === 0) return null;
                    
                    return (
                        <div key={category} className="border-b border-primary/20 last:border-b-0 print:border-gray-300 print:break-inside-avoid">
                            <div className="bg-background-light/50 px-6 py-3 border-l-4 border-secondary print:bg-gray-100 print:border-black">
                                <h3 className="font-bold text-white uppercase tracking-wider text-sm print:text-black">{category}</h3>
                            </div>
                            <div className="p-0">
                                {categoryItems.map((item) => {
                                    const isSelected = selectedItemIds.has(item.id);
                                    return (
                                        <div 
                                            key={item.id} 
                                            className={`flex flex-col md:flex-row items-center p-4 border-b border-white/5 last:border-b-0 transition-colors ${isSelected ? 'bg-white/5' : 'opacity-50 hover:opacity-70'} print:opacity-100 print:border-gray-200`}
                                        >
                                            {/* Checkbox Area - Hide on Print if Locked/Accepted */}
                                            <div className="mr-4 print:hidden">
                                                 <input 
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => onToggleItem(item.id)}
                                                    disabled={isLocked}
                                                    className="h-5 w-5 rounded border-primary/50 text-secondary focus:ring-secondary cursor-pointer disabled:cursor-not-allowed bg-[#1c203c]"
                                                />
                                            </div>

                                            {/* Item Details */}
                                            <div className="flex-grow text-center md:text-left w-full md:w-auto mb-2 md:mb-0">
                                                <p className="font-bold text-white text-lg print:text-black">{item.name}</p>
                                                <p className="text-xs text-gray-400 print:text-black">{item.description}</p>
                                            </div>

                                            {/* Pricing Details */}
                                            <div className="flex items-center justify-between w-full md:w-auto md:min-w-[250px] space-x-4">
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500 uppercase print:text-black">Qty</p>
                                                    <p className="font-mono text-gray-300 print:text-black">{item.quantity}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500 uppercase print:text-black">Unit Price</p>
                                                    <p className="font-mono text-gray-300 print:text-black">{formatCurrency(item.price)}</p>
                                                </div>
                                                <div className="text-right min-w-[100px]">
                                                    <p className="text-xs text-gray-500 uppercase print:text-black">Total</p>
                                                    <p className={`font-bold font-mono text-lg ${isSelected ? 'text-white' : 'text-gray-600'} print:text-black`}>
                                                        {formatCurrency(item.price * item.quantity)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Category Subtotal */}
                            <div className="bg-background/50 px-6 py-2 flex justify-end border-t border-white/5 print:bg-white print:border-gray-200">
                                <p className="text-sm text-gray-400 mr-4 pt-1 print:text-black">Category Subtotal:</p>
                                <p className="text-lg font-bold text-secondary print:text-black">{formatCurrency(calculateGroupTotal(categoryItems))}</p>
                            </div>
                        </div>
                    );
                })}

                {/* Grand Total Footer */}
                <div className="bg-secondary p-6 flex flex-col md:flex-row justify-between items-center text-white print:bg-gray-200 print:text-black">
                    <div>
                        <p className="text-lg font-medium opacity-90 print:text-black">Total Estimated Investment</p>
                        <p className="text-sm opacity-70 print:text-black">Valid for 30 days from issuance</p>
                    </div>
                    <div className="text-4xl font-extrabold mt-2 md:mt-0 print:text-black">
                        {formatCurrency(grandTotal)}
                    </div>
                </div>
            </div>
        </section>
    );
};