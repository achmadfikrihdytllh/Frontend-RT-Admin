import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, MapPin, Users, Wallet, DollarSign, FileText } from 'lucide-react';
import { useAppContext } from '../context/AppContext';


export default function Layout() {
  const location = useLocation();

  const menus = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Data Rumah', path: '/houses', icon: MapPin },
    { name: 'Data Penghuni', path: '/residents', icon: Users },
    { name: 'Laporan Bulanan', path: '/report', icon: FileText },
    { name: 'Pembayaran & Laporan', path: '/payments', icon: Wallet },
    { name: 'Pengeluaran', path: '/expenses', icon: DollarSign },

  ];



  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      <aside className="w-64 bg-white border-r border-slate-200 shadow-sm flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">RT Admin</h1>
          <p className="text-sm text-slate-500 mt-1">Sistem Informasi Warga</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menus.map((menu) => {
            const Icon = menu.icon;
            const isActive = location.pathname === menu.path;
            
            return (
              <Link
                key={menu.name}
                to={menu.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                <span>{menu.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-5">
          <h2 className="text-xl font-bold text-slate-800">
            {menus.find(m => m.path === location.pathname)?.name || 'Halaman'}
          </h2>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
}