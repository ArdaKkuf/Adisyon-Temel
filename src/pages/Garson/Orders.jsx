import React from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, Check, ChefHat } from 'lucide-react';

const Orders = () => {
  const { orders, tables, updateOrderStatus } = useApp();

  // Aktif siparişler (henüz ödenmemiş)
  const activeOrders = orders.filter(o => o.status !== 'paid');

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'preparing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'preparing': return 'Hazırlanıyor';
      case 'delivered': return 'Teslim Edildi';
      default: return status;
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  // Siparişleri masaya göre grupla
  const ordersByTable = activeOrders.reduce((acc, order) => {
    if (!acc[order.tableId]) {
      acc[order.tableId] = [];
    }
    acc[order.tableId].push(order);
    return acc;
  }, {});

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sipariş Takibi</h2>

      {activeOrders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
          <Clock size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Aktif sipariş yok</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(ordersByTable).map(([tableId, tableOrders]) => {
            const table = tables.find(t => t.id === parseInt(tableId));
            return (
              <div key={tableId} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-primary text-white px-6 py-4">
                  <h3 className="text-lg font-semibold">{table?.name || `Masa ${tableId}`}</h3>
                </div>
                <div className="p-6 space-y-4">
                  {tableOrders.map((order) => (
                    <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              ₺{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'preparing')}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition text-sm font-medium"
                          >
                            <ChefHat size={16} />
                            Hazırla
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'delivered')}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition text-sm font-medium"
                          >
                            <Check size={16} />
                            Teslim Et
                          </button>
                        )}
                        {order.status === 'delivered' && (
                          <div className="flex-1 text-center text-sm text-green-600 dark:text-green-400 font-medium">
                            ✓ Teslim Edildi
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
