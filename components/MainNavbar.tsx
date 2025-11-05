import React from 'react';
import { BriefcaseIcon, BuildingOfficeIcon, UsersIcon, LifebuoyIcon, MegaphoneIcon } from './icons';

export type Hub = 'Deals' | 'Companies' | 'Contacts' | 'Support' | 'Marketing';

interface MainNavbarProps {
  activeHub: Hub;
  onHubChange: (hub: Hub) => void;
}

const hubs: { id: Hub, name: string, icon: React.ReactNode }[] = [
    { id: 'Deals', name: 'Deals', icon: <BriefcaseIcon className="w-7 h-7" /> },
    { id: 'Companies', name: 'Companies', icon: <BuildingOfficeIcon className="w-7 h-7" /> },
    { id: 'Contacts', name: 'Contacts', icon: <UsersIcon className="w-7 h-7" /> },
    { id: 'Support', name: 'Support', icon: <LifebuoyIcon className="w-7 h-7" /> },
    { id: 'Marketing', name: 'Marketing', icon: <MegaphoneIcon className="w-7 h-7" /> },
];

export const MainNavbar: React.FC<MainNavbarProps> = ({ activeHub, onHubChange }) => {
    return (
        <nav className="bg-background-light p-3 flex flex-col items-center border-r border-primary/50 z-20">
            <img src="/Goose_logo.png" alt="Goose OS Logo" className="h-10 w-10 mb-8" />

            <ul className="flex flex-col items-center space-y-4">
                {hubs.map(hub => (
                    <li key={hub.id}>
                        <button
                            onClick={() => onHubChange(hub.id)}
                            className={`p-3 rounded-lg transition-colors relative group ${
                                activeHub === hub.id 
                                ? 'bg-secondary text-white' 
                                : 'text-foreground/60 hover:bg-primary/20 hover:text-foreground'
                            }`}
                            aria-label={hub.name}
                            title={hub.name}
                        >
                            {hub.icon}
                            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-background text-foreground text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {hub.name}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};