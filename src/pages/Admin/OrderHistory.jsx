import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Search, Calendar, Filter, Eye } from 'lucide-react';

const OrderHistory = () => {
  const navigate = useNavigate();
  const { orders, tables, menu } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Tüm siparişleri tarih ile sırala
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders]);

  // Filtreleme
  const filteredOrders = useMemo(() => {
    return sortedOrders.filter(order => {
      // Status filtresi
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;

      // Tarih filtresi
      if (dateFilter !== 'all') {
        const orderDate = new Date(order.createdAt).toDateString();
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const weekAgo = new Date(Date.now() - 604800000).toDateString();

        if (dateFilter === 'today' && orderDate !== today) return false;
        if (dateFilter === 'yesterday' && orderDate !== yesterday) return false;
        if (dateFilter === 'week' && new Date(orderDate) < new Date(weekAgo)) return false;
      }

      // Arama
      if (searchTerm) {
        const table = tables.find(t => t.id === order.tableId);
        const searchLower = searchTerm.toLowerCase();
        const tableMatch = table?.name.toLowerCase().includes(searchLower);
        const itemMatch = order.items.some(item =>
          item.name.toLowerCase().includes(searchLower)
        );
        if (!tableMatch && !itemMatch) return false;
      }

      return true;
    });
  }, [sortedOrders, statusFilter, dateFilter, searchTerm, tables]);

  const getTable = (tableId) => tables.find(t => t.id === tableId);
  const getOrderTotal = (order) => {
    return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'preparing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'delivered': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'preparing': return 'Hazırlanıyor';
      case 'delivered': return 'Teslim Edildi';
      case 'paid': return 'Ödendi';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sipariş Geçmişi</h2>
        <button
          onClick={() => navigate('/admin')}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          ← Geri
        </button>
      </div>

      {/* Filtreler */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Arama */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Masa veya ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Durum Filtresi */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="pending">Bekliyor</option>
              <option value="preparing">Hazırlanıyor</option>
              <option value="delivered">Teslim Edildi</option>
              <option value="paid">Ödendi</option>
            </select>
          </div>

          {/* Tarih Filtresi */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
            >
              <option value="all">Tüm Zamanlar</option>
              <option value="today">Bugün</option>
              <option value="yesterday">Dün</option>
              <option value="week">Son 7 Gün</option>
            </select>
          </div>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Toplam Sipariş</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredOrders.length}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bekleyen</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {filteredOrders.filter(o => o.status === 'pending').length}
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Hazırlanan</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {filteredOrders.filter(o => o.status === 'preparing').length}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tamamlanan</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {filteredOrders.filter(o => o.status === 'paid').length}
          </p>
        </div>
      </div>

      {/* Sipariş Listesi */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Sipariş bulunamadı</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredOrders.map(order => {
              const table = getTable(order.tableId);
              const total = getOrderTotal(order);

              return (
                <div
                  key={order.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {table?.name || 'Bilinmeyen Masa'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {order.items.map((item, idx) => (
                          <span
                            key={idx}
                            className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                          >
                            {item.quantity}x {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">₺{total.toFixed(2)}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1"
                      >
                        <Eye size={14} />
                        Detay
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sipariş Detay Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-primary text-white p-6 rounded-t-2xl">
              <h2 className="text-xl font-bold">Sipariş Detayı</h2>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Masa</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {getTable(selectedOrder.tableId)?.name}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Tarih</p>
                <p className="text-gray-900 dark:text-white">
                  {formatDate(selectedOrder.createdAt)}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Ürünler</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.quantity}x {item.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ₺{item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-primary">
                        ₺{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.paymentMethod && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ödeme Yöntemi</p>
                  <p className="text-gray-900 dark:text-white">
                    {selectedOrder.paymentMethod === 'cash' ? 'Nakit' :
                     selectedOrder.paymentMethod === 'card' ? 'Kart' :
                     selectedOrder.paymentMethod === 'split' ? 'Bölünmüş' : 'Diğer'}
                  </p>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Toplam</span>
                  <span className="text-2xl font-bold text-primary">
                    ₺{getOrderTotal(selectedOrder).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-b-2xl">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
