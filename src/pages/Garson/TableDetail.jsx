import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Plus, Minus, ShoppingCart, Trash2, Clock, Gift, Move } from 'lucide-react';
import OrderConfirmationModal from '../../components/orders/OrderConfirmationModal';
import ComplimentaryModal from '../../components/payment/ComplimentaryModal';
import TableTransferModal from '../../components/tables/TableTransferModal';
import TableSessionTimer from '../../components/tables/TableSessionTimer';

const TableDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tables, menu, addOrder, closeTable, getStock, transferTable } = useApp();
  const [cart, setCart] = useState([]);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showComplimentaryModal, setShowComplimentaryModal] = useState(false);
  const [selectedComplimentaryItem, setSelectedComplimentaryItem] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const handleComplimentary = (item) => {
    setSelectedComplimentaryItem(item);
    setShowComplimentaryModal(true);
  };

  const confirmComplimentary = (reason) => {
    // İkra edilen ürünü sepete ekle (0 fiyat ile)
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

  const handleTransferTable = (targetTableId) => {
    transferTable(table.id, targetTableId);
    setShowTransferModal(false);
    navigate('/garson');
  };

  const table = tables.find(t => t.id === parseInt(id));

  if (!table) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl text-gray-600 dark:text-gray-400">Masa bulunamadi</h2>
        <button
          onClick={() => navigate('/garson')}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
        >
          Geri Don
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

  const submitOrder = () => {
    if (cart.length === 0) return;
    setShowConfirmModal(true);
  };

  const confirmOrder = () => {
    try {
      addOrder(table.id, cart);
      setCart([]);
      setShowConfirmModal(false);
      setOrderSuccess(true);
      setTimeout(() => setOrderSuccess(false), 2000);
    } catch (error) {
      console.error('Siparis hatasi:', error);
    }
  };

  // Oturum süresi hesaplama
  const getSessionDuration = (table) => {
    if (!table.occupiedAt) return null;
    const occupied = new Date(table.occupiedAt);
    const now = new Date();
    const diff = Math.floor((now - occupied) / 1000 / 60); // dakika
    if (diff < 60) return `${diff} dk`;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return mins > 0 ? `${hours}sa ${mins}dk` : `${hours}sa`;
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{table.name}</h2>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                table.status === 'empty' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                table.status === 'occupied' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
              }`}>
                {table.status === 'empty' ? 'Bos' : table.status === 'occupied' ? 'Dolu' : 'Odendi'}
              </span>
              {table.totalAmount > 0 && (
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  Mevcut Tutar: ₺{table.totalAmount.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          {table.status === 'occupied' && (
            <button
              onClick={() => setShowTransferModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition flex items-center gap-2"
            >
              <Move size={18} />
              Masayı Taşı
            </button>
          )}
        </div>
        {table.status === 'occupied' && (
          <div className="mt-3">
            <TableSessionTimer occupiedAt={table.occupiedAt} lastOrderTime={table.lastOrderTime} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4 max-h-[70vh] overflow-y-auto pb-20">
          {Object.entries(groupedMenu).map(([category, items]) => (
            <div key={category} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{category}</h3>
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
                        className={`w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-left transition transform active:scale-95 ${
                          stock <= 0
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer'
                        }`}
                      >
                        <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                        <div className="text-primary font-bold mt-1">₺{item.price.toFixed(2)}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Stok: {stock}</div>
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
                        <Gift size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 lg:sticky lg:top-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Siparis</h3>

            {cart.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Sepet bos</p>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</p>
                        <p className="text-primary text-sm font-bold">₺{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/30 transition"
                          title="Azalt"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-medium text-gray-900 dark:text-white w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="p-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/30 transition"
                          title="Ekle"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id, true)}
                          className="p-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/30 transition ml-1"
                          title="Tamamen Sil"
                        >
                          <Trash2 size={16} />
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
                  className={`w-full py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                    orderSuccess
                      ? 'bg-green-500 text-white'
                      : 'bg-primary text-white hover:bg-blue-600'
                  }`}
                  disabled={orderSuccess}
                >
                  <ShoppingCart size={20} />
                  {orderSuccess ? '✓ Siparis Verildi' : `Siparis Ver (${cartItemCount})`}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sipariş Onay Modal */}
      <OrderConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmOrder}
        cart={cart}
        tableName={table.name}
        totalAmount={totalAmount}
      />

      {/* İkram Modal */}
      <ComplimentaryModal
        isOpen={showComplimentaryModal}
        onClose={() => {
          setShowComplimentaryModal(false);
          setSelectedComplimentaryItem(null);
        }}
        onConfirm={confirmComplimentary}
        item={selectedComplimentaryItem}
        tableName={table.name}
      />

      {/* Masa Transfer Modal */}
      <TableTransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onConfirm={handleTransferTable}
        tables={tables}
        currentTable={table}
        mode="table"
      />
    </div>
  );
};

export default TableDetail;
