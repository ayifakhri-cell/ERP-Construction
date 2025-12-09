import React, { useState } from 'react';
import Layout from './components/Layout';
import InvoiceProcessor from './components/InvoiceProcessor';
import BIMViewer from './components/BIMViewer';
import ProcurementAgent from './components/ProcurementAgent';
import ProjectAssistant from './components/ProjectAssistant';
import { TrendingUp, Users, AlertCircle } from 'lucide-react';

const DashboardStub = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
           <p className="text-sm text-slate-500 font-medium">Project Budget</p>
           <h3 className="text-2xl font-bold text-slate-800 mt-1">$4,250,000</h3>
        </div>
        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
           <TrendingUp size={20} />
        </div>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
         <div className="bg-blue-600 h-full w-[65%]"></div>
      </div>
      <p className="text-xs text-slate-400 mt-2">65% Utilized</p>
    </div>

    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
           <p className="text-sm text-slate-500 font-medium">Pending Approvals</p>
           <h3 className="text-2xl font-bold text-slate-800 mt-1">12</h3>
        </div>
        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
           <Users size={20} />
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-2">4 Critical Invoices requiring HITL review.</p>
    </div>

    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
           <p className="text-sm text-slate-500 font-medium">Safety Incidents</p>
           <h3 className="text-2xl font-bold text-slate-800 mt-1">0</h3>
        </div>
        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
           <AlertCircle size={20} />
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-2">Last incident: 142 days ago</p>
    </div>
    
    <div className="md:col-span-3 bg-blue-50 border border-blue-100 rounded-xl p-8 text-center mt-4">
       <h2 className="text-xl font-semibold text-blue-900 mb-2">ConstruFlow ERP Core Module (GenAI Pilot)</h2>
       <p className="text-blue-700 max-w-2xl mx-auto">
          Operational modules: Multimodal Invoice Extraction (HITL), BIM Data Intelligence, Procurement Agent (Tool Use), and Site Safety Assistant (RAG).
       </p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardStub />;
      case 'invoices': return <InvoiceProcessor />;
      case 'bim': return <BIMViewer />;
      case 'procurement': return <ProcurementAgent />;
      case 'assistant': return <ProjectAssistant />;
      default: return <DashboardStub />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
