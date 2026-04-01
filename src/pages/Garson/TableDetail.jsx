import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Plus, Minus, Trash2, Clock, Gift, Move, Divide,
  CreditCard, Wallet, ArrowLeft, ShoppingCart, X
} from 'lucide-react';
import TableSessionTimer from '../../components/tables/TableSessionTimer';

const TableDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    tables, menu, addOrder, closeTable, getStock,
    transferTable, processPayment, processSplitPayment, orders
  } = useApp();

  const [cart, setCart] = useState([]);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showComplimentary, setShowComplimentary] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const table = tables.find(t => t.id === parseInt(id));

  if (!table) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl text-gray-600 dark:text-gray-400">Masa bulunamadi</h2>
        <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-primary text-white rounded-lg">
          Geri
        </button>
      </div>
    );
  }

  // Sepet işlemleri
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(c => c.id === itemId ? { ...c, quantity: c.quantity - 1 } : c);
      }
      return prev.filter(c => c.id !== itemId);
    });
  };

  const deleteFromCart = (itemId) => {
    setCart(prev => prev.filter(c => c.id !== itemId));
  };

  // Sipariş ver
  const submitOrder = () => {
    if (cart.length === 0) return;
    if (!window.confirm('Siparişi onaylıyor musunuz?')) return;

    addOrder(table.id, cart);
    setCart([]);
    setOrderSuccess(true);
    setTimeout(() => setOrderSuccess(false), 2000);
  };

  // İkram
  const handleComplimentary = (item) => {
    setSelectedItem(item);
    setShowComplimentary(true);
  };

  const confirmComplimentary = (reason) => {
    const complimentaryItem = { ...item, price: 0, isComplimentary: true, complimentaryReason: reason };
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...complimentaryItem, quantity: c.quantity + 1 } : c);
      return [...prev, { ...complimentaryItem, quantity: 1 }];
    });
    setShowComplimentary(false);
    setSelectedItem(null);
  };

  // Ödeme
  const handlePayment = (method) => {
    if (!window.confirm(`Ödeme alınıyor (${method === 'cash' ? 'Nakit' : 'Kart'}). Onaylıyor musunuz?`)) return;

    processPayment(table.id, { method });
    navigate(-1);
  };

  // Sipariş sil
  const deleteOrder = (orderId) => {
    if (!window.confirm('Bu siparişi silmek istiyor musunuz?')) return;
    const updated = orders.filter(o => o.id !== orderId);
    localStorage.setItem('orders', JSON.stringify(updated));
    window.location.reload();
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const groupedMenu = menu.filter(item => item.active).reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const tableOrders = orders.filter(o => o.tableId === table.id && o.status !== 'paid');

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{table.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                table.status === 'occupied' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {table.status === 'occupied' ? 'Dolu' : 'Bos'}
              </span>
              {table.totalAmount > 0 && (
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  ₺{table.totalAmount.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Oturum süresi */}
      {table.status === 'occupied' && (
        <div className="mb-4">
          <TableSessionTimer occupiedAt={table.occupiedAt} lastOrderTime={table.lastOrderTime} />
        </div>
      )}

      {/* Mevcut Siparişler */}
      {tableOrders.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Mevcut Siparişler</h2>
          <div className="space-y-2">
            {tableOrders.map(order => (
              <div key={order.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleString('tr-TR')}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {order.items.map((item, idx) => (
                        <span key={idx} className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-sm">
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
        </div>
      )}

      {/* Ana İçerik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menü */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Menü</h2>
          <div className="space-y-4">
            {Object.entries(groupedMenu).map(([category, items]) => (
              <div key={category} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{category}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {items.map(item => {
                    const cartItem = cart.find(c => c.id === item.id);
                    return (
                      <div key={item.id} className="relative">
                        <button
                          onClick={() => addToCart(item)}
                          className="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-left hover:bg-blue-50 dark:hover:bg-gray-600 transition"
                        >
                          <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-primary font-bold">₺{item.price.toFixed(2)}</p>
                          {cartItem && (
                            <span className="mt-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                              {cartItem.quantity}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => handleComplimentary(item)}
                          className="absolute top-2 right-2 p-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg"
                          title="İkram Et"
                        >
                          <Gift size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sepet ve İşlemler */}
        <div className="space-y-4">
          {/* Sepet */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Sepet</h2>
            {cart.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">Sepet bos</p>
            ) : (
              <>
                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => removeFromCart(item.id)} className="p-1 bg-red-100 rounded">
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center">{item.quantity}</span>
                          <button onClick={() => addToCart(item)} className="p-1 bg-green-100 rounded">
                            <Plus size={14} />
                          </button>
                          <button onClick={() => deleteFromCart(item.id)} className="p-1 bg-red-100 rounded ml-1">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-primary font-semibold">
                        {item.isComplimentary ? 'İkram' : `₺${(item.price * item.quantity).toFixed(2)}`}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 mb-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">Toplam</span>
                    <span className="font-bold text-primary">₺{total.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={submitOrder}
                  disabled={cart.length === 0}
                  className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  Sipariş Ver
                </button>
              </>
            )}
          </div>

          {/* Hesap İşlemleri */}
          {table.totalAmount > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Hesap</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-gray-900 dark:text-white">Toplam Tutar</span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    ₺{table.totalAmount.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => handlePayment('cash')}
                  className="w-full py-3 bg-success text-white rounded-lg font-medium hover:bg-green-600 flex items-center justify-center gap-2"
                >
                  <Wallet size={20} />
                  Nakit Ödeme Al
                </button>

                <button
                  onClick={() => handlePayment('card')}
                  className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <CreditCard size={20} />
                  Kart Ödeme Al
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Hesabı bölünecek. Onaylıyor musunuz?')) {
                      // Hesap bölme mantığı buraya
                      alert('Hesap bölme özelliği yakında eklenecek');
                    }
                  }}
                  className="w-full py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 flex items-center justify-center gap-2"
                >
                  <Divide size={20} />
                  Hesabı Böl
                </button>

                <button
                  onClick={() => {
                    const targetTableId = prompt('Taşınacak masa ID\'sini girin:');
                    if (targetTableId) {
                      transferTable(table.id, parseInt(targetTableId));
                      navigate(-1);
                    }
                  }}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 flex items-center justify-center gap-2"
                >
                  <Move size={20} />
                  Masayı Taşı
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* İkram Modal */}
      {showComplimentary && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">İkram Et</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">{selectedItem.name}</p>
            <textarea
              placeholder="İkram sebebini girin..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const reason = prompt('İkram sebebini girin:');
                  if (reason) confirmComplimentary(reason);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium"
              >
                İkram Et
              </button>
              <button
                onClick={() => {
                  setShowComplimentary(false);
                  setSelectedItem(null);
                }}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableDetail;
