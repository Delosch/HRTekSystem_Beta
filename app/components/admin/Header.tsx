import { Fragment } from 'react';
import { Form, Link, useLocation } from '@remix-run/react';
import { Menu, Transition } from '@headlessui/react';
import {
  BellIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3BottomLeftIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

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
    { name: 'Admin Profile', href: '/admin/profile', icon: UserCircleIcon },
    { name: 'Global Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  ];

  // Map path to breadcrumb label
  const getBreadcrumb = () => {
    const path = location.pathname.split('/').filter(Boolean);
    if (path.length <= 1) return 'Dashboard';
    return path[path.length - 1].charAt(0).toUpperCase() + path[path.length - 1].slice(1).replace(/-/g, ' ');
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 flex items-center justify-between z-20 sticky top-0">
      {/* Left: Sidebar Toggle & Context */}
      <div className="flex items-center gap-6">
        <button
          onClick={toggleSidebar}
          className="p-2.5 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
          aria-label="Toggle Navigation"
        >
          <Bars3BottomLeftIcon className="h-6 w-6" />
        </button>

        <div className="hidden lg:flex items-center gap-3">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Platform</span>
          <span className="h-4 w-[1px] bg-gray-200"></span>
          <span className="text-sm font-extrabold text-gray-900">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Center: Search (Visual Only) */}
      <div className="flex-1 max-w-md mx-8 hidden md:block">
        <div className="relative group">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search resources, users, or reports..."
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50/50 border border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Menu as="div" className="relative">
          <Menu.Button className="relative p-2.5 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
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
            <Menu.Items className="absolute right-0 mt-4 w-96 origin-top-right bg-white rounded-3xl shadow-2xl shadow-indigo-900/10 ring-1 ring-black/5 focus:outline-none overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-sm font-extrabold text-gray-900">Notifications</h3>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                {notifications.map((notif) => (
                  <Menu.Item key={notif.id}>
                    {({ active }) => (
                      <div className={`p-4 flex gap-4 transition-colors ${active ? 'bg-gray-50' : ''}`}>
                        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${notif.type === 'success' ? 'bg-emerald-500' :
                            notif.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                          }`} />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-800 leading-snug">{notif.message}</p>
                          <p className="text-xs font-semibold text-gray-400 mt-1">{notif.time}</p>
                        </div>
                      </div>
                    )}
                  </Menu.Item>
                ))}
              </div>
              <Link to="/admin/activity-logs" className="block text-center py-4 bg-gray-50/50 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors">
                View All Intelligence
              </Link>
            </Menu.Items>
          </Transition>
        </Menu>

        {/* Profile */}
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-3 pl-2 pr-1 h-12 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              AD
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-extrabold text-gray-900 leading-tight">Admin System</p>
              <p className="text-[10px] font-bold text-gray-400 leading-tight lowercase">super_admin</p>
            </div>
            <ChevronDownIcon className="h-4 w-4 text-gray-400 ml-1" />
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
            <Menu.Items className="absolute right-0 mt-4 w-60 origin-top-right bg-white rounded-2xl shadow-2xl shadow-indigo-900/10 ring-1 ring-black/5 divide-y divide-gray-50 focus:outline-none">
              <div className="py-2">
                {userNavigation.map((item) => (
                  <Menu.Item key={item.name}>
                    {({ active }) => (
                      <Link
                        to={item.href}
                        className={`flex items-center px-4 py-2.5 text-sm font-bold ${active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600'
                          } transition-colors gap-3`}
                      >
                        <item.icon className="h-5 w-5 opacity-60" />
                        {item.name}
                      </Link>
                    )}
                  </Menu.Item>
                ))}
              </div>
              <div className="py-2">
                <Menu.Item>
                  {({ active }) => (
                    <Form action="/logout" method="post" className="w-full px-2">
                      <button
                        type="submit"
                        className={`flex items-center w-full px-3 py-2.5 rounded-xl text-sm font-bold text-rose-600 ${active ? 'bg-rose-50' : 'bg-transparent'
                          } transition-colors gap-3`}
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
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