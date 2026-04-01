import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Minus, Trash2, Gift, X, ShoppingCart, Wallet, CreditCard, Divide, Move } from 'lucide-react';
import TableSessionTimer from '../../components/tables/TableSessionTimer';

const TableList = () => {
  const { tables, menu, addOrder, closeTable, getStock, transferTable, processPayment, orders } = useApp();
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'empty': return 'border-green-500';
      case 'occupied': return 'border-red-500';
      case 'paid': return 'border-yellow-500';
      default: return 'border-gray-500';
    }
  };

  // Masa popup aç
  const openTable = (table) => {
    setSelectedTable(table);
    setCart([]);
  };

  // Sepete ekle
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  // Sepetten çıkar
  const removeFromCart = (itemId) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(c => c.id === itemId ? { ...c, quantity: c.quantity - 1 } : c);
      }
      return prev.filter(c => c.id !== itemId);
    });
  };

  // Sipariş ver
  const submitOrder = () => {
    if (cart.length === 0) return;
    if (!confirm('Siparişi onaylıyor musunuz?')) return;
    addOrder(selectedTable.id, cart);
    setCart([]);
    alert('Sipariş verildi!');
  };

  // Siparişi sil
  const deleteOrder = (orderId) => {
    if (!confirm('Bu siparişi silmek istiyor musun?')) return;
    const updated = orders.filter(o => o.id !== orderId);
    localStorage.setItem('orders', JSON.stringify(updated));
    window.location.reload();
  };

  // Nakit ödeme
  const payCash = () => {
    if (!confirm('Nakit ödeme alınıyor. Onaylıyor musun?')) return;
    processPayment(selectedTable.id, { method: 'cash' });
    setSelectedTable(null);
  };

  // Kart ödeme
  const payCard = () => {
    if (!confirm('Kart ödeme alınıyor. Onaylıyor musun?')) return;
    processPayment(selectedTable.id, { method: 'card' });
    setSelectedTable(null);
  };

  // Masa taşı
  const moveTable = () => {
    const targetId = prompt('Taşınacak masa numarasını girin:');
    if (targetId) {
      transferTable(selectedTable.id, parseInt(targetId));
      setSelectedTable(null);
    }
  };

  const getTableOrders = (tableId) => {
    return orders.filter(o => o.tableId === tableId && o.status !== 'paid');
  };

  const groupedMenu = menu.filter(item => item.active).reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Masalar</h1>

      {/* Masa Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => openTable(table)}
            className={`bg-white dark:bg-gray-800 rounded-xl p-6 border-4 shadow-sm hover:shadow-lg transition transform hover:scale-105 ${getStatusColor(table.status)}`}
          >
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{table.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {table.status === 'empty' ? 'Bos' : table.status === 'occupied' ? 'Dolu' : 'Odendi'}
              </p>
              {table.totalAmount > 0 && (
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  ₺{table.totalAmount.toFixed(2)}
                </p>
              )}
              {table.status === 'occupied' && (
                <div className="mt-2">
                  <TableSessionTimer occupiedAt={table.occupiedAt} lastOrderTime={table.lastOrderTime} />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* MASA POPUP */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="bg-primary text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">{selectedTable.name}</h2>
                <p className="text-white/80 mt-1">
                  Mevcut Tutar: <span className="font-bold">₺{selectedTable.totalAmount.toFixed(2)}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedTable(null)}
                className="p-2 hover:bg-white/20 rounded-lg"
              >
                <X size={32} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-150px)]">
              {/* Mevcut Siparişler */}
              {getTableOrders(selectedTable.id).length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Mevcut Siparişler</h3>
                  {getTableOrders(selectedTable.id).map(order => (
                    <div key={order.id} className="bg-white dark:bg-gray-700 rounded-lg p-3 mb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(order.createdAt).toLocaleTimeString('tr-TR')}
                          </p>
                          <div className="flex gap-2 mt-1">
                            {order.items.map((item, idx) => (
                              <span key={idx} className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded text-sm">
                                {item.quantity}x {item.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* MENÜ */}
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Menü</h3>
                  {Object.entries(groupedMenu).map(([category, items]) => (
                    <div key={category} className="mb-4">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{category}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {items.map(item => {
                          const cartItem = cart.find(c => c.id === item.id);
                          return (
                            <button
                              key={item.id}
                              onClick={() => addToCart(item)}
                              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-left hover:bg-blue-50 dark:hover:bg-gray-600 transition"
                            >
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-primary font-bold text-sm">₺{item.price.toFixed(2)}</p>
                              {cartItem && (
                                <span className="mt-1 bg-primary text-white text-xs px-2 py-1 rounded-full">
                                  {cartItem.quantity}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* SEPET + ÖDEME */}
                <div>
                  {/* Sepet */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Sepet</h3>
                    {cart.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Sepet bos</p>
                    ) : (
                      <>
                        {cart.map(item => (
                          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg p-2 mb-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{item.name}</span>
                              <div className="flex items-center gap-1">
                                <button onClick={() => removeFromCart(item.id)} className="p-1 bg-red-100 rounded">
                                  <Minus size={14} />
                                </button>
                                <span className="w-8 text-center text-sm">{item.quantity}</span>
                                <button onClick={() => addToCart(item)} className="p-1 bg-green-100 rounded">
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="border-t pt-2 mt-2">
                          <p className="font-bold text-gray-900 dark:text-white">
                            Toplam: ₺{cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={submitOrder}
                          className="w-full mt-3 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 flex items-center justify-center gap-2"
                        >
                          <ShoppingCart size={18} />
                          Sipariş Ver
                        </button>
                      </>
                    )}
                  </div>

                  {/* Hesap İşlemleri */}
                  {selectedTable.totalAmount > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Hesap</h3>
                      <div className="space-y-2">
                        <button
                          onClick={payCash}
                          className="w-full py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 flex items-center justify-center gap-2"
                        >
                          <Wallet size={20} />
                          Nakit
                        </button>
                        <button
                          onClick={payCard}
                          className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 flex items-center justify-center gap-2"
                        >
                          <CreditCard size={20} />
                          Kart
                        </button>
                        <button
                          onClick={() => alert('Hesap bölme yakında eklenecek')}
                          className="w-full py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 flex items-center justify-center gap-2"
                        >
                          <Divide size={18} />
                          Böl
                        </button>
                        <button
                          onClick={moveTable}
                          className="w-full py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 flex items-center justify-center gap-2"
                        >
                          <Move size={18} />
                          Taşı
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableList;
