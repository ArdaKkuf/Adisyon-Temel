import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import TableSessionTimer from '../../components/tables/TableSessionTimer';

const Cashier = () => {
  const navigate = useNavigate();
  const { tables } = useApp();

  const getStatusColor = (status) => {
    switch (status) {
      case 'empty': return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'occupied': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'paid': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-700';
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
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Kasa - Masalar</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => navigate(`/garson/table/${table.id}`)}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-4 transition transform hover:scale-105 ${getStatusColor(table.status)}`}
          >
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{table.name}</h3>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2 ${
                table.status === 'empty' ? 'bg-green-500 text-white' :
                table.status === 'occupied' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'
              }`}>
                {getStatusText(table.status)}
              </div>
              {table.totalAmount > 0 && (
                <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">
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
    </div>
  );
};

export default Cashier;
