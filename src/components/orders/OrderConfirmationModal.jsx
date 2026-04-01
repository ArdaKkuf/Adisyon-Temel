import React from 'react';
import { Check, X, ShoppingCart } from 'lucide-react';

const OrderConfirmationModal = ({ isOpen, onClose, onConfirm, cart, tableName, totalAmount }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-primary text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <ShoppingCart size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Sipariş Onayı</h2>
                <p className="text-white/80 text-sm">{tableName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Sipariş Özeti
            </h3>
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-white text-sm font-bold px-2 py-1 rounded-full">
                      {item.quantity}x
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ₺{item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-primary">
                    ₺{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-gray-900 dark:text-white">Toplam Tutar</span>
              <span className="text-3xl font-bold text-primary">₺{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Warning */}
          <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ Siparişi onayladıktan sonra mutfağa iletilecektir. Lütfen bilgileri kontrol ediniz.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2"
            >
              <X size={20} />
              İptal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center justify-center gap-2"
            >
              <Check size={20} />
              Onayla ve Sipariş Ver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationModal;
