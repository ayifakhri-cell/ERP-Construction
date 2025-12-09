export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  AWAITING_APPROVAL = 'AWAITING_APPROVAL'
}

export enum ValidationStatus {
  VALID = 'VALID',
  REQUIRES_HITL_APPROVAL = 'REQUIRES_HITL_APPROVAL',
  REJECTED = 'REJECTED'
}

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  glAccount?: string; // e.g., "5000-Materials"
}

export interface ExtractedInvoice {
  invoiceId: string;
  vendorName: string;
  date: string;
  totalAmount: number;
  currency: string;
  glAccountCode: string; // Suggested GL Account for the total/main category
  items: LineItem[];
  confidenceScore: number;
  validationStatus?: ValidationStatus;
  discrepancyNote?: string;
}

export interface BIMElement {
  id: string;
  type: 'Wall' | 'Column' | 'Slab' | 'Beam';
  material: string;
  volume: number; // m3
  costEstimate: number;
  zone: string;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  isToolCall?: boolean;
  toolName?: string;
  toolArgs?: any;
  toolResult?: any;
}

export interface ProcurementAgentState {
  messages: ChatMessage[];
  generatedPO?: ExtractedInvoice; // Reusing structure for PO
}
