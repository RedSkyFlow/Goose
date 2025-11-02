import React from 'react';
import type { Deal, Interaction, Company, Contact, SupportTicket, ProspectProfile } from '../types';
import { SupportTicketStatus } from '../types';
import { HealthScore } from './HealthScore';
import { CoPilot } from './CoPilot';
import { BriefcaseIcon } from './icons';

type DashboardItem = Deal | Company | Contact | SupportTicket | ProspectProfile;

interface RightSidebarProps {
  item: DashboardItem | null;
  interactions?: Interaction[];
}

const isDeal = (item: any): item is Deal => item && 'deal_id' in item;
const isCompany = (item: any): item is Company => item && 'domain' in item;
const isContact = (item: any): item is Contact => item && 'contact_id' in item && 'first_name' in item;
const isSupportTicket = (item: any): item is SupportTicket => item && 'ticket_id' in item;
const isProspectProfile = (item: any): item is ProspectProfile => item && 'tech_stack' in item;


export const RightSidebar: React.FC<RightSidebarProps> = ({ item, interactions }) => {
  if (!item) {
    return (
      <aside className="w-1/4 xl:w-1/5 bg-background-light p-6 border-l border-primary/50 flex items-center justify-center">
        <div className="text-center text-foreground/60">
          <BriefcaseIcon className="w-12 h-12 mx-auto mb-4 text-foreground/30" />
          <p>Select an item to see its dashboard and AI co-pilot.</p>
        </div>
      </aside>
    );
  }

  const renderDashboardContent = () => {
    if (isDeal(item)) {
      return (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-foreground/90">Predictive Scoring</h3>
          <div className="flex justify-center bg-background/50 p-4 rounded-lg">
            <HealthScore 
              score={item.ai_health_score} 
              label="Deal Health Score"
              history={item.ai_health_score_history}
            />
          </div>
        </div>
      );
    }
     if (isSupportTicket(item)) {
        const getStatusClasses = (status: SupportTicketStatus) => {
            switch (status) {
                case SupportTicketStatus.OPEN: return 'bg-red-500/20 text-red-300';
                case SupportTicketStatus.PENDING: return 'bg-accent/20 text-accent';
                case SupportTicketStatus.CLOSED: return 'bg-primary/20 text-primary';
            }
        }
        return (
            <div>
                 <h3 className="text-lg font-semibold mb-4 text-foreground/90">Ticket Status</h3>
                 <div className="bg-background/50 p-4 rounded-lg text-center">
                    <span className={`px-4 py-2 text-sm font-bold rounded-full ${getStatusClasses(item.status)}`}>
                        {item.status}
                    </span>
                 </div>
            </div>
        )
    }
    if (isProspectProfile(item)) {
      return (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-foreground/90">Prospect Profile</h3>
          <div className="bg-background/50 p-4 rounded-lg space-y-2 text-sm">
            <p><span className="font-semibold">Company:</span> {item.company_name}</p>
            <p><span className="font-semibold">Industry:</span> {item.industry}</p>
          </div>
        </div>
      );
    }
    // Placeholder for Company/Contact specific dashboards in the future
    return <div className="text-sm text-foreground/60">No specific dashboard for this item type.</div>;
  };

  return (
    <aside className="w-1/4 xl:w-1/5 bg-background-light p-6 border-l border-primary/50 overflow-y-auto">
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>
      
      {renderDashboardContent()}
      
      <CoPilot 
        deal={isDeal(item) ? item : undefined}
        company={isCompany(item) ? item : undefined}
        contact={isContact(item) ? item : undefined}
        ticket={isSupportTicket(item) ? item : undefined}
        prospect={isProspectProfile(item) ? item : undefined}
        interactions={interactions}
      />

    </aside>
  );
};
