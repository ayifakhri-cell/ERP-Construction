import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Cpu, Tag, ShoppingCart, DollarSign } from 'lucide-react';
import { createProcurementSession, mockMarketPriceTool } from '../services/geminiService.ts';
import { ChatMessage, ExtractedInvoice } from '../types.ts';

const ProcurementAgent: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Construction Procurement Agent online. I can check 'check_material_price' for you and draft POs. Try asking: 'What's the cost for 100 SS_BAR_A?'", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [generatedPO, setGeneratedPO] = useState<ExtractedInvoice | null>(null);
  
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatSessionRef.current = createProcurementSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Correct Usage: Pass object with 'message' property
      let result = await chatSessionRef.current.sendMessage({ message: userMsg.content });
      
      // Handle Tool Calls (Task C: Tool Integration)
      // Correct Usage: result.functionCalls is a property, not a method
      while (result.functionCalls && result.functionCalls.length > 0) {
         const call = result.functionCalls[0];
         
         const toolCallMsg: ChatMessage = {
           role: 'model',
           content: `Calling External API...`,
           isToolCall: true,
           toolName: call.name,
           toolArgs: call.args,
           timestamp: Date.now()
         };
         setMessages(prev => [...prev, toolCallMsg]);

         // Execute Mock Tool (check_material_price)
         let toolResult = {};
         if (call.name === 'check_material_price') {
            const price = mockMarketPriceTool(call.args.material_code);
            toolResult = { price: price, currency: 'USD', timestamp: new Date().toISOString() };
         }

         const toolResultMsg: ChatMessage = {
            role: 'model',
            content: `Price found: $${(toolResult as any).price}`,
            isToolCall: true,
            toolName: call.name,
            toolResult: toolResult,
            timestamp: Date.now() + 100
         };
         setMessages(prev => [...prev, toolResultMsg]);

         // Correct Usage: Send function response as part of message
         result = await chatSessionRef.current.sendMessage({
            message: [{
               functionResponse: {
                  name: call.name,
                  response: toolResult
               }
            }]
         });
      }

      // Correct Usage: result.text is a property
      const modelText = result.text || "";
      setMessages(prev => [...prev, { role: 'model', content: modelText, timestamp: Date.now() }]);

      // Attempt to extract JSON PO from text (if agent generated one)
      const jsonMatch = modelText.match(/```json\n([\s\S]*?)\n```/) || modelText.match(/{[\s\S]*}/);
      if (jsonMatch) {
         try {
            const potentialPO = JSON.parse(jsonMatch[1] || jsonMatch[0]);
            if(potentialPO.totalAmount && potentialPO.items) {
               setGeneratedPO(potentialPO);
            }
         } catch (e) {
            // ignore
         }
      }

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', content: "Error connecting to service.", timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Chat Area */}
      <div className="lg:col-span-2 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
           {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                 <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white'}`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                 </div>
                 <div className={`max-w-[80%] space-y-2`}>
                    {msg.isToolCall && (
                       <div className="bg-slate-100 border border-slate-200 rounded-md p-2 text-xs font-mono text-slate-600 mb-1 flex flex-col gap-1">
                          <div className="flex items-center gap-2 font-bold text-purple-600">
                             <Cpu size={14} />
                             <span>{msg.toolName}({JSON.stringify(msg.toolArgs)})</span>
                          </div>
                          {msg.toolResult && (
                             <div className="text-green-600 bg-green-50 p-1 rounded border border-green-100">
                                Result: {JSON.stringify(msg.toolResult)}
                             </div>
                          )}
                       </div>
                    )}
                    
                    {!msg.isToolCall && (
                       <div className={`p-3 rounded-lg text-sm shadow-sm whitespace-pre-wrap ${
                          msg.role === 'user' 
                             ? 'bg-slate-800 text-white rounded-tr-none' 
                             : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                       }`}>
                          {msg.content}
                       </div>
                    )}
                 </div>
              </div>
           ))}
           {isTyping && (
             <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white"><Bot size={16}/></div>
                <div className="bg-white border border-slate-200 p-3 rounded-lg rounded-tl-none">
                   <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                   </div>
                </div>
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
           <div className="relative">
              <input 
                 type="text" 
                 className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                 placeholder="Type request (e.g., 'Draft PO for 100 SS_BAR_A')"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                 onClick={handleSend}
                 disabled={isTyping || !input.trim()}
                 className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
              >
                 <Send size={16} />
              </button>
           </div>
        </div>
      </div>

      {/* PO Preview Panel */}
      <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-6 text-slate-100 flex flex-col">
         <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
            <ShoppingCart className="text-blue-400" />
            <h3 className="font-semibold">Procurement Draft</h3>
         </div>

         {generatedPO ? (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
               <div className="flex justify-between items-start">
                  <div>
                     <p className="text-xs text-slate-400 uppercase">Vendor</p>
                     <p className="font-medium text-lg">{generatedPO.vendorName || "Market Spot"}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-xs text-slate-400 uppercase">Status</p>
                     <span className="inline-block px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-xs border border-yellow-500/30">DRAFT</span>
                  </div>
               </div>

               <div className="bg-slate-800/50 rounded-lg p-4 space-y-3 border border-slate-700">
                  {generatedPO.items?.map((item, i) => (
                     <div key={i} className="flex justify-between text-sm">
                        <span>{item.description} <span className="text-slate-400">x{item.quantity}</span></span>
                        <span className="font-mono">${item.total?.toLocaleString()}</span>
                     </div>
                  ))}
               </div>

               <div className="pt-4 border-t border-slate-700 flex justify-between items-end">
                  <p className="text-sm text-slate-400">Total Estimate</p>
                  <p className="text-2xl font-bold text-green-400">${generatedPO.totalAmount?.toLocaleString()}</p>
               </div>
               
               <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800 rounded text-xs text-blue-200 flex gap-2">
                  <DollarSign size={14} className="shrink-0 mt-0.5" />
                  Prices verified via external Market API (Simulated).
               </div>

               <button className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium transition shadow-lg shadow-blue-900/20">
                  Submit to ERP
               </button>
            </div>
         ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
               <Tag size={48} className="opacity-20" />
               <p className="text-center text-sm">Ask the agent to check material prices. It will build a PO draft here automatically.</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default ProcurementAgent;