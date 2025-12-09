import { BIMElement } from './types';

// Models
export const MODEL_FAST = 'gemini-2.5-flash';
export const MODEL_REASONING = 'gemini-3-pro-preview';

// Mock BIM Data for "Data-Driven Construction" Simulation
export const MOCK_BIM_DATA: BIMElement[] = [
  { id: 'W-101', type: 'Wall', material: 'Concrete C30', volume: 12.5, costEstimate: 1250, zone: 'L1-North' },
  { id: 'W-102', type: 'Wall', material: 'Brick', volume: 8.2, costEstimate: 410, zone: 'L1-South' },
  { id: 'C-201', type: 'Column', material: 'Concrete C40', volume: 3.1, costEstimate: 465, zone: 'L1-Core' },
  { id: 'C-202', type: 'Column', material: 'Concrete C40', volume: 3.1, costEstimate: 465, zone: 'L1-Core' },
  { id: 'S-301', type: 'Slab', material: 'Concrete C30', volume: 45.0, costEstimate: 4500, zone: 'L1-Floor' },
  { id: 'B-401', type: 'Beam', material: 'Steel', volume: 1.2, costEstimate: 3000, zone: 'L1-Ceiling' },
];

export const SYSTEM_INSTRUCTION_ACCOUNTING = `
You are a Senior ERP Architect and Accounting AI Assistant specialized in the Construction domain.
Your goal is to extract structured financial data from unstructured documents (invoices, contracts).
You must identify the 'invoiceId', 'vendorName', 'totalAmount', and suggest a 'glAccountCode' based on the nature of the expense.
Always maintain high precision for numerical values.
Provide a 'confidenceScore' (0.0 - 1.0) based on image clarity and field presence.
`;

export const SYSTEM_INSTRUCTION_PROCUREMENT = `
You are a Procurement Agent AI. You help Project Managers create Purchase Orders (PO).
You MUST use the tool 'check_material_price' to fetch real-time prices before making a recommendation.
Do not guess prices. If you don't know the price, call the tool.
After checking prices, if the user agrees, generate a JSON summary of the PO.
`;

export const SYSTEM_INSTRUCTION_SAFETY = `
You are a Site Safety Officer & Technical Assistant.
Answer questions strictly based on the provided 'Project Alpha Safety Handbook' content.
If the answer is not in the handbook, state that you don't know and recommend consulting the physical manual.
Do not hallucinate safety procedures.
`;

// Simulated RAG Data Source (Corpus)
export const SAFETY_HANDBOOK_CONTENT = `
PROJECT ALPHA SAFETY HANDBOOK (REV 2.0)

SECTION 1: WORKING AT HEIGHTS
1.1. Definition: Work at height is defined as work in any place where, if precautions were not taken, a person could fall a distance liable to cause personal injury.
1.2. Fall Protection: Mandatory for any work above 1.8 meters (6 feet).
1.3. Harness Inspection: Full-body harnesses must be inspected daily before use.
1.4. Scaffolding: All scaffolding must be tagged (Green = Safe, Red = Do Not Use) and inspected weekly by a certified supervisor.

SECTION 2: EXCAVATION & TRENCHING
2.1. Permits: Excavation Permit required for depths > 1.2 meters.
2.2. Egress: Ladders or ramps must be located within 7.5 meters of all workers in trenches > 1.2 meters deep.
2.3. Soil Classification: Soil type must be determined by a competent person (Type A, B, or C) to determine sloping requirements.

SECTION 3: PPE (PERSONAL PROTECTIVE EQUIPMENT)
3.1. Hard Hats: Class G or E hard hats must be worn at all times within the construction perimeter.
3.2. High Visibility: ANSI Class 2 vests are minimum requirement; Class 3 required for night work.
3.3. Footwear: Steel-toed or composite-toed boots are mandatory.
`;
