import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Check, X, DollarSign, Wallet, CreditCard, Divide, Gift } from 'lucide-react';
import PaymentModal from '../../components/payment/PaymentModal';
import SplitBillModal from '../../components/payment/SplitBillModal';
import ComplimentaryModal from '../../components/payment/ComplimentaryModal';

const Cashier = () => {
  const navigate = useNavigate();
  const { tables, menu, addOrder, closeTable, orders, processPayment, processSplitPayment } = useApp();
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showComplimentaryModal, setShowComplimentaryModal] = useState(false);
  const [selectedComplimentaryItem, setSelectedComplimentaryItem] = useState(null);

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

  const handlePayment = (table, method = 'single') => {
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

  const handleComplimentary = (item) => {
    setSelectedComplimentaryItem(item);
    setShowComplimentaryModal(true);
  };

  const confirmComplimentary = async (reason) => {
    // İkram işlemini logla
    console.log(`Complimentary: ${selectedComplimentaryItem.name} - ${reason}`);
    setShowComplimentaryModal(false);
    setSelectedComplimentaryItem(null);
  };

  const getTableOrders = (tableId) => {
    return orders.filter(o => o.tableId === tableId && o.status !== 'paid');
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

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Kasa</h2>

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
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 dark:text-gray-400">Toplam:</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₺{selectedTable.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  {selectedTable.status !== 'empty' && (
                    <div className="space-y-2">
                      <button
                        onClick={() => handlePayment(selectedTable, 'single')}
                        className="w-full bg-success text-white py-3 rounded-lg font-medium hover:bg-green-600 transition flex items-center justify-center gap-2"
                      >
                        <DollarSign size={20} />
                        Hesabı Al ve Kapat
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handlePayment(selectedTable, 'split')}
                          className="bg-primary text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition flex items-center justify-center gap-1 text-sm"
                        >
                          <Divide size={16} />
                          Böl
                        </button>
                        <button
                          onClick={() => setShowComplimentaryModal(true)}
                          className="bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition flex items-center justify-center gap-1 text-sm"
                        >
                          <Gift size={16} />
                          İkram
                        </button>
                      </div>
                    </div>
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

      {/* Payment Modals */}
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
    </div>
  );
};

export default Cashier;
