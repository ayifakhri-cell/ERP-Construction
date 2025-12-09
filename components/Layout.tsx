import React, { ReactNode } from 'react';
import { LayoutDashboard, FileText, Database, ShoppingCart, Activity, HardHat } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NavItem = ({ id, label, icon: Icon, active, onClick }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
      active
        ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
               <Activity className="text-white" size={20} />
            </div>
            <span className="text-lg font-bold text-slate-800 tracking-tight">ConstruFlow</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium tracking-wide uppercase">ERP Core Module</p>
        </div>

        <nav className="flex-1 mt-6">
          <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} active={activeTab === 'dashboard'} onClick={onTabChange} />
          <NavItem id="invoices" label="Invoice Processing" icon={FileText} active={activeTab === 'invoices'} onClick={onTabChange} />
          <NavItem id="bim" label="BIM Intelligence" icon={Database} active={activeTab === 'bim'} onClick={onTabChange} />
          <NavItem id="procurement" label="Procurement Agent" icon={ShoppingCart} active={activeTab === 'procurement'} onClick={onTabChange} />
          <NavItem id="assistant" label="Site Assistant (RAG)" icon={HardHat} active={activeTab === 'assistant'} onClick={onTabChange} />
        </nav>
        
        <div className="p-4 border-t border-slate-100">
           <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                JD
              </div>
              <div className="text-xs">
                 <p className="font-semibold text-slate-700">John Doe</p>
                 <p className="text-slate-500">Chief Architect</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center">
           <h1 className="text-xl font-semibold text-slate-800 capitalize">{activeTab.replace('-', ' ')}</h1>
           <div className="flex items-center gap-4">
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium border border-green-200">System Operational</span>
           </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
