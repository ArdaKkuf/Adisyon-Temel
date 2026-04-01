import React, { useState } from 'react';
import { Gift, X } from 'lucide-react';

const ComplimentaryModal = ({ isOpen, onClose, onConfirm, item, tableName }) => {
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    await onConfirm(reason);
    setIsProcessing(false);
    setReason('');
  };

  const commonReasons = [
    'Müşteri memnuniyeti',
    'Doğum günü',
    'İlk defa',
    'Düzenli müşteri',
    'Hata telafisi',
    'Promosyon',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Gift size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">İkram (Complimentary)</h2>
              <p className="text-white/80 text-sm">{tableName}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Item Info */}
          <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">İkram Edilecek Ürün</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{item?.name}</p>
            <p className="text-pink-600 dark:text-pink-400 font-semibold">
              Ücretsiz - ₺{item?.price?.toFixed(2)} değerinde
            </p>
          </div>

          {/* Reason Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              İkram Sebebi (zorunlu)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="İkram sebebini girin..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              rows={3}
            />
          </div>

          {/* Quick Select Reasons */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Hızlı Seçim:</p>
            <div className="flex flex-wrap gap-2">
              {commonReasons.map(r => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    reason === r
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ Bu ürün ücretsiz olarak verilecektir. Raporlarda "İkram" olarak gösterilecektir.
            </p>
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
            disabled={!reason.trim() || isProcessing}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Gift size={20} />
            {isProcessing ? 'İşleniyor...' : 'İkram Et'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplimentaryModal;
