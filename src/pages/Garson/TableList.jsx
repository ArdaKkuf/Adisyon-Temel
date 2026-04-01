import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plus, Minus, Trash2, Clock, Gift, Move, Divide,
  CreditCard, Wallet, X, Check, ShoppingCart, ArrowRight
} from 'lucide-react';
import TableSessionTimer from '../../components/tables/TableSessionTimer';
import OrderConfirmationModal from '../../components/orders/OrderConfirmationModal';
import ComplimentaryModal from '../../components/payment/ComplimentaryModal';
import TableTransferModal from '../../components/tables/TableTransferModal';
import PaymentModal from '../../components/payment/PaymentModal';
import SplitBillModal from '../../components/payment/SplitBillModal';

const TableList = () => {
  const { tables, menu, addOrder, closeTable, getStock, transferTable, processPayment, processSplitPayment, orders } = useApp();
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showComplimentaryModal, setShowComplimentaryModal] = useState(false);
  const [selectedComplimentaryItem, setSelectedComplimentaryItem] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'empty': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'occupied': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'paid': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'empty': return 'Bos';
      case 'occupied': return 'Dolu';
      case 'paid': return 'Odendi';
      default: return status;
    }
  };

  // Masa popup aç
  const openTablePopup = (table) => {
    setSelectedTable(table);
    setCart([]);
    setOrderSuccess(false);
  };

  // Sepete ekle
  const addToCart = (item) => {
    const stock = getStock(item.id);
    setCart(prevCart => {
      const existing = prevCart.find(c => c.id === item.id);
      if (existing) {
        if (existing.quantity >= stock) return prevCart;
        return prevCart.map(c =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  // Sepetten çıkar
  const removeFromCart = (itemId, completely = false) => {
    setCart(prevCart => {
      if (completely) {
        return prevCart.filter(c => c.id !== itemId);
      }
      const existing = prevCart.find(c => c.id === itemId);
      if (existing && existing.quantity > 1) {
        return prevCart.map(c =>
          c.id === itemId ? { ...c, quantity: c.quantity - 1 } : c
        );
      }
      return prevCart.filter(c => c.id !== itemId);
    });
  };

  // Siparişi onayla
  const submitOrder = () => {
    if (cart.length === 0) return;
    setShowConfirmModal(true);
  };

  const confirmOrder = () => {
    try {
      addOrder(selectedTable.id, cart);
      setCart([]);
      setShowConfirmModal(false);
      setOrderSuccess(true);
      setTimeout(() => setOrderSuccess(false), 2000);
    } catch (error) {
      console.error('Siparis hatasi:', error);
    }
  };

  // İkram
  const handleComplimentary = (item) => {
    setSelectedComplimentaryItem(item);
    setShowComplimentaryModal(true);
  };

  const confirmComplimentary = (reason) => {
    const complimentaryItem = {
      ...selectedComplimentaryItem,
      price: 0,
      isComplimentary: true,
      complimentaryReason: reason
    };
    setCart(prevCart => {
      const existing = prevCart.find(c => c.id === complimentaryItem.id);
      if (existing) {
        return prevCart.map(c =>
          c.id === complimentaryItem.id ? { ...c, quantity: c.quantity + 1, price: 0, isComplimentary: true, complimentaryReason: reason } : c
        );
      }
      return [...prevCart, { ...complimentaryItem, quantity: 1 }];
    });
    setShowComplimentaryModal(false);
    setSelectedComplimentaryItem(null);
  };

  // Masa taşıma
  const handleTransferTable = (targetTableId) => {
    transferTable(selectedTable.id, targetTableId);
    setShowTransferModal(false);
    setSelectedTable(null);
  };

  // Ödeme
  const handlePayment = (method) => {
    if (method === 'single') {
      setShowPaymentModal(true);
    } else if (method === 'split') {
      setShowSplitModal(true);
    }
  };

  const confirmPayment = async (paymentMethod) => {
    processPayment(selectedTable.id, { method: paymentMethod });
    setShowPaymentModal(false);
    setSelectedTable(null);
  };

  const confirmSplit = async (splitData) => {
    processSplitPayment(selectedTable.id, splitData);
    setShowSplitModal(false);
    setSelectedTable(null);
  };

  // Mevcut siparişleri sil
  const deleteOrderFromTable = (orderId) => {
    if (window.confirm('Bu siparişi silmek istediğinizden emin misiniz?')) {
      const updatedOrders = orders.filter(o => o.id !== orderId);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      window.location.reload();
    }
  };

  const getTableOrders = (tableId) => {
    return orders.filter(o => o.tableId === tableId && o.status !== 'paid');
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Masalar</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => openTablePopup(table)}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-2 transition hover:shadow-md hover:scale-105 ${getStatusColor(table.status)}`}
          >
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{table.name}</h3>
              <div className="text-sm font-medium mb-2">{getStatusText(table.status)}</div>
              {table.totalAmount > 0 && (
                <div className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  ₺{table.totalAmount.toFixed(2)}
                </div>
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

      {/* MASA DETAY POPUP */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-primary text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedTable.name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedTable.status === 'empty' ? 'bg-green-500' :
                    selectedTable.status === 'occupied' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}>
                    {getStatusText(selectedTable.status)}
                  </span>
                  {selectedTable.totalAmount > 0 && (
                    <span className="text-lg font-bold">₺{selectedTable.totalAmount.toFixed(2)}</span>
                  )}
                </div>
                {selectedTable.status === 'occupied' && (
                  <div className="mt-2">
                    <TableSessionTimer occupiedAt={selectedTable.occupiedAt} lastOrderTime={selectedTable.lastOrderTime} />
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedTable(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* MENÜ */}
                <div className="lg:col-span-2 space-y-4 max-h-[60vh] overflow-y-auto">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Menü</h3>
                  {Object.entries(groupedMenu).map(([category, items]) => (
                    <div key={category} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">{category}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {items.map((item) => {
                          const stock = getStock(item.id);
                          const cartItem = cart.find(c => c.id === item.id);
                          const quantity = cartItem?.quantity || 0;

                          return (
                            <div key={item.id} className="relative">
                              <button
                                onClick={() => addToCart(item)}
                                disabled={stock <= 0}
                                className={`w-full bg-white dark:bg-gray-800 rounded-lg p-3 text-left transition ${
                                  stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer'
                                }`}
                              >
                                <div className="font-medium text-sm text-gray-900 dark:text-white">{item.name}</div>
                                <div className="text-primary font-bold text-sm">₺{item.price.toFixed(2)}</div>
                                {quantity > 0 && (
                                  <div className="mt-1 bg-primary text-white text-xs px-2 py-1 rounded-full inline-block">
                                    {quantity}
                                  </div>
                                )}
                              </button>
                              <button
                                onClick={() => handleComplimentary(item)}
                                className="absolute top-2 right-2 p-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition shadow-lg"
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

                {/* SEPET ve İŞLEMLER */}
                <div className="space-y-4">
                  {/* Sepet */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Sepet</h3>
                    {cart.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">Sepet bos</p>
                    ) : (
                      <>
                        <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                          {cart.map((item) => (
                            <div key={item.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-2">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</p>
                                <p className="text-primary text-sm font-bold">
                                  {item.isComplimentary ? 'İkram' : `₺${(item.price * item.quantity).toFixed(2)}`}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="p-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/30 transition"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="font-medium text-gray-900 dark:text-white w-6 text-center text-sm">{item.quantity}</span>
                                <button
                                  onClick={() => addToCart(item)}
                                  className="p-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/30 transition"
                                >
                                  <Plus size={14} />
                                </button>
                                <button
                                  onClick={() => removeFromCart(item.id, true)}
                                  className="p-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/30 transition"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mb-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Toplam</span>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">₺{totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                        <button
                          onClick={submitOrder}
                          disabled={cart.length === 0 || orderSuccess}
                          className={`w-full py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                            orderSuccess ? 'bg-green-500 text-white' : 'bg-primary text-white hover:bg-blue-600'
                          }`}
                        >
                          <ShoppingCart size={18} />
                          {orderSuccess ? '✓ Siparis Verildi' : 'Siparis Ver'}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Mevcut Siparişler */}
                  {getTableOrders(selectedTable.id).length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Mevcut Siparişler</h3>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {getTableOrders(selectedTable.id).map(order => (
                          <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(order.createdAt).toLocaleTimeString('tr-TR')}
                              </span>
                              <button
                                onClick={() => deleteOrderFromTable(order.id)}
                                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {order.items.map((item, idx) => (
                                <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                                  {item.quantity}x {item.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hesap İşlemleri */}
                  {selectedTable.totalAmount > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Hesap İşlemleri</h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => handlePayment('single')}
                          className="w-full py-3 bg-success text-white rounded-lg font-medium hover:bg-green-600 transition flex items-center justify-center gap-2"
                        >
                          <Wallet size={18} />
                          Hesabı Kapat
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setShowPaymentModal(true)}
                            className="py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center justify-center gap-1 text-sm"
                          >
                            <CreditCard size={16} />
                            Nakit/Kart
                          </button>
                          <button
                            onClick={() => handlePayment('split')}
                            className="py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition flex items-center justify-center gap-1 text-sm"
                          >
                            <Divide size={16} />
                            Böl
                          </button>
                        </div>
                        <button
                          onClick={() => setShowTransferModal(true)}
                          className="w-full py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition flex items-center justify-center gap-2"
                        >
                          <Move size={18} />
                          Masayı Taşı
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer - Kapat */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSelectedTable(null)}
                className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <OrderConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmOrder}
        cart={cart}
        tableName={selectedTable?.name || ''}
        totalAmount={totalAmount}
      />

      <ComplimentaryModal
        isOpen={showComplimentaryModal}
        onClose={() => {
          setShowComplimentaryModal(false);
          setSelectedComplimentaryItem(null);
        }}
        onConfirm={confirmComplimentary}
        item={selectedComplimentaryItem}
        tableName={selectedTable?.name || ''}
      />

      <TableTransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onConfirm={handleTransferTable}
        tables={tables}
        currentTable={selectedTable}
        mode="table"
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={confirmPayment}
        totalAmount={selectedTable?.totalAmount || 0}
        tableName={selectedTable?.name || ''}
      />

      {selectedTable && (
        <SplitBillModal
          isOpen={showSplitModal}
          onClose={() => setShowSplitModal(false)}
          onConfirm={confirmSplit}
          tableOrders={getTableOrders(selectedTable.id)}
          tableName={selectedTable.name}
        />
      )}
    </div>
  );
};

export default TableList;
