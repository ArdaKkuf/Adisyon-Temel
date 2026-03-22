import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const TableList = () => {
  const navigate = useNavigate();
  const { tables } = useApp();

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

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Masalar</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => navigate(`/garson/table/${table.id}`)}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-2 transition hover:shadow-md hover:scale-105 ${getStatusColor(table.status)}`}
          >
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{table.name}</h3>
              <div className="text-sm font-medium mb-2">{getStatusText(table.status)}</div>
              {table.totalAmount > 0 && (
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ₺{table.totalAmount.toFixed(2)}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TableList;
