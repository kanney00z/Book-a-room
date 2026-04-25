import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Key, FileText, Settings, Globe, LogOut, Wrench, Receipt } from 'lucide-react';
import { cn } from '../lib/utils';
import { useData } from '../lib/DataContext';

export default function AdminLayout({ onLogout }: { onLogout?: () => void }) {
  const { settings } = useData();
  const navItems = [
    { name: 'ภาพรวมระบบ (Dashboard)', shortName: 'ภาพรวม', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'จัดการห้องพัก (Rooms)', shortName: 'ห้องพัก', path: '/admin/rooms', icon: Key },
    { name: 'ระบบแจ้งซ่อม (Maintenance)', shortName: 'แจ้งซ่อม', path: '/admin/maintenance', icon: Wrench },
    { name: 'จัดการบิล (Billing)', shortName: 'บิลเช่า', path: '/admin/billing', icon: FileText },
    { name: 'บัญชีรายจ่าย (Expenses)', shortName: 'รายจ่าย', path: '/admin/expenses', icon: Receipt },
  ];

  return (
    <div className="h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-slate-100 p-4 md:p-6 font-sans text-slate-800 overflow-hidden relative z-0">
      {/* Background blobs for depth */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-3xl -z-10"></div>
      
      <div className="h-full grid grid-cols-12 grid-rows-[auto_1fr] md:grid-rows-[auto_minmax(0,1fr)] gap-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <header className="col-span-12 flex items-center justify-between glass-card rounded-[1.5rem] px-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <span className="font-display font-bold text-white text-xl">{(settings.hotelName || 'Modern Stay').charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-slate-900 tracking-tight">{settings.hotelName || 'Modern Stay'}</h1>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-0.5">Admin Workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NavLink 
              to="/"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200/60 hover:bg-white hover:shadow-sm hover:border-indigo-200 hover:text-indigo-600 transition-all duration-300"
            >
              <Globe className="w-4 h-4" /> ดูหน้าเว็บไซต์
            </NavLink>
          </div>
        </header>

        {/* Sidebar */}
        <aside className="hidden md:flex col-span-3 glass-card rounded-[1.5rem] p-5 flex-col space-y-4">
          <div className="px-3 py-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Main Menu</h2>
          </div>
          <nav className="flex-1 space-y-2">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-all duration-300 cursor-pointer group',
                    isActive 
                      ? 'bg-slate-900 text-white shadow-md font-medium' 
                      : 'text-slate-600 hover:bg-white hover:shadow-sm font-medium border border-transparent hover:border-slate-100'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "text-indigo-400 scale-110" : "text-slate-400 group-hover:text-indigo-500")} />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          
          <div className="mt-auto pt-4 flex flex-col gap-4">
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[1.25rem] p-5 text-white shadow-lg shadow-indigo-600/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-2">แจ้งเตือนระบบ</p>
              <p className="text-sm font-semibold leading-relaxed">ข้อมูลทั้งหมดเชื่อมต่อ<br/>แบบ Real-time แล้ว</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-medium text-indigo-100">ระบบทำงานปกติ</span>
              </div>
            </div>

            <button 
              onClick={onLogout}
              className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-semibold rounded-xl transition-all duration-300"
            >
              <LogOut className="w-4 h-4" /> ออกจากระบบ
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="col-span-12 md:col-span-9 h-full overflow-hidden">
          <div className="h-full overflow-y-auto rounded-3xl pb-24 md:pb-10 custom-scrollbar pr-2">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200/50 pb-safe pt-2 px-6 flex justify-between items-center z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] pb-4">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300',
                isActive 
                  ? 'text-indigo-600' 
                  : 'text-slate-400 hover:text-slate-600'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  "p-1.5 rounded-xl transition-all duration-300",
                  isActive ? "bg-indigo-50 text-indigo-600 scale-110" : ""
                )}>
                  <item.icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                </div>
                <span className={cn("text-[10px] font-medium transition-all duration-300", isActive ? "font-bold" : "")}>
                  {item.shortName}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
