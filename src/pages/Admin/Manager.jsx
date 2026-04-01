import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Unlock, TrendingUp, ArrowDown, DollarSign, Plus, Trash2, BarChart3, Calendar, PieChart } from 'lucide-react';

const Manager = () => {
  const { managerUnlocked, unlockManager, lockManager, transactions, addTransaction, deleteTransaction, getIncomeExpense, tables, orders } = useApp();
  const [password, setPassword] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [dateRange, setDateRange] = useState('all'); // all, today, week, month, custom
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [newTransaction, setNewTransaction] = useState({
    type: 'income',
    category: 'other',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Tarih filtreleme fonksiyonu
  const filterByDate = (items) => {
    if (dateRange === 'all') return items;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return items.filter(item => {
      const itemDate = new Date(item.date || item.createdAt);

      if (dateRange === 'today') {
        return itemDate >= today;
      } else if (dateRange === 'week') {
        return itemDate >= weekAgo;
      } else if (dateRange === 'month') {
        return itemDate >= monthAgo;
      } else if (dateRange === 'custom' && customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59);
        return itemDate >= start && itemDate <= end;
      }
      return true;
    });
  };

  if (!managerUnlocked) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
          <div className="text-center mb-6">
            <Lock size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Yönetici Paneli</h2>
            <p className="text-gray-600 dark:text-gray-400">Bu alan işletme sahibine özeldir</p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (unlockManager(password)) {
              setPassword('');
            } else {
              alert('Hatalı şifre');
            }
          }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none mb-4"
              placeholder="Şifre"
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition flex items-center justify-center gap-2"
            >
              <Unlock size={20} />
              Paneli Aç
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleSubmitTransaction = (e) => {
    e.preventDefault();
    if (newTransaction.description && newTransaction.amount) {
      addTransaction({
        type: newTransaction.type,
        description: newTransaction.description,
        amount: parseFloat(newTransaction.amount),
        date: newTransaction.date,
      });
      setNewTransaction({
        type: 'income',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
      });
      setShowAddForm(false);
    }
  };

  // güvenli hesaplama
  const safeOrders = orders || [];
  const safeTransactions = transactions || [];
  const safeTables = tables || [];

  // Filtrelenmiş veriler
  const filteredOrders = useMemo(() => filterByDate(safeOrders), [safeOrders, dateRange, customStartDate, customEndDate]);
  const filteredTransactions = useMemo(() => filterByDate(safeTransactions), [safeTransactions, dateRange, customStartDate, customEndDate]);

  // Bakiye hesapla - gelir - gider (gün sonu kasası dahil)
  const income = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const expense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const balance = income - expense;

  // Ciro hesaplama (siparişlerden)
  const totalRevenue = filteredOrders
    .filter(o => o.status === 'paid')
    .reduce((sum, order) => {
      return sum + (order.items?.reduce((s, item) => {
        const price = item.isComplimentary ? 0 : item.price;
        return s + (price * item.quantity);
      }, 0) || 0);
    }, 0);

  // İkram toplamı
  const complimentaryTotal = filteredOrders
    .reduce((sum, order) => {
      return sum + (order.items?.reduce((s, item) => {
        if (item.isComplimentary) {
          return s + (item.price * item.quantity);
        }
        return s;
      }, 0) || 0);
    }, 0);

  // Ödeme yöntemine göre breakdown
  const paymentMethodBreakdown = useMemo(() => {
    const cashTotal = filteredTransactions
      .filter(t => t.type === 'income' && t.paymentMethod === 'cash')
      .reduce((sum, t) => sum + t.amount, 0);

    const cardTotal = filteredTransactions
      .filter(t => t.type === 'income' && t.paymentMethod === 'card')
      .reduce((sum, t) => sum + t.amount, 0);

    const otherTotal = filteredTransactions
      .filter(t => t.type === 'income' && (!t.paymentMethod || t.paymentMethod === 'split'))
      .reduce((sum, t) => sum + t.amount, 0);

    return { cash: cashTotal, card: cardTotal, other: otherTotal };
  }, [filteredTransactions]);

  // Kategori bazlı giderler
  const expensesByCategory = useMemo(() => {
    const categories = {};
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = t.category || 'other';
        categories[cat] = (categories[cat] || 0) + t.amount;
      });
    return categories;
  }, [filteredTransactions]);

  // Bugünkü siparişler
  const todayOrders = safeOrders.filter(o => {
    const orderDate = new Date(o.createdAt).toDateString();
    const today = new Date().toDateString();
    return orderDate === today;
  });

  const todayRevenue = todayOrders.reduce((sum, order) => {
    return sum + (order.items?.reduce((s, item) => s + (item.price * item.quantity), 0) || 0);
  }, 0);

  // Masa bazlı gelirler
  const tableStats = safeTables.map(table => {
    const tableOrders = safeOrders.filter(o => o.tableId === table.id && o.status === 'paid');
    const revenue = tableOrders.reduce((sum, order) => {
      return sum + (order.items?.reduce((s, item) => s + (item.price * item.quantity), 0) || 0);
    }, 0);
    return {
      ...table,
      totalOrders: tableOrders.length,
      revenue,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const sortedTransactions = [...filteredTransactions].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Yönetici Paneli</h2>
        <div className="flex items-center gap-3">
          {/* Tarih Filtresi */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg appearance-none"
            >
              <option value="all">Tüm Zamanlar</option>
              <option value="today">Bugün</option>
              <option value="week">Son 7 Gün</option>
              <option value="month">Son 30 Gün</option>
              <option value="custom">Özel Tarih</option>
            </select>
          </div>

          {dateRange === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg"
              />
              <span className="text-gray-500">-</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg"
              />
            </div>
          )}

          <button
            onClick={lockManager}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            <Lock size={18} />
            Kilitle
          </button>
        </div>
      </div>

      {/* Gelir/Gider Özeti */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Toplam Gelir</h3>
            <TrendingUp size={20} />
          </div>
          <p className="text-3xl font-bold">₺{income.toFixed(2)}</p>
          <p className="text-sm opacity-90 mt-2">{filteredTransactions.filter(t => t.type === 'income').length} işlem</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Toplam Gider</h3>
            <ArrowDown size={20} />
          </div>
          <p className="text-3xl font-bold">₺{expense.toFixed(2)}</p>
          <p className="text-sm opacity-90 mt-2">{filteredTransactions.filter(t => t.type === 'expense').length} işlem</p>
        </div>

        <div className={`bg-gradient-to-br rounded-xl shadow-sm p-6 text-white ${balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-gray-600 to-gray-700'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Net Bakiye</h3>
            <DollarSign size={20} />
          </div>
          <p className="text-3xl font-bold">₺{balance.toFixed(2)}</p>
          <p className="text-sm opacity-90 mt-2">{balance >= 0 ? 'Kâr' : 'Zarar'}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Ciro (Sipariş)</h3>
            <BarChart3 size={20} />
          </div>
          <p className="text-3xl font-bold">₺{totalRevenue.toFixed(2)}</p>
          <p className="text-sm opacity-90 mt-2">{filteredOrders.filter(o => o.status === 'paid').length} sipariş</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">İkram Toplam</h3>
            <PieChart size={20} />
          </div>
          <p className="text-3xl font-bold">₺{complimentaryTotal.toFixed(2)}</p>
          <p className="text-sm opacity-90 mt-2">İndirim/İkram</p>
        </div>
      </div>

      {/* Ödeme Yöntemi Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ödeme Yöntemlerine Göre Gelir</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nakit</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">₺{paymentMethodBreakdown.cash.toFixed(2)}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Kart</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">₺{paymentMethodBreakdown.card.toFixed(2)}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Diğer</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">₺{paymentMethodBreakdown.other.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Gider Kategorileri */}
      {Object.keys(expensesByCategory).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gider Kategorileri</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(expensesByCategory).map(([category, amount]) => (
              <div key={category} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 capitalize">{category}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">₺{amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gelir/Gider İşlemleri */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gelir / Gider İşlemleri</h3>
          {dateRange !== 'all' && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({dateRange === 'today' ? 'Bugün' : dateRange === 'week' ? 'Son 7 Gün' : dateRange === 'month' ? 'Son 30 Gün' : 'Özel Tarih'})
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gelir / Gider İşlemleri</h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
          >
            <Plus size={18} />
            Yeni İşlem
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmitTransaction} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tür</label>
                <select
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="income">Gelir</option>
                  <option value="expense">Gider</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Açıklama</label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Açıklama"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tutar</label>
                <input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tarih</label>
                <input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button type="submit" className="px-6 py-2 bg-success text-white rounded-lg hover:bg-green-600 transition">
                Kaydet
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                İptal
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Tarih</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Tür</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Açıklama</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Tutar</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Henüz işlem yapılmadı
                  </td>
                </tr>
              ) : (
                sortedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      {new Date(transaction.date).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        transaction.type === 'income'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {transaction.type === 'income' ? 'Gelir' : 'Gider'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      {transaction.description}
                    </td>
                    <td className={`py-3 px-4 text-sm text-right font-medium ${
                      transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}₺{transaction.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm('Bu işlemi silmek istediğinizden emin misiniz?')) {
                            deleteTransaction(transaction.id);
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Masa Bazlı Gelirler */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Masa Bazlı Gelirler</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Masa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sipariş</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Gelir</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ortalama</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {tableStats.map((table) => (
              <tr key={table.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{table.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{table.totalOrders}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">₺{table.revenue.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {table.totalOrders > 0 ? `₺${(table.revenue / table.totalOrders).toFixed(2)}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Manager;
