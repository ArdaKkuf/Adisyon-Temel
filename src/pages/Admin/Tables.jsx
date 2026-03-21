import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';

const Tables = () => {
  const { tables, addTable, updateTable, deleteTable } = useApp();
  const [isEditing, setIsEditing] = useState(null);
  const [editName, setEditName] = useState('');
  const [newTableName, setNewTableName] = useState('');

  const handleEdit = (table) => {
    setIsEditing(table.id);
    setEditName(table.name);
  };

  const handleSave = (id) => {
    if (editName.trim()) {
      updateTable(id, { name: editName });
      setIsEditing(null);
    }
  };

  const handleCancel = () => {
    setIsEditing(null);
    setEditName('');
  };

  const handleAdd = () => {
    if (newTableName.trim()) {
      addTable({ name: newTableName });
      setNewTableName('');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Bu masayı silmek istediğinizden emin misiniz?')) {
      deleteTable(id);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'empty': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'occupied': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'empty': return 'Boş';
      case 'occupied': return 'Dolu';
      case 'paid': return 'Ödendi';
      default: return status;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Masa Yönetimi</h2>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Yeni Masa Ekle</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            placeholder="Masa adı (örn: Masa 7)"
          />
          <button
            onClick={handleAdd}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
          >
            <Plus size={20} />
            Ekle
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Masa Adı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tutar
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {tables.map((table) => (
              <tr key={table.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing === table.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{table.name}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(table.status)}`}>
                    {getStatusText(table.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  ₺{table.totalAmount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  {isEditing === table.id ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleSave(table.id)}
                        className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                      >
                        <Save size={18} />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(table)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(table.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tables;
