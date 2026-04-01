// Başlangıç verileri - LocalStorage boşsa kullanılır

export const initialTables = [
  { id: 1, name: 'Masa 1', status: 'empty', orders: [], totalAmount: 0, occupiedAt: null, sessionDuration: 0, lastOrderTime: null },
  { id: 2, name: 'Masa 2', status: 'empty', orders: [], totalAmount: 0, occupiedAt: null, sessionDuration: 0, lastOrderTime: null },
  { id: 3, name: 'Masa 3', status: 'empty', orders: [], totalAmount: 0, occupiedAt: null, sessionDuration: 0, lastOrderTime: null },
  { id: 4, name: 'Masa 4', status: 'empty', orders: [], totalAmount: 0, occupiedAt: null, sessionDuration: 0, lastOrderTime: null },
  { id: 5, name: 'Masa 5', status: 'empty', orders: [], totalAmount: 0, occupiedAt: null, sessionDuration: 0, lastOrderTime: null },
  { id: 6, name: 'Masa 6', status: 'empty', orders: [], totalAmount: 0, occupiedAt: null, sessionDuration: 0, lastOrderTime: null },
];

// Dinamik kategori sistemi
export const initialCategories = [
  { id: 1, name: 'Soğuk İçecekler', icon: 'Glass', color: '#3B82F6', sortOrder: 1, active: true },
  { id: 2, name: 'Sıcak İçecekler', icon: 'Coffee', color: '#F59E0B', sortOrder: 2, active: true },
  { id: 3, name: 'Nargile', icon: 'Flame', color: '#EF4444', sortOrder: 3, active: true },
  { id: 4, name: 'Yiyecekler', icon: 'UtensilsCrossed', color: '#10B981', sortOrder: 4, active: true },
  { id: 5, name: 'Tatlılar', icon: 'CakeSlice', color: '#EC4899', sortOrder: 5, active: true },
  { id: 6, name: 'Atıştırmalık', icon: 'Cookie', color: '#8B5CF6', sortOrder: 6, active: true },
];

export const initialMenu = [
  // Soğuk İçecekler
  { id: 1, name: 'Soğuk İçecek', price: 20, category: 'Soğuk İçecekler', active: true },
  { id: 2, name: 'Su', price: 5, category: 'Soğuk İçecekler', active: true },
  { id: 3, name: 'Limonata', price: 25, category: 'Soğuk İçecekler', active: true },
  { id: 4, name: 'Meyve Suyu', price: 30, category: 'Soğuk İçecekler', active: true },

  // Sıcak İçecekler
  { id: 5, name: 'Çay', price: 15, category: 'Sıcak İçecekler', active: true },
  { id: 6, name: 'Kahve', price: 25, category: 'Sıcak İçecekler', active: true },
  { id: 7, name: 'Türk Kahvesi', price: 30, category: 'Sıcak İçecekler', active: true },
  { id: 8, name: 'Latte', price: 35, category: 'Sıcak İçecekler', active: true },

  // Nargile
  { id: 9, name: 'Nargile (Normal)', price: 100, category: 'Nargile', active: true },
  { id: 10, name: 'Nargile (Meşrubatlı)', price: 120, category: 'Nargile', active: true },
  { id: 11, name: 'Nargile (Special)', price: 150, category: 'Nargile', active: true },

  // Yiyecekler
  { id: 12, name: 'Tost', price: 40, category: 'Yiyecekler', active: true },
  { id: 13, name: 'Sandviç', price: 45, category: 'Yiyecekler', active: true },
  { id: 14, name: 'Hamburger', price: 80, category: 'Yiyecekler', active: true },
  { id: 15, name: 'Patates Kızartması', price: 30, category: 'Yiyecekler', active: true },
  { id: 16, name: 'Salata', price: 50, category: 'Yiyecekler', active: true },

  // Tatlılar
  { id: 17, name: 'Tatlı', price: 35, category: 'Tatlılar', active: true },
  { id: 18, name: 'Dondurma', price: 25, category: 'Tatlılar', active: true },
  { id: 19, name: 'Kek', price: 30, category: 'Tatlılar', active: true },

  // Atıştırmalık
  { id: 20, name: 'Cips', price: 20, category: 'Atıştırmalık', active: true },
  { id: 21, name: 'Kuru Yemiş', price: 25, category: 'Atıştırmalık', active: true },
];

export const initialUsers = [
  { id: 1, username: 'admin', password: 'admin', role: 'admin', name: 'Admin' },
  { id: 2, username: 'garson', password: 'garson', role: 'garson', name: 'Garson' },
];

export const menuCategories = ['Soğuk İçecekler', 'Sıcak İçecekler', 'Nargile', 'Yiyecekler', 'Tatlılar', 'Atıştırmalık'];
