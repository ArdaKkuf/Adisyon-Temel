import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Plus, Minus, Check } from 'lucide-react';
import { menuCategories } from '../../data/initialData';

const TableDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tables, menu, addOrder, closeTable } = useApp();
  const [cart, setCart] = useState([]);

  const table = tables.find(t => t.id === parseInt(id));

  if (!table) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl text-gray-600 dark:text-gray-400">Masa bulunamadı</h2>
        <button
          onClick={() => navigate('/garson')}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
        >
          Geri Dön
        </button>
      </div>
    );
  }

  const groupedMenu = menu
    .filter(item => item.active)
    .reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

  const addToCart = (item) => {
    setCart(prevCart => {
      const existing = prevCart.find(c => c.id === item.id);
      if (existing) {
        return prevCart.map(c =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => {
      const existing = prevCart.find(c => c.id === itemId);
      if (existing && existing.quantity > 1) {
        return prevCart.map(c =>
          c.id === itemId ? { ...c, quantity: c.quantity - 1 } : c
        );
      }
      return prevCart.filter(c => c.id !== itemId);
    });
  };

  const submitOrder = () => {
    if (cart.length === 0) return;

    addOrder(table.id, cart);
    setCart([]);
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div>
      <button
        onClick={() => navigate('/garson')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition"
      >
        <ArrowLeft size={20} />
        Geri
      </button>

      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{table.name}</h2>
        <div className="flex items-center gap-4 mt-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            table.status === 'empty' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
            table.status === 'occupied' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
          }`}>
            {table.status === 'empty' ? 'Boş' : table.status === 'occupied' ? 'Dolu' : 'Ödendi'}
          </span>
          {table.totalAmount > 0 && (
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              Mevcut Tutar: ₺{table.totalAmount.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menü */}
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(groupedMenu).map(([category, items]) => (
            <div key={category} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{category}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition text-left"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                    <div className="text-primary font-bold mt-1">₺{item.price.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sepet */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sipariş</h3>

            {cart.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Sepet boş</p>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</p>
                        <p className="text-primary text-sm font-bold">₺{item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/30 transition"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-medium text-gray-900 dark:text-white w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="p-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/30 transition"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Toplam</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">₺{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={submitOrder}
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition flex items-center justify-center gap-2 mb-3"
                >
                  <Check size={20} />
                  Siparişi Onayla
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableDetail;
