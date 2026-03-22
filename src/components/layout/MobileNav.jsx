import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Users, Settings, Home, Receipt, BookOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const MobileNav = () => {
  const { user } = useApp();

  const adminMenu = [
    { path: '/admin', icon: LayoutDashboard, label: 'Kasa' },
    { path: '/admin/tables', icon: UtensilsCrossed, label: 'Masalar' },
    { path: '/admin/menu', icon: Users, label: 'Menü' },
    { path: '/admin/reports', icon: Settings, label: 'Raporlar' },
    { path: '/admin/manager', icon: Settings, label: 'Yönetici' },
  ];

  const garsonMenu = [
    { path: '/garson', icon: Home, label: 'Masalar' },
    { path: '/garson/orders', icon: Receipt, label: 'Siparişler' },
    { path: '/garson/menu', icon: BookOpen, label: 'Menü' },
  ];

  const menuItems = user?.role === 'admin' ? adminMenu : garsonMenu;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition min-w-0 flex-1 ${
                  isActive
                    ? 'text-primary'
                    : 'text-gray-500 dark:text-gray-400'
                }`
              }
            >
              <Icon size={20} strokeWidth={2.5} />
              <span className="text-[10px] font-medium truncate w-full text-center">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
