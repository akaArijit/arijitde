export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'CONVERTED';

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  utrId?: string;
  screenshotUrl?: string;
  status: PaymentStatus;
  createdAt: Date;
}

export interface Lead {
  id: string;
  userId: string;
  scoreId?: string;
  name: string;
  phone: string;
  slot?: Date;
  status: LeadStatus;
  notes?: string;
  createdAt: Date;
}
