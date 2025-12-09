import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, FileText, Loader2, Save } from 'lucide-react';
import { extractInvoiceData } from '../services/geminiService.ts';
import { ExtractedInvoice, AppStatus, ValidationStatus } from '../types.ts';

// Mock PO Database for Reconciliation
const MOCK_PO_DB: Record<string, { expectedAmount: number, status: string }> = {
  "INV-2024-001": { expectedAmount: 1500.00, status: "ISSUED" },
  "INV-2024-002": { expectedAmount: 4200.50, status: "ISSUED" },
  // INV-2024-003 is missing (Unplanned expense)
};

const InvoiceProcessor: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [invoiceData, setInvoiceData] = useState<ExtractedInvoice | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus(AppStatus.PROCESSING);
    setInvoiceData(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      setFilePreview(base64Data);

      try {
        const base64Content = base64Data.split(',')[1];
        let extracted = await extractInvoiceData(base64Content, file.type);
        
        // --- Task B: Reconciliation Logic ---
        // Validate Confidence & Discrepancies
        let validationStatus = ValidationStatus.VALID;
        let note = "Matched with PO.";

        const existingPO = MOCK_PO_DB[extracted.invoiceId];
        
        if (extracted.confidenceScore < 0.85) {
            validationStatus = ValidationStatus.REQUIRES_HITL_APPROVAL;
            note = "Low confidence score (< 85%). Manual review required.";
        } else if (!existingPO) {
            validationStatus = ValidationStatus.REQUIRES_HITL_APPROVAL;
            note = "PO not found in database. Unplanned expense.";
        } else {
            const discrepancy = Math.abs(extracted.totalAmount - existingPO.expectedAmount);
            if (discrepancy > 500) {
                 validationStatus = ValidationStatus.REQUIRES_HITL_APPROVAL;
                 note = `Amount discrepancy > $500. Expected: ${existingPO.expectedAmount}, Scanned: ${extracted.totalAmount}`;
            }
        }

        extracted.validationStatus = validationStatus;
        extracted.discrepancyNote = note;

        setInvoiceData(extracted);
        setStatus(AppStatus.AWAITING_APPROVAL);
      } catch (error) {
        console.error(error);
        setStatus(AppStatus.ERROR);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApprove = () => {
    setStatus(AppStatus.SUCCESS);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Left Panel: Upload & Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[600px]">
        <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl flex justify-between items-center">
           <h3 className="font-semibold text-slate-700">Source Document (PDF/Img)</h3>
           {status === AppStatus.PROCESSING && <span className="text-xs text-blue-600 flex items-center gap-1"><Loader2 className="animate-spin" size={12}/> Analyzing Layout...</span>}
        </div>
        
        <div className="flex-1 p-6 flex flex-col items-center justify-center bg-slate-50/50 m-2 border-2 border-dashed border-slate-200 rounded-lg relative overflow-hidden">
           {filePreview ? (
             filePreview.startsWith('data:image') ? (
               <img src={filePreview} alt="Invoice" className="max-h-full object-contain shadow-lg" />
             ) : (
                <div className="text-center p-8 bg-white shadow-sm rounded-lg border border-slate-200">
                    <FileText size={48} className="text-red-500 mx-auto mb-4" />
                    <p className="text-sm font-medium text-slate-700">PDF Document Loaded</p>
                    <p className="text-xs text-slate-500">Multimodal extraction active</p>
                </div>
             )
           ) : (
             <div className="text-center">
               <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <UploadCloud size={32} />
               </div>
               <p className="text-sm font-medium text-slate-700 mb-1">Upload Invoice</p>
               <p className="text-xs text-slate-500 mb-4">Gemini 2.5 Flash (Multimodal)</p>
               <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm"
               >
                 Select File
               </button>
             </div>
           )}
           <input 
             type="file" 
             ref={fileInputRef} 
             className="hidden" 
             accept="application/pdf,image/*" 
             onChange={handleFileChange} 
           />
        </div>
      </div>

      {/* Right Panel: Extracted Data (HITL) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[600px]">
        <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl flex justify-between items-center">
           <h3 className="font-semibold text-slate-700">Data Reconciliation (HITL)</h3>
           {invoiceData && (
             <span className={`text-xs px-2 py-1 rounded-full border ${invoiceData.confidenceScore > 0.8 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                Conf: {(invoiceData.confidenceScore * 100).toFixed(0)}%
             </span>
           )}
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {status === AppStatus.PROCESSING ? (
             <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-60">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-sm text-slate-500">Extracting JSON schema...</p>
             </div>
          ) : !invoiceData ? (
             <div className="h-full flex items-center justify-center text-slate-400 text-sm">
               <p>Upload a document to trigger extraction pipeline.</p>
             </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               
               {/* Validation Status Banner */}
               {invoiceData.validationStatus === ValidationStatus.REQUIRES_HITL_APPROVAL && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex gap-3 items-start">
                     <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={18} />
                     <div>
                        <h4 className="text-sm font-bold text-orange-800">Review Required</h4>
                        <p className="text-xs text-orange-700 mt-1">{invoiceData.discrepancyNote}</p>
                     </div>
                  </div>
               )}

               {/* Header Info */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <label className="text-xs font-semibold text-slate-500 uppercase">Invoice ID</label>
                     <input type="text" defaultValue={invoiceData.invoiceId} className="w-full p-2 border border-slate-200 rounded text-sm bg-slate-50 font-mono" />
                  </div>
                   <div className="space-y-1">
                     <label className="text-xs font-semibold text-slate-500 uppercase">GL Code</label>
                     <input type="text" defaultValue={invoiceData.glAccountCode} className="w-full p-2 border border-slate-200 rounded text-sm bg-indigo-50 text-indigo-700 border-indigo-100 font-medium" />
                  </div>
                  <div className="space-y-1 col-span-2">
                     <label className="text-xs font-semibold text-slate-500 uppercase">Vendor</label>
                     <input type="text" defaultValue={invoiceData.vendorName} className="w-full p-2 border border-slate-200 rounded text-sm bg-slate-50" />
                  </div>
               </div>

               {/* Line Items */}
               <div>
                 <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Line Items</label>
                 <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                       <thead className="bg-slate-50 text-slate-500 font-medium">
                          <tr>
                             <th className="p-2 pl-4">Item</th>
                             <th className="p-2 text-right">Qty</th>
                             <th className="p-2 text-right">Total</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {invoiceData.items.map((item, idx) => (
                             <tr key={idx}>
                                <td className="p-2 pl-4">{item.description}</td>
                                <td className="p-2 text-right text-slate-500">{item.quantity}</td>
                                <td className="p-2 text-right font-medium">{item.total.toLocaleString()}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
               </div>

               {/* Totals */}
               <div className="flex justify-between items-end pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                     Extraction Pipeline v2.1
                  </div>
                  <div className="text-right">
                     <p className="text-sm text-slate-500">Total Amount</p>
                     <p className="text-2xl font-bold text-slate-800">{invoiceData.currency} {invoiceData.totalAmount.toLocaleString()}</p>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-3">
           <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Reject</button>
           <button 
             disabled={status !== AppStatus.AWAITING_APPROVAL}
             onClick={handleApprove}
             className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all ${
               status === AppStatus.SUCCESS 
                 ? 'bg-green-600 text-white cursor-default'
                 : invoiceData?.validationStatus === ValidationStatus.REQUIRES_HITL_APPROVAL
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
             }`}
           >
             {status === AppStatus.SUCCESS ? (
                <><CheckCircle size={16} /> Posted to GL</>
             ) : invoiceData?.validationStatus === ValidationStatus.REQUIRES_HITL_APPROVAL ? (
                <><CheckCircle size={16} /> Approve Override</>
             ) : (
                <><Save size={16} /> Validate & Post</>
             )}
           </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceProcessor;