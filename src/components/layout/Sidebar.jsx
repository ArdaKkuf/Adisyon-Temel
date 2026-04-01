import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Users, Settings, Home, Receipt, BookOpen, Tag, History } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Sidebar = () => {
  const { user } = useApp();
  const navigate = useNavigate();

  const adminMenu = [
    { path: '/admin', icon: LayoutDashboard, label: 'Kasa' },
    { path: '/admin/tables', icon: UtensilsCrossed, label: 'Masalar' },
    { path: '/admin/menu', icon: Users, label: 'Menü' },
    { path: '/admin/categories', icon: Tag, label: 'Kategoriler' },
    { path: '/admin/order-history', icon: History, label: 'Sipariş Geçmişi' },
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
    <nav className="bg-white dark:bg-gray-800 w-64 min-h-screen shadow-sm border-r border-gray-200 dark:border-gray-700 p-4">
      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default Sidebar;
