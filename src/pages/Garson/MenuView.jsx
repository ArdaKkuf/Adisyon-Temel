import React from 'react';
import { useApp } from '../../context/AppContext';
import { UtensilsCrossed } from 'lucide-react';

const MenuView = () => {
  const { menu, getStock } = useApp();

  // Menüyü kategorize et
  const groupedMenu = menu
    .filter(item => item.active)
    .reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Menü</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(groupedMenu).map(([category, items]) => (
          <div key={category} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-primary text-white px-6 py-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <UtensilsCrossed size={20} />
                {category}
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {items.map((item) => {
                  const stock = getStock(item.id);
                  const stockColor = stock > 20 ? 'text-green-600 dark:text-green-400' :
                                   stock > 10 ? 'text-yellow-600 dark:text-yellow-400' :
                                   'text-red-600 dark:text-red-400';

                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-primary font-bold text-sm">₺{item.price.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Stok</p>
                        <p className={`font-bold ${stockColor}`}>{stock}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuView;
