import { Fragment } from 'react';
import { Form, Link, useLocation } from '@remix-run/react';
import { Menu, Transition } from '@headlessui/react';
import {
  Bell,
  Settings,
  User,
  LogOut,
  Menu as MenuIcon,
  Search,
  ChevronDown,
  Layout
} from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarExpanded: boolean;
}

export default function Header({ toggleSidebar, isSidebarExpanded }: HeaderProps) {
  const location = useLocation();

  const notifications = [
    { id: 1, message: 'New company registration: Vortex AI', time: 'Just now', type: 'success' },
    { id: 2, message: 'Payment verification required for #INV-902', time: '12m ago', type: 'warning' },
    { id: 3, message: 'System health check: All services operational', time: '1h ago', type: 'info' },
  ];

  const userNavigation = [
    { name: 'Admin Profile', href: '/admin/profile', icon: User },
    { name: 'Global Settings', href: '/admin/settings', icon: Settings },
  ];

  const getBreadcrumb = () => {
    const path = location.pathname.split('/').filter(Boolean);
    if (path.length <= 1) return 'Dashboard';
    return path[path.length - 1].charAt(0).toUpperCase() + path[path.length - 1].slice(1).replace(/-/g, ' ');
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-6 md:px-10 z-20 sticky top-0 shadow-sm shadow-slate-200/20">
      {/* Left Group */}
      <div className="flex items-center gap-8">
        <button
          onClick={toggleSidebar}
          className="p-2.5 rounded-[14px] text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300 group"
          aria-label="Toggle Navigation"
        >
          <MenuIcon className="h-6 w-6 transition-transform group-active:scale-90" strokeWidth={2.5} />
        </button>

        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Layout className="h-4 w-4 text-slate-300" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Platform</span>
          </div>
          <span className="h-3 w-[1.5px] bg-slate-200"></span>
          <span className="text-sm font-black text-[#000033] tracking-tight">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Search Bar - Modern & Responsive */}
      <div className="flex-1 max-w-xl mx-10 hidden md:block">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" strokeWidth={3} />
          <input
            type="text"
            placeholder="Search resources, users, or reports..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-transparent rounded-[20px] text-sm font-bold text-[#000033] placeholder:text-slate-400 focus:bg-white focus:border-indigo-100 focus:ring-8 focus:ring-indigo-600/5 transition-all outline-none"
          />
        </div>
      </div>

      {/* Real-time Actions */}
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Alerts */}
        <Menu as="div" className="relative">
          <Menu.Button className="relative p-2.5 rounded-[14px] text-slate-400 hover:text-indigo-600 hover:bg-emerald-50 transition-all group active:scale-95">
            <Bell className="h-6 w-6" strokeWidth={2.5} />
            <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-4 ring-white shadow-lg animate-pulse"></span>
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="transform opacity-0 scale-95 translate-y-2"
            enterTo="transform opacity-100 scale-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="transform opacity-100 scale-100 translate-y-0"
            leaveTo="transform opacity-0 scale-95 translate-y-2"
          >
            <Menu.Items className="absolute right-0 mt-4 w-96 origin-top-right bg-white rounded-[32px] shadow-2xl shadow-[#000033]/10 ring-1 ring-black/5 focus:outline-none overflow-hidden border border-slate-50">
              <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <h3 className="text-lg font-black text-[#000033] tracking-tight">Intelligence</h3>
                <span className="text-[10px] font-black text-white bg-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-600/30">3 New</span>
              </div>
              <div className="divide-y divide-slate-50 max-h-[480px] overflow-y-auto custom-scrollbar">
                {notifications.map((notif) => (
                  <Menu.Item key={notif.id}>
                    {({ active }) => (
                      <div className={`p-6 flex gap-6 transition-colors ${active ? 'bg-slate-50/50' : ''} cursor-default group`}>
                        <div className={`mt-1 h-3 w-3 rounded-full ring-4 shrink-0 transition-all group-hover:scale-125 ${notif.type === 'success' ? 'bg-emerald-500 ring-emerald-50' :
                          notif.type === 'warning' ? 'bg-amber-500 ring-amber-50' : 'bg-indigo-500 ring-indigo-50'
                          }`} />
                        <div className="flex-1">
                          <p className="text-sm font-black text-[#000033] leading-snug tracking-tight mb-1">{notif.message}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{notif.time}</p>
                        </div>
                      </div>
                    )}
                  </Menu.Item>
                ))}
              </div>
              <Link to="/admin/activity-logs" className="block text-center py-5 bg-slate-50/30 text-[11px] font-black uppercase tracking-widest text-indigo-600 hover:bg-white transition-all border-t border-slate-50">
                Explore Full History
              </Link>
            </Menu.Items>
          </Transition>
        </Menu>

        {/* Global Admin Access */}
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-4 p-1.5 rounded-[18px] hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100">
            <div className="h-10 w-10 rounded-[14px] bg-gradient-to-br from-indigo-500 to-[#000033] flex items-center justify-center text-white font-black text-xs shadow-lg shadow-indigo-500/10 group-hover:scale-105 transition-transform">
              AD
            </div>
            <div className="hidden lg:block text-left mr-2">
              <p className="text-[13px] font-black text-[#000033] leading-none mb-1">Admin System</p>
              <p className="text-[10px] font-bold text-slate-400 leading-none lowercase tracking-tighter">super_admin</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-all" strokeWidth={3} />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="transform opacity-0 scale-95 translate-y-2"
            enterTo="transform opacity-100 scale-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="transform opacity-100 scale-100 translate-y-0"
            leaveTo="transform opacity-0 scale-95 translate-y-2"
          >
            <Menu.Items className="absolute right-0 mt-4 w-64 origin-top-right bg-white rounded-[28px] shadow-2xl shadow-[#000033]/15 ring-1 ring-black/5 divide-y divide-slate-50 focus:outline-none border border-slate-50 overflow-hidden p-2">
              <div className="space-y-1 mb-1">
                {userNavigation.map((item) => (
                  <Menu.Item key={item.name}>
                    {({ active }) => (
                      <Link
                        to={item.href}
                        className={`flex items-center px-4 py-3.5 rounded-[18px] text-[13px] font-bold ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
                          } transition-all gap-4 group/item`}
                      >
                        <item.icon className={`h-5 w-5 transition-transform group-hover/item:scale-110 ${active ? 'text-indigo-600 opacity-100' : 'opacity-40'}`} strokeWidth={2.5} />
                        {item.name}
                      </Link>
                    )}
                  </Menu.Item>
                ))}
              </div>
              <div className="pt-1">
                <Menu.Item>
                  {({ active }) => (
                    <Form action="/logout" method="post" className="w-full">
                      <button
                        type="submit"
                        className={`flex items-center w-full px-4 py-3.5 rounded-[18px] text-[13px] font-black text-rose-600 ${active ? 'bg-rose-50' : 'bg-transparent'
                          } transition-all gap-4 group/item`}
                      >
                        <LogOut className="h-5 w-5 transition-transform group-hover/item:-translate-x-1" strokeWidth={2.5} />
                        Sign Out
                      </button>
                    </Form>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
}