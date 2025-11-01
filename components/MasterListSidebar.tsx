import React, { useState, useMemo, useEffect } from 'react';
import { SearchIcon, PlusIcon } from './icons';
import { UserProfile } from './UserProfile';

interface MasterListSidebarProps<T extends { [key: string]: any; }> {
    title: string;
    items: T[];
    selectedItem: T | null;
    onSelectItem: (item: T | null) => void;
    renderListItem: (item: T, isSelected: boolean) => React.ReactNode;
    searchKeys: (keyof T)[];
    onAddItem: () => void;
    isLoading: boolean;
    itemIdentifier: keyof T;
}

const SidebarSkeleton: React.FC = () => (
    <div className="space-y-2 animate-pulse">
        {[...Array(8)].map((_, i) => <div key={i} className="w-full h-16 bg-primary/10 rounded-lg" />)}
    </div>
);

export function MasterListSidebar<T extends { [key: string]: any; }>({
    title, items, selectedItem, onSelectItem, renderListItem,
    searchKeys, onAddItem, isLoading, itemIdentifier
}: MasterListSidebarProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = useMemo(() => items.filter(item => {
        if (!searchTerm) return true;
        const lowercasedTerm = searchTerm.toLowerCase();
        return searchKeys.some(key => {
            const value = item[key];
            return typeof value === 'string' && value.toLowerCase().includes(lowercasedTerm);
        });
    }), [items, searchTerm, searchKeys]);

    useEffect(() => {
        if (selectedItem && !filteredItems.find(item => item[itemIdentifier] === selectedItem[itemIdentifier])) {
            onSelectItem(filteredItems.length > 0 ? filteredItems[0] : null);
        }
    }, [filteredItems, selectedItem, onSelectItem, itemIdentifier]);

    return (
        <aside className="w-full max-w-xs xl:max-w-sm bg-background-light p-4 border-r border-primary/50 flex flex-col">
            <div className="flex justify-between items-center mb-3 mt-2">
                <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">{title}</h2>
                <button
                    onClick={onAddItem}
                    className="flex items-center text-sm bg-secondary hover:opacity-90 text-white font-semibold py-1.5 px-3 rounded-md transition-colors"
                    title={`Add a new ${title.slice(0, -1).toLowerCase()}`}
                >
                    <PlusIcon className="w-4 h-4 mr-1.5" />
                    Add New
                </button>
            </div>
            <div className="relative mb-4">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
                <input
                    type="text"
                    placeholder={`Search ${title.toLowerCase()}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-background text-foreground placeholder-foreground/50 pl-10 pr-4 py-2 rounded-md border border-primary/50 focus:ring-2 focus:ring-secondary focus:outline-none"
                    aria-label={`Search ${title}`}
                />
            </div>
            <div className="flex-grow overflow-y-auto">
                {isLoading ? <SidebarSkeleton /> : (
                    <ul className="space-y-1">
                        {filteredItems.map(item => (
                            <li key={item[itemIdentifier]}>
                                <button
                                    onClick={() => onSelectItem(item)}
                                    className="w-full text-left"
                                    aria-pressed={selectedItem?.[itemIdentifier] === item[itemIdentifier]}
                                >
                                    {renderListItem(item, selectedItem?.[itemIdentifier] === item[itemIdentifier])}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="mt-auto pt-4 border-t border-primary/50">
                <UserProfile />
            </div>
        </aside>
    );
}