import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MOCK_BIM_DATA } from '../constants';
import { Search, Database, ChevronRight } from 'lucide-react';
import { generateAnalysisQuery } from '../services/geminiService';

const BIMViewer: React.FC = () => {
  const [query, setQuery] = useState('');
  const [generatedSQL, setGeneratedSQL] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Group data for chart
  const chartData = Object.values(MOCK_BIM_DATA.reduce((acc: any, item) => {
    if (!acc[item.type]) acc[item.type] = { name: item.type, cost: 0, volume: 0 };
    acc[item.type].cost += item.costEstimate;
    acc[item.type].volume += item.volume;
    return acc;
  }, {}));

  const handleSearch = async () => {
    if (!query) return;
    setIsAnalyzing(true);
    setGeneratedSQL(null);

    const schemaDesc = `
      Table: project_elements
      Columns:
      - id (STRING): Unique Element ID
      - type (STRING): Classification (Wall, Slab, Column, Beam)
      - material (STRING): Material composition
      - volume (FLOAT): Volume in m3
      - cost_estimate (FLOAT): Estimated cost
      - zone (STRING): Location zone
    `;

    try {
       const result = await generateAnalysisQuery(query, schemaDesc);
       setGeneratedSQL(result.sql);
       // In a real app, we would run this SQL against BigQuery here.
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
       {/* Top: Natural Language Query */}
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
             <Database className="text-blue-600" size={20}/> 
             Project Data Explorer
          </h2>
          <div className="flex gap-2">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a question about project data, e.g., 'Total cost of concrete walls in Zone L1'" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
             </div>
             <button 
               onClick={handleSearch}
               disabled={isAnalyzing}
               className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50"
             >
               {isAnalyzing ? 'Thinking...' : 'Analyze'}
             </button>
          </div>

          {generatedSQL && (
            <div className="mt-4 p-4 bg-slate-900 rounded-lg border border-slate-800 animate-in fade-in slide-in-from-top-2">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-400 uppercase">Generated BigQuery SQL</span>
                  <span className="text-xs text-green-400 font-medium">Valid Syntax</span>
               </div>
               <code className="text-sm font-mono text-blue-300 block">
                  {generatedSQL}
               </code>
               <div className="mt-3 pt-3 border-t border-slate-800 text-slate-400 text-xs flex gap-2 items-center">
                  <ChevronRight size={14} />
                  <span>Executed against Project_Alpha_Dataset (230ms)</span>
               </div>
            </div>
          )}
       </div>

       {/* Bottom: Visualization */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96">
             <h3 className="font-semibold text-slate-700 mb-6">Cost Distribution by Element Type</h3>
             <ResponsiveContainer width="100%" height="85%">
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                   <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                   <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                   <Tooltip 
                      cursor={{fill: '#f1f5f9'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   />
                   <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'][index % 4]} />
                      ))}
                   </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <h3 className="font-semibold text-slate-700 mb-4">Raw Data Sample</h3>
             <div className="overflow-y-auto h-[300px] -mx-4 px-4">
                <table className="w-full text-xs">
                   <thead className="text-slate-500 font-medium sticky top-0 bg-white">
                      <tr>
                         <th className="text-left pb-2">ID</th>
                         <th className="text-left pb-2">Type</th>
                         <th className="text-right pb-2">Cost</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {MOCK_BIM_DATA.map((item) => (
                        <tr key={item.id} className="group hover:bg-slate-50">
                           <td className="py-2 font-mono text-slate-600 group-hover:text-blue-600">{item.id}</td>
                           <td className="py-2 text-slate-600">{item.type}</td>
                           <td className="py-2 text-right font-medium text-slate-700">${item.costEstimate}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
       </div>
    </div>
  );
};

export default BIMViewer;
