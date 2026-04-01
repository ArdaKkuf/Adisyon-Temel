import React, { useState } from 'react';
import { CreditCard, Wallet, Check } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, onConfirm, totalAmount, tableName }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    await onConfirm(paymentMethod);
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-primary text-white p-6 rounded-t-2xl">
          <h2 className="text-xl font-bold">Ödeme Yöntemi Seçin</h2>
          <p className="text-white/80 text-sm">{tableName}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-1">Ödenecek Tutar</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">
              ₺{totalAmount.toFixed(2)}
            </p>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`w-full p-4 rounded-xl border-2 transition flex items-center gap-4 ${
                paymentMethod === 'cash'
                  ? 'border-primary bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className={`p-3 rounded-lg ${
                paymentMethod === 'cash' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                <Wallet size={24} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900 dark:text-white">Nakit</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Elden ödeme</p>
              </div>
              {paymentMethod === 'cash' && (
                <Check size={24} className="text-primary" />
              )}
            </button>

            <button
              onClick={() => setPaymentMethod('card')}
              className={`w-full p-4 rounded-xl border-2 transition flex items-center gap-4 ${
                paymentMethod === 'card'
                  ? 'border-primary bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className={`p-3 rounded-lg ${
                paymentMethod === 'card' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                <CreditCard size={24} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900 dark:text-white">Kart</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Kredi/Banka kartı</p>
              </div>
              {paymentMethod === 'card' && (
                <Check size={24} className="text-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-b-2xl flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
          >
            İptal
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition disabled:opacity-50"
          >
            {isProcessing ? 'İşleniyor...' : `Ödeme Al (${paymentMethod === 'cash' ? 'Nakit' : 'Kart'})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
