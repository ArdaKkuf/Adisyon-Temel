import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Unlock, TrendingUp, ArrowDown, DollarSign, Plus, Trash2, BarChart3 } from 'lucide-react';

const Manager = () => {
  const { managerUnlocked, unlockManager, lockManager, transactions, addTransaction, deleteTransaction, getIncomeExpense, tables, orders } = useApp();
  const [password, setPassword] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'income',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

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

  // Bakiye hesapla - gelir - gider (gün sonu kasası dahil)
  const income = safeTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const expense = safeTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const balance = income - expense;

  // Ciro hesaplama
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

  const sortedTransactions = [...safeTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Yönetici Paneli</h2>
        <button
          onClick={lockManager}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          <Lock size={18} />
          Kilitle
        </button>
      </div>

      {/* Gelir/Gider Özeti */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Toplam Gelir</h3>
            <TrendingUp size={20} />
          </div>
          <p className="text-3xl font-bold">₺{income.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Toplam Gider</h3>
            <ArrowDown size={20} />
          </div>
          <p className="text-3xl font-bold">₺{expense.toFixed(2)}</p>
        </div>

        <div className={`bg-gradient-to-br rounded-xl shadow-sm p-6 text-white ${balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-gray-600 to-gray-700'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Net Bakiye</h3>
            <DollarSign size={20} />
          </div>
          <p className="text-3xl font-bold">₺{balance.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-90">Bugunki Ciro</h3>
            <BarChart3 size={20} />
          </div>
          <p className="text-3xl font-bold">₺{todayRevenue.toFixed(2)}</p>
          <p className="text-sm opacity-90 mt-2">{todayOrders.length} sipariş</p>
        </div>
      </div>

      {/* Gelir/Gider İşlemleri */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
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
