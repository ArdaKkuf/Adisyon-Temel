// Başlangıç verileri - LocalStorage boşsa kullanılır

export const initialTables = [
  { id: 1, name: 'Masa 1', status: 'empty', orders: [], totalAmount: 0 },
  { id: 2, name: 'Masa 2', status: 'empty', orders: [], totalAmount: 0 },
  { id: 3, name: 'Masa 3', status: 'empty', orders: [], totalAmount: 0 },
  { id: 4, name: 'Masa 4', status: 'empty', orders: [], totalAmount: 0 },
  { id: 5, name: 'Masa 5', status: 'empty', orders: [], totalAmount: 0 },
  { id: 6, name: 'Masa 6', status: 'empty', orders: [], totalAmount: 0 },
];

export const initialMenu = [
  // İçecekler
  { id: 1, name: 'Çay', price: 15, category: 'İçecekler', active: true },
  { id: 2, name: 'Kahve', price: 25, category: 'İçecekler', active: true },
  { id: 3, name: 'Türk Kahvesi', price: 30, category: 'İçecekler', active: true },
  { id: 4, name: 'Soğuk İçecek', price: 20, category: 'İçecekler', active: true },
  { id: 5, name: 'Su', price: 5, category: 'İçecekler', active: true },

  // Yiyecekler
  { id: 6, name: 'Tost', price: 40, category: 'Yiyecekler', active: true },
  { id: 7, name: 'Sandviç', price: 45, category: 'Yiyecekler', active: true },
  { id: 8, name: 'Hamburger', price: 80, category: 'Yiyecekler', active: true },
  { id: 9, name: 'Patates Kızartması', price: 30, category: 'Yiyecekler', active: true },
  { id: 10, name: 'Salata', price: 50, category: 'Yiyecekler', active: true },

  // Tatlılar
  { id: 11, name: 'Tatlı', price: 35, category: 'Tatlılar', active: true },
  { id: 12, name: 'Dondurma', price: 25, category: 'Tatlılar', active: true },
  { id: 13, name: 'Kek', price: 30, category: 'Tatlılar', active: true },
];

export const initialUsers = [
  { id: 1, username: 'admin', password: 'admin', role: 'admin', name: 'Admin' },
  { id: 2, username: 'garson', password: 'garson', role: 'garson', name: 'Garson' },
];

export const menuCategories = ['İçecekler', 'Yiyecekler', 'Tatlılar'];
