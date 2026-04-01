import React, { createContext, useContext, useEffect, useState } from 'react';
import { initialTables, initialMenu, initialUsers } from '../data/initialData';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // LocalStorage'dan veri çekme
  const loadFromStorage = (key, defaultValue) => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  };

  // Migration - Mevcut verileri yeni formata upgrade et
  const migrateData = () => {
    if (localStorage.getItem('migrated_v2')) return;

    // Tables migration
    const currentTables = JSON.parse(localStorage.getItem('tables')) || initialTables;
    const migratedTables = currentTables.map(table => ({
      ...table,
      occupiedAt: table.occupiedAt || null,
      sessionDuration: table.sessionDuration || 0,
      lastOrderTime: table.lastOrderTime || null
    }));
    localStorage.setItem('tables', JSON.stringify(migratedTables));

    // Orders migration
    const currentOrders = JSON.parse(localStorage.getItem('orders')) || [];
    const migratedOrders = currentOrders.map(order => ({
      ...order,
      paymentMethod: order.paymentMethod || 'cash',
      paymentDetails: order.paymentDetails || null,
      isComplimentary: order.isComplimentary || false,
      complimentaryReason: order.complimentaryReason || ''
    }));
    localStorage.setItem('orders', JSON.stringify(migratedOrders));

    localStorage.setItem('migrated_v2', 'true');
  };

  // Migration'ı çalıştır
  migrateData();

  // State
  const [user, setUser] = useState(null);
  const [managerUnlocked, setManagerUnlocked] = useState(false);
  const [tables, setTables] = useState(() => loadFromStorage('tables', initialTables));
  const [menu, setMenu] = useState(() => loadFromStorage('menu', initialMenu));
  const [users] = useState(() => loadFromStorage('users', initialUsers));
  const [orders, setOrders] = useState(() => loadFromStorage('orders', []));
  const [transactions, setTransactions] = useState(() => loadFromStorage('transactions', []));
  const [stock, setStock] = useState(() => loadFromStorage('stock', {}));

  // LocalStorage'a kaydetme
  useEffect(() => {
    localStorage.setItem('tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('menu', JSON.stringify(menu));
  }, [menu]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('stock', JSON.stringify(stock));
  }, [stock]);

  // Yönetici şifresi kontrolü
  const unlockManager = (password) => {
    if (password === '1') {
      setManagerUnlocked(true);
      return true;
    }
    return false;
  };

  const lockManager = () => {
    setManagerUnlocked(false);
  };

  // Masa işlemleri
  const addTable = (table) => {
    const newTable = {
      id: Date.now(),
      name: table.name,
      status: 'empty',
      orders: [],
      totalAmount: 0,
    };
    setTables([...tables, newTable]);
  };

  const updateTable = (id, updates) => {
    setTables(tables.map(table => table.id === id ? { ...table, ...updates } : table));
  };

  const deleteTable = (id) => {
    setTables(tables.filter(table => table.id !== id));
  };

  // Menü ve stok işlemleri
  const addMenuItem = (item) => {
    const newItem = {
      id: Date.now(),
      ...item,
      active: true,
    };
    setMenu([...menu, newItem]);
    // Stok oluştur
    setStock(prev => ({
      ...prev,
      [newItem.id]: 100, // Varsayılan stok
    }));
  };

  const updateMenuItem = (id, updates) => {
    setMenu(menu.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteMenuItem = (id) => {
    setMenu(menu.filter(item => item.id !== id));
    // Stoğu da sil
    setStock(prev => {
      const newStock = { ...prev };
      delete newStock[id];
      return newStock;
    });
  };

  const updateStock = (itemId, quantity) => {
    setStock(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + quantity),
    }));
  };

  const getStock = (itemId) => {
    return stock[itemId] || 0;
  };

  // Sipariş işlemleri
  const addOrder = (tableId, items) => {
    const newOrder = {
      id: Date.now(),
      tableId,
      items,
      status: 'pending', // pending -> preparing -> delivered -> paid
      createdAt: new Date().toISOString(),
      paymentMethod: 'cash',
      paymentDetails: null,
      isComplimentary: false,
      complimentaryReason: '',
    };

    setOrders([...orders, newOrder]);

    // Masayı güncelle
    const table = tables.find(t => t.id === tableId);
    const wasEmpty = table?.status === 'empty';
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const tableUpdates = {
      status: 'occupied',
      orders: [...orders.filter(o => o.tableId === tableId && o.status !== 'paid'), newOrder],
      totalAmount: (table?.totalAmount || 0) + totalAmount,
      lastOrderTime: new Date().toISOString(),
    };

    // Eğer masa boştu, occupiedAt zamanını set et
    if (wasEmpty) {
      tableUpdates.occupiedAt = new Date().toISOString();
    }

    updateTable(tableId, tableUpdates);

    // Stoğu düş
    items.forEach(item => {
      updateStock(item.id, -item.quantity);
    });
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders(orders.map(order => order.id === orderId ? { ...order, status } : order));
  };

  const closeTable = (tableId) => {
    const table = tables.find(t => t.id === tableId);

    // Önce siparişleri güncelle
    const updatedOrders = orders.map(order =>
      order.tableId === tableId && order.status !== 'paid'
        ? {
            ...order,
            status: 'paid',
            completedAt: new Date().toISOString(),
          }
        : order
    );
    setOrders(updatedOrders);

    // Session duration hesapla
    let sessionDuration = 0;
    if (table?.occupiedAt) {
      const occupied = new Date(table.occupiedAt);
      const now = new Date();
      sessionDuration = Math.floor((now - occupied) / 1000 / 60); // dakika
    }

    // Sonra masayı güncelle
    updateTable(tableId, {
      status: 'empty',
      orders: [],
      totalAmount: 0,
      occupiedAt: null,
      sessionDuration,
      lastOrderTime: null,
    });
  };

  // Gelir/Gider işlemleri
  const addTransaction = (transaction) => {
    const newTransaction = {
      id: Date.now(),
      ...transaction,
      createdAt: new Date().toISOString(),
    };
    setTransactions([...transactions, newTransaction]);
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const getIncomeExpense = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, balance: income - expense };
  };

  // Ödeme işlemleri
  const processPayment = (tableId, paymentData) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    // Ödeme kaydı oluştur
    const transaction = {
      type: 'income',
      category: 'sales',
      description: `${table.name} ödeme (${paymentData.method === 'cash' ? 'Nakit' : 'Kart'})`,
      amount: table.totalAmount,
      date: new Date().toISOString().split('T')[0],
      relatedOrderId: tableId,
      paymentMethod: paymentData.method,
    };

    addTransaction(transaction);
    closeTable(tableId);
  };

  const processSplitPayment = (tableId, splits) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    splits.forEach(split => {
      if (split.total > 0) {
        const transaction = {
          type: 'income',
          category: 'sales',
          description: `${table.name} - ${split.name} (${split.method === 'cash' ? 'Nakit' : 'Kart'})`,
          amount: split.total,
          date: new Date().toISOString().split('T')[0],
          relatedOrderId: tableId,
          paymentMethod: split.method,
        };
        addTransaction(transaction);
      }
    });

    closeTable(tableId);
  };

  // Login
  const login = (username, password) => {
    const foundUser = users.find(u => u.username === username && u.password === password);
    if (foundUser) {
      setUser({ id: foundUser.id, username: foundUser.username, role: foundUser.role, name: foundUser.name });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setManagerUnlocked(false);
  };

  const value = {
    user,
    managerUnlocked,
    tables,
    menu,
    orders,
    transactions,
    stock,
    addTable,
    updateTable,
    deleteTable,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    updateStock,
    getStock,
    addOrder,
    updateOrderStatus,
    closeTable,
    unlockManager,
    lockManager,
    addTransaction,
    deleteTransaction,
    getIncomeExpense,
    processPayment,
    processSplitPayment,
    login,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
