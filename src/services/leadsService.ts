import { Lead } from '../types/Lead';

const STORAGE_KEY = 'rental_mgmt_leads';

class LeadsService {
  private leads: Lead[] = [];
  private listeners: ((leads: Lead[]) => void)[] = [];

  constructor() {
    this.loadLeads();
  }

  private loadLeads() {
    try {
      const savedLeads = localStorage.getItem(STORAGE_KEY);
      this.leads = savedLeads ? JSON.parse(savedLeads) : [];
    } catch (error) {
      console.error('Error loading leads:', error);
      this.leads = [];
    }
  }

  private saveLeads() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.leads));
    } catch (error) {
      console.error('Error saving leads:', error);
    }
  }

  public getLeads(): Lead[] {
    return [...this.leads];
  }

  public addLead(lead: Omit<Lead, 'id' | 'createdAt'>): Lead {
    const newLead: Lead = {
      ...lead,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    this.leads = [...this.leads, newLead];
    this.saveLeads();
    this.notifyListeners();
    return newLead;
  }

  public updateLead(id: number, updates: Partial<Lead>): Lead | null {
    const index = this.leads.findIndex(lead => lead.id === id);
    if (index === -1) return null;

    const updatedLead = {
      ...this.leads[index],
      ...updates,
    };
    this.leads = [
      ...this.leads.slice(0, index),
      updatedLead,
      ...this.leads.slice(index + 1),
    ];
    this.saveLeads();
    this.notifyListeners();
    return updatedLead;
  }

  public deleteLead(id: number): void {
    this.leads = this.leads.filter(lead => lead.id !== id);
    this.saveLeads();
    this.notifyListeners();
  }

  public subscribe(listener: (leads: Lead[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.leads);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.leads));
  }
}

export const leadsService = new LeadsService(); 