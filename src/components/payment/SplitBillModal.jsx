import React, { useState } from 'react';
import { Users, Divide, Plus, Minus, Trash2, Wallet, CreditCard } from 'lucide-react';

const SplitBillModal = ({ isOpen, onClose, onConfirm, tableOrders, tableName }) => {
  const [splits, setSplits] = useState([{ id: 1, name: 'Kişi 1', items: [], method: 'cash' }]);
  const [totalSplits, setTotalSplits] = useState(1);

  if (!isOpen) return null;

  // Tüm ürünleri bir listeye topla
  const allItems = tableOrders.flatMap(order =>
    order.items.map(item => ({
      ...item,
      orderId: order.id,
      uniqueId: `${order.id}-${item.id}`
    }))
  );

  const addSplit = () => {
    setSplits([...splits, {
      id: Date.now(),
      name: `Kişi ${splits.length + 1}`,
      items: [],
      method: 'cash'
    }]);
    setTotalSplits(totalSplits + 1);
  };

  const removeSplit = (splitId) => {
    const splitToRemove = splits.find(s => s.id === splitId);
    // İtemsleri geri pool'a döndürmek gerekirse
    setSplits(splits.filter(s => s.id !== splitId));
    setTotalSplits(totalSplits - 1);
  };

  const assignItemToSplit = (itemId, splitId) => {
    setSplits(splits.map(split => {
      if (split.id === splitId) {
        const item = allItems.find(i => i.uniqueId === itemId);
        if (item && !split.items.find(i => i.uniqueId === itemId)) {
          return { ...split, items: [...split.items, item] };
        }
      }
      return split;
    }));
  };

  const removeItemFromSplit = (splitId, uniqueId) => {
    setSplits(splits.map(split =>
      split.id === splitId
        ? { ...split, items: split.items.filter(i => i.uniqueId !== uniqueId) }
        : split
    ));
  };

  const getSplitTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const assignedItems = splits.flatMap(s => s.items);
  const unassignedItems = allItems.filter(item => !assignedItems.find(a => a.uniqueId === item.uniqueId));

  const handleConfirm = () => {
    const splitData = splits.map(split => ({
      ...split,
      total: getSplitTotal(split.items)
    }));
    onConfirm(splitData);
  };

  const allAssigned = unassignedItems.length === 0 && splits.every(s => s.items.length > 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-primary text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Divide size={24} />
                Hesap Bölme
              </h2>
              <p className="text-white/80 text-sm">{tableName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Unassigned Items */}
          {unassignedItems.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Dağıtılacak Ürünler
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {unassignedItems.map(item => (
                  <button
                    key={item.uniqueId}
                    onClick={() => {
                      // İlk boş splite ata veya yeni split oluştur
                      const emptySplit = splits.find(s => s.items.length === 0);
                      if (emptySplit) {
                        assignItemToSplit(item.uniqueId, emptySplit.id);
                      } else {
                        addSplit();
                        setTimeout(() => {
                          const newSplits = [...splits, { id: Date.now(), name: `Kişi ${splits.length + 1}`, items: [item], method: 'cash' }];
                          setSplits(newSplits);
                        }, 0);
                      }
                    }}
                    className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-left hover:border-yellow-400 dark:hover:border-yellow-600 transition"
                  >
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-sm font-bold text-yellow-700 dark:text-yellow-300">₺{item.price.toFixed(2)}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Splits */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ödeyen Kişiler</h3>
              <button
                onClick={addSplit}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition flex items-center gap-2"
              >
                <Plus size={16} />
                Kişi Ekle
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {splits.map(split => (
                <div key={split.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <input
                      type="text"
                      value={split.name}
                      onChange={(e) => setSplits(splits.map(s => s.id === split.id ? { ...s, name: e.target.value } : s))}
                      className="font-semibold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary"
                    />
                    {splits.length > 1 && (
                      <button
                        onClick={() => removeSplit(split.id)}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                    {split.items.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">Ürün ekleyin</p>
                    ) : (
                      split.items.map(item => (
                        <div key={item.uniqueId} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-2">
                          <span className="text-sm text-gray-900 dark:text-white">{item.quantity}x {item.name}</span>
                          <button
                            onClick={() => removeItemFromSplit(split.id, item.uniqueId)}
                            className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                          >
                            <Minus size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Payment Method */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setSplits(splits.map(s => s.id === split.id ? { ...s, method: 'cash' } : s))}
                      className={`flex-1 p-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1 ${
                        split.method === 'cash'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <Wallet size={14} />
                      Nakit
                    </button>
                    <button
                      onClick={() => setSplits(splits.map(s => s.id === split.id ? { ...s, method: 'card' } : s))}
                      className={`flex-1 p-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1 ${
                        split.method === 'card'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <CreditCard size={14} />
                      Kart
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Toplam</p>
                    <p className="text-xl font-bold text-primary">₺{getSplitTotal(split.items).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-bold text-gray-900 dark:text-white">Genel Toplam</span>
            <span className="text-2xl font-bold text-primary">₺{allItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              İptal
            </button>
            <button
              onClick={handleConfirm}
              disabled={!allAssigned}
              className="flex-1 px-6 py-3 bg-success text-white rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check size={20} />
              Onayla ve Öde
            </button>
          </div>
          {!allAssigned && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2 text-center">
              ⚠️ Tüm ürünleri dağıtmanız gerekiyor
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SplitBillModal;
