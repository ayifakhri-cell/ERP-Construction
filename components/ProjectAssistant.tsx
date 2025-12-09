import React, { useState } from 'react';
import { MessageSquare, BookOpen, ChevronRight, User, Bot, AlertCircle, FileText } from 'lucide-react';
import { queryProjectKnowledgeBase } from '../services/geminiService.ts';
import { ChatMessage } from '../types.ts';

const ProjectAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
     { role: 'model', content: "I am the Site Safety & Protocol Assistant. I am grounded in the 'Project Alpha Safety Handbook'. Ask me about height regulations, excavation permits, or PPE.", timestamp: Date.now() }
  ]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    const userMsg: ChatMessage = { role: 'user', content: query, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
       const response = await queryProjectKnowledgeBase(userMsg.content);
       setMessages(prev => [...prev, { role: 'model', content: response, timestamp: Date.now() }]);
    } catch (e) {
       setMessages(prev => [...prev, { role: 'model', content: "Error accessing knowledge base.", timestamp: Date.now() }]);
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
       {/* Left: Chat Interface */}
       <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
             <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <Bot size={18} className="text-blue-600"/> Site Assistant
             </h3>
             <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-200">Grounded: Project Alpha Handbook</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
             {messages.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                   <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-green-600 text-white'}`}>
                      {msg.role === 'user' ? <User size={16} /> : <BookOpen size={16} />}
                   </div>
                   <div className={`p-4 rounded-lg text-sm max-w-[80%] shadow-sm ${
                      msg.role === 'user' 
                         ? 'bg-slate-800 text-white rounded-tr-none' 
                         : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                   }`}>
                      {msg.content}
                   </div>
                </div>
             ))}
             {loading && (
                <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center"><BookOpen size={16} /></div>
                   <div className="bg-white border border-slate-200 p-4 rounded-lg rounded-tl-none shadow-sm text-xs text-slate-500 flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                      Consulting Knowledge Base...
                   </div>
                </div>
             )}
          </div>

          <div className="p-4 bg-white border-t border-slate-100">
             <div className="relative">
                <input 
                   type="text" 
                   value={query}
                   onChange={(e) => setQuery(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                   placeholder="Ask about safety protocols (e.g., 'What is the rule for ladders in trenches?')"
                   className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                />
                <button 
                   onClick={handleSearch}
                   disabled={loading}
                   className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                   <MessageSquare size={16} />
                </button>
             </div>
          </div>
       </div>

       {/* Right: Context Info */}
       <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Active Knowledge Source</h3>
          
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-4 group cursor-pointer hover:border-blue-300 transition">
             <div className="flex items-start gap-3">
                <div className="bg-red-100 text-red-600 p-2 rounded">
                   <FileText size={20} />
                </div>
                <div>
                   <h4 className="text-sm font-semibold text-slate-700 group-hover:text-blue-600">Alpha_Safety_Rev2.pdf</h4>
                   <p className="text-xs text-slate-500 mt-1">Uploaded: 2 hours ago</p>
                   <p className="text-xs text-slate-500">Size: 4.2 MB</p>
                </div>
             </div>
          </div>

          <div className="border-t border-slate-200 pt-4 mt-4">
             <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Key Topics Indexed</h4>
             <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                   <ChevronRight size={14} className="text-blue-500" />
                   Working at Heights (>1.8m)
                </li>
                <li className="flex items-center gap-2">
                   <ChevronRight size={14} className="text-blue-500" />
                   Excavation Permits
                </li>
                 <li className="flex items-center gap-2">
                   <ChevronRight size={14} className="text-blue-500" />
                   PPE Requirements
                </li>
                <li className="flex items-center gap-2">
                   <ChevronRight size={14} className="text-blue-500" />
                   Scaffolding Tags
                </li>
             </ul>
          </div>

          <div className="mt-6 bg-blue-100/50 p-4 rounded-lg border border-blue-100 text-xs text-blue-800 flex gap-2 items-start">
             <AlertCircle size={16} className="shrink-0 mt-0.5" />
             This assistant uses Retrieval-Augmented Generation (RAG). Answers are strictly grounded in uploaded documents to prevent hallucination.
          </div>
       </div>
    </div>
  );
};

export default ProjectAssistant;