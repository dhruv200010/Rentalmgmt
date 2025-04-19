export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  source: string;
  notes: string;
  createdAt: string;
} 