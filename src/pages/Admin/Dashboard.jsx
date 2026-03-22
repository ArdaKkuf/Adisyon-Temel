import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DollarSign, Calendar, Moon, ShoppingCart, Plus, Minus } from 'lucide-react';

const Dashboard = () => {
  const { tables, menu, addOrder, closeTable, orders, addTransaction, getStock } = useApp();
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [endOfDaySuccess, setEndOfDaySuccess] = useState(false);

  const addToCart = (item) => {
    const stock = getStock(item.id);

    setCart(prevCart => {
      const existing = prevCart.find(c => c.id === item.id);
      if (existing) {
        if (existing.quantity >= stock) {
          return prevCart;
        }
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
    if (cart.length === 0 || !selectedTable) return;

    try {
      addOrder(selectedTable.id, cart);
      setCart([]);
      setOrderSuccess(true);
      setTimeout(() => setOrderSuccess(false), 2000);
      console.log('Siparis basariyla verildi:', selectedTable.id, cart);
    } catch (error) {
      console.error('Siparis hatasi:', error);
    }
  };

  const handlePayment = (table) => {
    closeTable(table.id);
    setSelectedTable(null);
    setCart([]);
  };

  const groupedMenu = menu
    .filter(item => item.active)
    .reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

  const getDailySummary = () => {
    const activeOrders = orders.filter(o => o.status !== 'paid');
    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt).toDateString();
      return orderDate === today && o.status === 'paid';
    });
    const activeRevenue = tables.reduce((sum, table) => sum + table.totalAmount, 0);
    const todayPaidRevenue = todayOrders.reduce((sum, order) => {
      return sum + order.items.reduce((s, item) => s + (item.price * item.quantity), 0);
    }, 0);

    return {
      activeOrders: activeOrders.length,
      totalRevenue: activeRevenue + todayPaidRevenue,
      activeTables: tables.filter(t => t.status === 'occupied').length,
    };
  };

  const handleEndOfDay = () => {
    const summary = getDailySummary();

    if (summary.activeOrders === 0 && summary.totalRevenue === 0) {
      console.log('Aktif siparis veya ciro yok');
      return;
    }

    const message = `GUN SONU OZETI\n\nAktif Siparis: ${summary.activeOrders}\nToplam Tutar: ₺${summary.totalRevenue.toFixed(2)}\nDolu Masa: ${summary.activeTables}\n\nTüm aktif siparisler ödenecek, masalar kapatilacak ve ciro yönetici paneline eklenecek.\n\nDevam etmek istiyor musunuz?`;

    if (window.confirm(message)) {
      const activeRevenue = tables.reduce((sum, table) => sum + table.totalAmount, 0);
      const today = new Date().toISOString().split('T')[0];

      if (activeRevenue > 0) {
        addTransaction({
          type: 'income',
          description: `Gün sonu kasa - ${today}`,
          amount: activeRevenue,
          date: today,
        });
      }

      tables.filter(t => t.status === 'occupied').forEach(table => {
        closeTable(table.id);
      });

      setSelectedTable(null);
      setCart([]);
      setEndOfDaySuccess(true);
      setTimeout(() => setEndOfDaySuccess(false), 3000);
      console.log('Gün sonu tamamlandi:', { activeRevenue, today });
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kasa</h2>
        <button
          onClick={handleEndOfDay}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition shadow-md ${
            endOfDaySuccess
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
          }`}
          disabled={endOfDaySuccess}
        >
          <Moon size={20} />
          {endOfDaySuccess ? '✓ Gün Sonu Tamamlandi' : 'Gün Sonu'}
        </button>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl shadow-sm p-6 mb-6 border border-purple-200 dark:border-purple-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Aktif Siparis</p>
            <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">{getDailySummary().activeOrders}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Toplam Tutar</p>
            <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">₺{getDailySummary().totalRevenue.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Dolu Masa</p>
            <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">{getDailySummary().activeTables}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Masalar</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map((table) => (
              <button
                key={table.id}
                onClick={() => {
                  if (cart.length > 0) {
                    if (window.confirm('Sepet temizlenecek, emin misiniz?')) {
                      setSelectedTable(table);
                      setCart([]);
                    }
                  } else {
                    setSelectedTable(table);
                  }
                }}
                className={`${
                  selectedTable?.id === table.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                } rounded-lg p-4 text-left transition`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{table.name}</span>
                  {table.totalAmount > 0 && (
                    <span className="font-bold text-sm">₺{table.totalAmount.toFixed(2)}</span>
                  )}
                </div>
                <div className="text-xs">
                  {table.status === 'empty' ? 'Bos' : table.status === 'occupied' ? 'Dolu' : 'Odendi'}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedTable ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Menu - {selectedTable.name}</h3>
                {Object.entries(groupedMenu).map(([category, items]) => (
                  <div key={category} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">{category}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {items.map((item) => {
                        const stock = getStock(item.id);
                        const cartItem = cart.find(c => c.id === item.id);
                        const quantity = cartItem?.quantity || 0;

                        return (
                          <button
                            key={item.id}
                            onClick={() => addToCart(item)}
                            disabled={stock <= 0}
                            className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition text-left ${
                              stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <div className="font-medium text-sm text-gray-900 dark:text-white">{item.name}</div>
                            <div className="text-primary font-bold text-sm">₺{item.price.toFixed(2)}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Stok: {stock}</div>
                            {quantity > 0 && (
                              <div className="mt-1 bg-primary text-white text-xs px-2 py-1 rounded-full inline-block">
                                {quantity}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Siparis</h3>
                  {cart.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">Sepet bos</p>
                  ) : (
                    <>
                      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                            <span className="text-sm text-gray-900 dark:text-white">{item.quantity}x {item.name}</span>
                            <div className="flex items-center gap-2">
                              <button onClick={() => removeFromCart(item.id)} className="p-1 bg-red-100 dark:bg-red-900/20 rounded">
                                <Minus size={14} />
                              </button>
                              <button onClick={() => addToCart(item)} className="p-1 bg-green-100 dark:bg-green-900/20 rounded">
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={submitOrder}
                        className={`w-full py-2 rounded-lg font-medium transition ${
                          orderSuccess
                            ? 'bg-green-500 text-white'
                            : 'bg-primary text-white hover:bg-blue-600'
                        }`}
                        disabled={orderSuccess}
                      >
                        {orderSuccess ? '✓ Siparis Verildi' : 'Siparisi Onayla'}
                      </button>
                    </>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hesap</h3>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">Toplam Tutar:</span>
                      <span className="text-3xl font-bold text-primary">
                        ₺{selectedTable.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {selectedTable.status !== 'empty' && (
                    <button
                      onClick={() => handlePayment(selectedTable)}
                      className="w-full bg-success text-white py-3 rounded-lg font-medium hover:bg-green-600 transition flex items-center justify-center gap-2"
                    >
                      <DollarSign size={20} />
                      Hesabi Al ve Kapat
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">Masa secin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
