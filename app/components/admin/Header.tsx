import { Fragment } from 'react';
import { Form, Link } from '@remix-run/react';
import { Menu, Transition } from '@headlessui/react';
import {
  BellIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon, // Hamburger icon for toggle
  XMarkIcon, // Close icon for toggle
} from '@heroicons/react/24/outline';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarExpanded: boolean;
}

export default function Header({ toggleSidebar, isSidebarExpanded }: HeaderProps) {
  // Dummy notifications for demonstration, replace with actual data loading
  const notifications = [
    { id: 1, message: 'New client form submitted (Acme Corp)', time: '5 min ago', link: '#' },
    { id: 2, message: 'Invoice #1234 requested payment', time: '1 hour ago', link: '#' },
    { id: 3, message: 'System update completed successfully', time: 'Yesterday', link: '#' },
  ];

  const userNavigation = [
    { name: 'Profile Settings', href: '/admin/profile', icon: UserCircleIcon },
    { name: 'Website Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  ];

  return (
    <header className="bg-white shadow-sm py-3 px-6 flex items-center justify-between z-10 relative border-b border-gray-200">
      {/* Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        aria-label={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isSidebarExpanded ? (
          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        )}
      </button>

      {/* Search Bar - Placeholder, can be integrated later */}
      <div className="flex-grow ml-4">
        {/* <input
          type="text"
          placeholder="Search..."
          className="w-full max-w-xs px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        /> */}
      </div>

      {/* Right Side - Notifications & User Profile */}
      <div className="flex items-center space-x-4">
        {/* Notifications Dropdown */}
        <Menu as="div" className="relative">
          <Menu.Button
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            aria-label="Notifications"
          >
            <BellIcon className="h-6 w-6" aria-hidden="true" />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 -mr-1 -mt-1 h-3 w-3 rounded-full bg-red-600 ring-2 ring-white">
                <span className="sr-only">{notifications.length} new notifications</span>
              </span>
            )}
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
              <div className="px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-100">Notifications ({notifications.length})</div>
              {notifications.length > 0 ? (
                <div className="max-h-60 overflow-y-auto">
                  {notifications.map((notif) => (
                    <Menu.Item key={notif.id}>
                      {({ active }) => (
                        <Link
                          to={notif.link}
                          className={`block px-4 py-3 ${
                            active ? 'bg-gray-100' : ''
                          } transition-colors duration-150`}
                        >
                          <p className="text-sm font-medium text-gray-800">{notif.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                        </Link>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">No new notifications.</div>
              )}
              <div className="px-4 py-2 border-t border-gray-100">
                <Link
                  to="/admin/activity-logs"
                  className="block text-blue-600 hover:underline text-sm text-center py-1"
                >
                  View All Activity
                </Link>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>

        {/* Admin Profile Dropdown */}
        <Menu as="div" className="relative">
          <Menu.Button
            className="flex items-center space-x-2 p-1 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            aria-label="User Profile"
          >
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" // Example profile image
              alt="Admin Avatar"
              className="w-8 h-8 rounded-full border border-gray-300"
            />
            <span className="font-medium text-gray-800 hidden md:block">Admin User</span>
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
              <div className="px-4 py-3">
                <p className="text-sm">Signed in as</p>
                <p className="font-medium text-gray-900 truncate">admin@example.com</p>
              </div>
              <div className="py-1">
                {userNavigation.map((item) => (
                  <Menu.Item key={item.name}>
                    {({ active }) => (
                      <Link
                        to={item.href}
                        className={`flex items-center px-4 py-2 text-sm text-gray-700 ${
                          active ? 'bg-gray-100' : ''
                        }`}
                      >
                        <item.icon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                        {item.name}
                      </Link>
                    )}
                  </Menu.Item>
                ))}
              </div>
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <Form action="/logout" method="post" className="w-full">
                      <button
                        type="submit"
                        className={`flex items-center w-full text-left px-4 py-2 text-sm text-red-600 ${
                          active ? 'bg-red-50' : ''
                        }`}
                      >
                        <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-red-400" aria-hidden="true" />
                        Logout
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