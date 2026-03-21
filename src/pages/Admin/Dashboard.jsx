import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Check, X, DollarSign, Calendar, Moon } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { tables, menu, addOrder, closeTable, orders, addTransaction } = useApp();
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]);

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
    if (cart.length === 0 || !selectedTable) return;
    addOrder(selectedTable.id, cart);
    setCart([]);
  };

  const handlePayment = (table) => {
    closeTable(table.id);
    // Seçili masayı temizle
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

  // Gün sonu hesaplama
  const getDailySummary = () => {
    const activeOrders = orders.filter(o => o.status !== 'paid');

    // Bugünkü TÜRN siparişleri (aktif + bugün ödenmiş)
    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt).toDateString();
      return orderDate === today && o.status === 'paid';
    });

    // Aktif masalardaki + bugün ödenmiş siparişlerin toplamı
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
      alert('Aktif sipariş veya ciro yok, gün sonunu yapamazsınız.');
      return;
    }

    const message = `GÜN SONU ÖZETİ\n\nAktif Sipariş: ${summary.activeOrders}\nToplam Tutar: ₺${summary.totalRevenue.toFixed(2)}\nDolu Masa: ${summary.activeTables}\n\nTüm aktif siparişler ödenecek, masalar kapatılacak ve ciro yönetici paneline eklenecek.\n\nDevam etmek istiyor musunuz?`;

    if (window.confirm(message)) {
      // Sadece aktif masalardaki ciroyu kaydet (daha önce ödenmişleri tekrar ekleme)
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

      // Masaları kapat
      tables.filter(t => t.status === 'occupied').forEach(table => {
        closeTable(table.id);
      });

      setSelectedTable(null);
      setCart([]);
      alert('Gün sonu başarıyla tamamlandı! Ciro yönetici paneline eklendi.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kasa</h2>
        <button
          onClick={handleEndOfDay}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition shadow-md"
        >
          <Moon size={20} />
          Gün Sonu
        </button>
      </div>

      {/* Gün Sonu Özeti */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl shadow-sm p-6 mb-6 border border-purple-200 dark:border-purple-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Aktif Sipariş</p>
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
        {/* Masalar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Masalar</h3>
            <div className="space-y-2">
              {tables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={`w-full p-4 rounded-lg text-left transition ${
                    selectedTable?.id === table.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{table.name}</span>
                    {table.totalAmount > 0 && (
                      <span className="font-bold">₺{table.totalAmount.toFixed(2)}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menü ve Sipariş */}
        <div className="lg:col-span-2">
          {selectedTable ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Menü */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Menü - {selectedTable.name}</h3>
                {Object.entries(groupedMenu).map(([category, items]) => (
                  <div key={category} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">{category}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => addToCart(item)}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition text-left"
                        >
                          <div className="font-medium text-sm text-gray-900 dark:text-white">{item.name}</div>
                          <div className="text-primary font-bold text-sm">₺{item.price.toFixed(2)}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sepet ve Ödeme */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sipariş</h3>
                  {cart.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">Sepet boş</p>
                  ) : (
                    <>
                      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                            <span className="text-sm text-gray-900 dark:text-white">{item.quantity}x {item.name}</span>
                            <div className="flex items-center gap-2">
                              <button onClick={() => removeFromCart(item.id)} className="p-1 bg-red-100 dark:bg-red-900/20 rounded">
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={submitOrder}
                        className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition"
                      >
                        Siparişi Onayla
                      </button>
                    </>
                  )}
                </div>

                {/* Hesap Kapatma */}
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
                      Hesabı Al ve Kapat
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">Masa seçin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
