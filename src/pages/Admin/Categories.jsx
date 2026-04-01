import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Plus, Edit, Trash2, X, Check, Coffee, CakeSlice, Cookie,
  Flame, CupSoda, UtensilsCrossed
} from 'lucide-react';

// İkon eşleşmeleri
const iconMap = {
  Coffee, CakeSlice, Cookie, Flame, CupSoda, UtensilsCrossed
};

const Categories = () => {
  const navigate = useNavigate();
  const { menu, addMenuItem, updateMenuItem, deleteMenuItem } = useApp();
  const [categories, setCategories] = useState([
    { id: 1, name: 'Soğuk İçecekler', icon: 'CupSoda', color: '#3B82F6', sortOrder: 1, active: true },
    { id: 2, name: 'Sıcak İçecekler', icon: 'Coffee', color: '#F59E0B', sortOrder: 2, active: true },
    { id: 3, name: 'Nargile', icon: 'Flame', color: '#EF4444', sortOrder: 3, active: true },
    { id: 4, name: 'Yiyecekler', icon: 'UtensilsCrossed', color: '#10B981', sortOrder: 4, active: true },
    { id: 5, name: 'Tatlılar', icon: 'CakeSlice', color: '#EC4899', sortOrder: 5, active: true },
    { id: 6, name: 'Atıştırmalık', icon: 'Cookie', color: '#8B5CF6', sortOrder: 6, active: true },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: 'Coffee',
    color: '#3B82F6',
    sortOrder: categories.length + 1,
    active: true
  });

  const availableIcons = [
    { name: 'Coffee', component: Coffee, label: 'Kahve' },
    { name: 'CupSoda', component: CupSoda, label: 'Bardak' },
    { name: 'Flame', component: Flame, label: 'Alev' },
    { name: 'UtensilsCrossed', component: UtensilsCrossed, label: 'Çatal/Bıçak' },
    { name: 'CakeSlice', component: CakeSlice, label: 'Pasta' },
    { name: 'Cookie', component: Cookie, label: 'Kurabiye' },
  ];

  const availableColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#EC4899', '#8B5CF6', '#06B6D4', '#84CC16'
  ];

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      icon: 'Coffee',
      color: '#3B82F6',
      sortOrder: categories.length + 1,
      active: true
    });
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({ ...category });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingCategory) {
      setCategories(categories.map(c =>
        c.id === editingCategory.id ? { ...formData, id: editingCategory.id } : c
      ));
    } else {
      setCategories([...categories, { ...formData, id: Date.now() }]);
    }
    setShowModal(false);

    // LocalStorage'a kaydet
    localStorage.setItem('categories', JSON.stringify(
      editingCategory
        ? categories.map(c => c.id === editingCategory.id ? { ...formData, id: editingCategory.id } : c)
        : [...categories, { ...formData, id: Date.now() }]
    ));
  };

  const handleDelete = (categoryId) => {
    if (window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) {
      setCategories(categories.filter(c => c.id !== categoryId));
      localStorage.setItem('categories', JSON.stringify(categories.filter(c => c.id !== categoryId)));
    }
  };

  const toggleActive = (categoryId) => {
    const updated = categories.map(c =>
      c.id === categoryId ? { ...c, active: !c.active } : c
    );
    setCategories(updated);
    localStorage.setItem('categories', JSON.stringify(updated));
  };

  const IconComponent = iconMap[formData.icon] || Coffee;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kategori Yönetimi</h2>
        <button
          onClick={() => navigate('/admin')}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          ← Geri
        </button>
      </div>

      {/* Add Category Button */}
      <div className="mb-6">
        <button
          onClick={openAddModal}
          className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center gap-2"
        >
          <Plus size={20} />
          Yeni Kategori Ekle
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((category) => {
            const IconComponent = iconMap[category.icon] || Coffee;
            const itemCount = menu.filter(item => item.category === category.name).length;

            return (
              <div
                key={category.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-2 transition ${
                  !category.active ? 'opacity-50' : ''
                }`}
                style={{ borderColor: category.active ? category.color : 'transparent' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <IconComponent size={24} style={{ color: category.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {itemCount} ürün
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(category)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      category.active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {category.active ? 'Aktif' : 'Pasif'}
                  </span>
                  <button
                    onClick={() => toggleActive(category.id)}
                    className={`text-sm font-medium transition ${
                      category.active
                        ? 'text-red-600 hover:text-red-700'
                        : 'text-green-600 hover:text-green-700'
                    }`}
                  >
                    {category.active ? 'Pasife Al' : 'Aktife Çıkar'}
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-primary text-white p-6 rounded-t-2xl">
              <h2 className="text-xl font-bold">
                {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
              </h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kategori Adı
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Örn: Soğuk İçecekler"
                />
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  İkon
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {availableIcons.map(({ name, component: Icon, label }) => (
                    <button
                      key={name}
                      onClick={() => setFormData({ ...formData, icon: name })}
                      className={`p-3 rounded-lg border-2 transition ${
                        formData.icon === name
                          ? 'border-primary bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      title={label}
                    >
                      <Icon size={20} className={formData.icon === name ? 'text-primary' : 'text-gray-600 dark:text-gray-400'} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Renk
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-full border-4 transition ${
                        formData.color === color
                          ? 'border-gray-900 dark:border-white scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sıra No
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="1"
                />
              </div>

              {/* Preview */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Önizleme:</p>
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg"
                  style={{ backgroundColor: `${formData.color}20` }}
                >
                  <IconComponent size={20} style={{ color: formData.color }} />
                  <span className="font-medium" style={{ color: formData.color }}>
                    {formData.name || 'Kategori Adı'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-b-2xl flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name.trim()}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingCategory ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
