import React from 'react';
import { SearchIcon, PlusIcon } from './icons';
import { UserProfile } from './UserProfile';

interface MasterListSidebarProps<T extends { [key: string]: any; }> {
    title: string;
    items: T[];
    selectedItem: T | null;
    onSelectItem: (item: T | null) => void;
    renderListItem: (item: T, isSelected: boolean) => React.ReactNode;
    onAddItem: () => void;
    isLoading: boolean;
    itemIdentifier: keyof T;
    
    // New props for search and filter controls
    searchTerm: string;
    onSearchChange: (term: string) => void;
    searchPlaceholder: string;
    
    filterOptions?: { id: string; label: string; icon?: React.ReactNode }[];
    activeFilter?: string | 'All';
    onFilterChange?: (filter: string | 'All') => void;
}

const SidebarSkeleton: React.FC = () => (
    <div className="space-y-2 animate-pulse">
        {[...Array(8)].map((_, i) => <div key={i} className="w-full h-16 bg-primary/10 rounded-lg" />)}
    </div>
);

export function MasterListSidebar<T extends { [key: string]: any; }>({
    title, items, selectedItem, onSelectItem, renderListItem,
    onAddItem, isLoading, itemIdentifier,
    searchTerm, onSearchChange, searchPlaceholder,
    filterOptions, activeFilter, onFilterChange
}: MasterListSidebarProps<T>) {

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
            <div className="mb-4 space-y-3">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-background text-foreground placeholder-foreground/50 pl-10 pr-4 py-2 rounded-md border border-primary/50 focus:ring-2 focus:ring-secondary focus:outline-none"
                        aria-label={`Search ${title}`}
                    />
                </div>

                {filterOptions && activeFilter && onFilterChange && (
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => onFilterChange('All')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                                activeFilter === 'All'
                                    ? 'bg-secondary text-white'
                                    : 'bg-primary/20 text-foreground/80 hover:bg-primary/40'
                            }`}
                        >
                            All
                        </button>
                        {filterOptions.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => onFilterChange(filter.id)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center ${
                                    activeFilter === filter.id
                                        ? 'bg-secondary text-white'
                                        : 'bg-primary/20 text-foreground/80 hover:bg-primary/40'
                                }`}
                            >
                                {filter.icon}
                                {filter.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="flex-grow overflow-y-auto">
                {isLoading ? <SidebarSkeleton /> : (
                    items.length > 0 ? (
                        <ul className="space-y-1">
                            {items.map(item => (
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
                    ) : (
                         <div className="text-center py-10 text-foreground/60">
                            <p>No items match your criteria.</p>
                        </div>
                    )
                )}
            </div>
            <div className="mt-auto pt-4 border-t border-primary/50">
                <UserProfile />
            </div>
        </aside>
    );
}