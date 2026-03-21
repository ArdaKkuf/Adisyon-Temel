import React, { useEffect } from 'react';
import { LogOut, User, Moon, Sun } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Header = () => {
  const { user, logout } = useApp();
  const [isDark, setIsDark] = React.useState(false);

  useEffect(() => {
    // Check local storage or system preference
    const saved = localStorage.getItem('theme');
    if (saved) {
      setIsDark(saved === 'dark');
      document.documentElement.classList.toggle('dark', saved === 'dark');
    } else {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(systemDark);
      document.documentElement.classList.toggle('dark', systemDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  if (!user) return null;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Adisyon Sistemi</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.role === 'admin' ? 'Admin Paneli' : 'Garson Paneli'}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            title={isDark ? 'Aydınlık Tema' : 'Koyu Tema'}
          >
            {isDark ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-gray-600" />}
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <User size={18} />
            <span>{user.name}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition"
          >
            <LogOut size={18} />
            Çıkış
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
