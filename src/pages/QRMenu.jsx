import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';

const QRMenu = () => {
  const { menu, getStock } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('Tümü');

  // Group menu by category
  const groupedMenu = menu
    .filter(item => item.active)
    .reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

  const categories = ['Tümü', ...Object.keys(groupedMenu)];

  const filteredItems = selectedCategory === 'Tümü'
    ? menu.filter(item => item.active)
    : groupedMenu[selectedCategory] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-600 dark:to-amber-600 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Menü</h1>
              <p className="text-orange-100 text-sm mt-1">QR ile sipariş verin</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 12a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM11 4a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V4zM11 12a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z" />
              </svg>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  selectedCategory === category
                    ? 'bg-white text-orange-600 shadow-md'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {selectedCategory !== 'Tümü' && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{selectedCategory}</h2>
          </div>
        )}

        {selectedCategory === 'Tümü' ? (
          <div className="space-y-8">
            {Object.entries(groupedMenu).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 sticky top-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-2 z-10">
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item) => {
                    const stock = getStock(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden transition hover:shadow-lg ${
                          stock <= 0 ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.name}</h3>
                            {stock <= 0 ? (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full dark:bg-red-900/20 dark:text-red-400">
                                Tükendi
                              </span>
                            ) : stock <= 5 ? (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full dark:bg-yellow-900/20 dark:text-yellow-400">
                                Son {stock}
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full dark:bg-green-900/20 dark:text-green-400">
                                Stok: {stock}
                              </span>
                            )}
                          </div>
                          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                            ₺{item.price.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.category}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const stock = getStock(item.id);
              return (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden transition hover:shadow-lg ${
                    stock <= 0 ? 'opacity-50' : ''
                  }`}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.name}</h3>
                      {stock <= 0 ? (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full dark:bg-red-900/20 dark:text-red-400">
                          Tükendi
                        </span>
                      ) : stock <= 5 ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full dark:bg-yellow-900/20 dark:text-yellow-400">
                          Son {stock}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full dark:bg-green-900/20 dark:text-green-400">
                          Stok: {stock}
                        </span>
                      )}
                    </div>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      ₺{item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-600 dark:to-amber-600 mt-8">
        <div className="max-w-4xl mx-auto px-4 py-4 text-center text-white">
          <p className="text-sm opacity-90">🍽️ Afiyet olsun!</p>
        </div>
      </div>
    </div>
  );
};

export default QRMenu;
