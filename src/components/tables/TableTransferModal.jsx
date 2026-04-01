import React, { useState } from 'react';
import { ArrowRight, Move, Users } from 'lucide-react';

const TableTransferModal = ({ isOpen, onClose, onConfirm, tables, currentTable, mode = 'table' }) => {
  const [selectedTableId, setSelectedTableId] = useState('');

  if (!isOpen) return null;

  const availableTables = tables.filter(t => t.id !== currentTable?.id);

  const handleConfirm = () => {
    if (!selectedTableId) return;
    onConfirm(selectedTableId);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Move size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Masa Taşı</h2>
              <p className="text-white/80 text-sm">
                {mode === 'table' ? 'Hesap beraberinde taşınır' : 'Sipariş taşınır'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Table */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Şu anki masa:</p>
            <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-4">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{currentTable?.name}</p>
              {currentTable?.totalAmount > 0 && (
                <p className="text-orange-600 dark:text-orange-400 font-semibold">
                  Hesap: ₺{currentTable.totalAmount.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center my-4">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
              <ArrowRight size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
          </div>

          {/* Target Tables */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Hedef masa seçin:</p>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {availableTables.map(table => (
                <button
                  key={table.id}
                  onClick={() => setSelectedTableId(table.id)}
                  className={`p-3 rounded-xl border-2 transition ${
                    selectedTableId === table.id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <p className="font-semibold text-gray-900 dark:text-white">{table.name}</p>
                  <div className="flex items-center justify-between text-xs mt-1">
                    {table.status === 'empty' ? (
                      <span className="text-green-600 dark:text-green-400">Boş</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                        <Users size={12} />
                        Dolu
                      </span>
                    )}
                    {table.totalAmount > 0 && (
                      <span className="text-gray-600 dark:text-gray-400">₺{table.totalAmount.toFixed(2)}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Warning */}
          {selectedTableId && availableTables.find(t => t.id === selectedTableId)?.status !== 'empty' && (
            <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Hedef masa dolu! Hesaplar birleştirilecek.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-b-2xl flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            İptal
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedTableId}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Move size={20} />
            Taşı
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableTransferModal;
