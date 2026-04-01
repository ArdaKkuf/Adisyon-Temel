import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Lock, Unlock, TrendingUp, TrendingDown, DollarSign,
  Calendar, Download, BarChart3, PieChart, Users,
  ShoppingCart, Package, ArrowUpRight, ArrowDownRight,
  Filter, X
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const Manager = () => {
  const { managerUnlocked, unlockManager, lockManager, transactions, addTransaction, deleteTransaction, tables, orders, menu } = useApp();
  const [password, setPassword] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [dateRange, setDateRange] = useState('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newTransaction, setNewTransaction] = useState({
    type: 'income',
    category: 'sales',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Şifre kontrolü
  if (!managerUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={40} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Yönetici Paneli</h2>
            <p className="text-gray-600 dark:text-gray-400">Güvenli alana erişim için şifre girin</p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (unlockManager(password)) {
              setPassword('');
            } else {
              alert('Hatalı şifre');
            }
          }}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="••••••"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition flex items-center justify-center gap-2"
            >
              <Unlock size={20} />
              Paneli Aç
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Veri filtreleme
  const filterByDate = (items) => {
    if (dateRange === 'all') return items;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let startDate;
    if (dateRange === 'today') {
      startDate = today;
    } else if (dateRange === 'week') {
      startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateRange === 'month') {
      startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (dateRange === 'year') {
      startDate = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
    } else if (dateRange === 'custom' && customStartDate) {
      startDate = new Date(customStartDate);
    }

    return items.filter(item => {
      const itemDate = new Date(item.date || item.createdAt);
      return itemDate >= startDate;
    });
  };

  const filteredOrders = useMemo(() => filterByDate(orders || []), [orders, dateRange, customStartDate]);
  const filteredTransactions = useMemo(() => filterByDate(transactions || []), [transactions, dateRange, customStartDate]);

  // Gelir/Gider hesaplama
  const income = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const expense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const balance = income - expense;

  // Ciro (siparişler)
  const totalRevenue = filteredOrders
    .filter(o => o.status === 'paid')
    .reduce((sum, order) => {
      return sum + order.items.reduce((s, item) => {
        const price = item.isComplimentary ? 0 : item.price;
        return s + (price * item.quantity);
      }, 0);
    }, 0);

  // İkram toplamı
  const complimentaryTotal = filteredOrders.reduce((sum, order) => {
    return sum + order.items.reduce((s, item) => {
      if (item.isComplimentary) {
        return s + (item.price * item.quantity);
      }
      return s;
    }, 0);
  }, 0);

  // Ödeme yöntemleri
  const paymentBreakdown = useMemo(() => {
    const cash = filteredTransactions.filter(t => t.paymentMethod === 'cash').reduce((s, t) => s + t.amount, 0);
    const card = filteredTransactions.filter(t => t.paymentMethod === 'card').reduce((s, t) => s + t.amount, 0);
    return { cash, card, other: income - cash - card };
  }, [filteredTransactions, income]);

  // Günlük veri (grafik için)
  const dailyData = useMemo(() => {
    const days = {};
    const filtered = [...filteredOrders.filter(o => o.status === 'paid'), ...filteredTransactions];

    filtered.forEach(item => {
      const date = new Date(item.createdAt || item.date).toLocaleDateString('tr-TR');
      const amount = item.items ?
        item.items.reduce((s, i) => s + (i.isComplimentary ? 0 : i.price * i.quantity), 0) :
        item.amount || 0;

      if (item.type === 'expense' || (item.items && item.status === 'paid')) {
        days[date] = (days[date] || 0) + amount;
      }
    });

    return Object.entries(days)
      .slice(-30)
      .map(([date, amount]) => ({ date, amount }));
  }, [filteredOrders, filteredTransactions]);

  // Ürün satışları
  const productSales = useMemo(() => {
    const sales = {};
    filteredOrders.filter(o => o.status === 'paid').forEach(order => {
      order.items.forEach(item => {
        if (!item.isComplimentary) {
          sales[item.name] = (sales[item.name] || 0) + item.quantity;
        }
      });
    });

    return Object.entries(sales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, quantity]) => ({ name, quantity }));
  }, [filteredOrders]);

  // Masa performansı
  const tablePerformance = useMemo(() => {
    return (tables || []).map(table => {
      const tableOrders = filteredOrders.filter(o => o.tableId === table.id && o.status === 'paid');
      const revenue = tableOrders.reduce((sum, o) =>
        sum + o.items.reduce((s, i) => s + (i.isComplimentary ? 0 : i.price * i.quantity), 0), 0
      );
      return {
        ...table,
        revenue,
        orderCount: tableOrders.length,
        avgOrder: tableOrders.length > 0 ? revenue / tableOrders.length : 0
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [tables, filteredOrders]);

  // Gider kategorileri
  const expenseCategories = useMemo(() => {
    const categories = {};
    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
      categories[t.category || 'other'] = (categories[t.category || 'other'] || 0) + t.amount;
    });

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  const sortedTransactions = [...filteredTransactions].sort((a, b) =>
    new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
  );

  // İşlem ekle
  const handleSubmitTransaction = (e) => {
    e.preventDefault();
    if (newTransaction.description && newTransaction.amount) {
      addTransaction({
        type: newTransaction.type,
        category: newTransaction.category,
        description: newTransaction.description,
        amount: parseFloat(newTransaction.amount),
        date: newTransaction.date,
      });
      setNewTransaction({
        type: 'income',
        category: 'sales',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
      });
      setShowAddForm(false);
    }
  };

  // Export CSV
  const exportToCSV = () => {
    const headers = ['Tarih', 'Tür', 'Kategori', 'Açıklama', 'Tutar'];
    const rows = sortedTransactions.map(t => [
      t.date || new Date(t.createdAt).toLocaleDateString('tr-TR'),
      t.type === 'income' ? 'Gelir' : 'Gider',
      t.category || '-',
      t.description,
      t.amount.toFixed(2)
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapor-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Yönetici Paneli</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Finansal Raporlama ve Analiz</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                <Download size={18} />
                Export CSV
              </button>
              <button
                onClick={lockManager}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                <Lock size={18} />
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtreler */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="text-gray-400" size={20} />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg"
              >
                <option value="today">Bugün</option>
                <option value="week">Son 7 Gün</option>
                <option value="month">Son 30 Gün</option>
                <option value="year">Son 365 Gün</option>
                <option value="all">Tüm Zamanlar</option>
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

            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredTransactions.length} işlem • {filteredOrders.length} sipariş
              </span>
            </div>
          </div>
        </div>

        {/* Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-green-100 text-sm font-medium">Toplam Gelir</p>
                <p className="text-3xl font-bold mt-1">₺{income.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <TrendingUp size={24} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-100">
              <ArrowUpRight size={16} />
              <span>{filteredTransactions.filter(t => t.type === 'income').length} işlem</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-red-100 text-sm font-medium">Toplam Gider</p>
                <p className="text-3xl font-bold mt-1">₺{expense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <TrendingDown size={24} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-red-100">
              <ArrowDownRight size={16} />
              <span>{filteredTransactions.filter(t => t.type === 'expense').length} işlem</span>
            </div>
          </div>

          <div className={`bg-gradient-to-br rounded-xl p-6 text-white shadow-lg ${balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-gray-600 to-gray-700'}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium opacity-90">Net Kar/Zarar</p>
                <p className="text-3xl font-bold mt-1">₺{Math.abs(balance).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <DollarSign size={24} />
              </div>
            </div>
            <p className={`text-sm ${balance >= 0 ? 'text-blue-100' : 'text-gray-300'}`}>
              {balance >= 0 ? 'Kâr' : 'Zarar'} • %{balance >= 0 ? ((balance / income) * 100).toFixed(1) : ((Math.abs(balance) / income) * 100).toFixed(1)} marjı
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-purple-100 text-sm font-medium">Toplam Ciro</p>
                <p className="text-3xl font-bold mt-1">₺{totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <BarChart3 size={24} />
              </div>
            </div>
            <p className="text-sm text-purple-100">
              {filteredOrders.filter(o => o.status === 'paid').length} sipariş
            </p>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-pink-100 text-sm font-medium">İkram Toplam</p>
                <p className="text-3xl font-bold mt-1">₺{complimentaryTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Package size={24} />
              </div>
            </div>
            <p className="text-sm text-pink-100">
              İndirim ve kayıp
            </p>
          </div>
        </div>

        {/* Grafikler */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gelir/Gider Grafiği */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Gelir/Gider Trendi
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} name="Tutar (₺)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Ödeme Yöntemleri */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Ödeme Yöntemleri
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={[
                    { name: 'Nakit', value: paymentBreakdown.cash },
                    { name: 'Kart', value: paymentBreakdown.card },
                    { name: 'Diğer', value: paymentBreakdown.other }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  <Cell fill="#10B981" />
                  <Cell fill="#3B82F6" />
                  <Cell fill="#8B5CF6" />
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* En Çok Satan Ürünler */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            En Çok Satan Ürünler (Top 10)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productSales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip />
              <Bar dataKey="quantity" fill="#3B82F6" name="Adet" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Masa Performansı */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Masa Performansı
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Masa</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Sipariş</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Gelir</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Ortalama</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Performans</th>
                </tr>
              </thead>
              <tbody>
                {tablePerformance.map((table) => (
                  <tr key={table.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{table.name}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{table.orderCount}</td>
                    <td className="py-3 px-4 font-semibold text-green-600 dark:text-green-400">
                      ₺{table.revenue.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      ₺{table.avgOrder.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${(table.revenue / (tablePerformance[0]?.revenue || 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {tablePerformance[0]?.revenue > 0 ? ((table.revenue / tablePerformance[0].revenue) * 100).toFixed(0) : 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gelir/Gider İşlemleri */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Gelir / Gider İşlemleri
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
            >
              <Filter size={18} />
              Yeni İşlem
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleSubmitTransaction} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tür</label>
                  <select
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg"
                  >
                    <option value="income">Gelir</option>
                    <option value="expense">Gider</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kategori</label>
                  <select
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg"
                  >
                    <option value="sales">Satış</option>
                    <option value="rent">Kira</option>
                    <option value="supplies">Malzeme</option>
                    <option value="wages">Maaş</option>
                    <option value="bills">Faturalar</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Açıklama</label>
                  <input
                    type="text"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg"
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
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Kategori</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Açıklama</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Tutar</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      İşlem bulunmuyor
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
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white capitalize">
                        {transaction.category}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        {transaction.description}
                      </td>
                      <td className={`py-3 px-4 text-sm text-right font-semibold ${
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
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Manager;
