import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Layers } from 'lucide-react';
import { toast } from 'react-toastify';
import { Card, Button, Input, Modal, Loader } from '../components/common/UIComponents';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description || '' });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, formData);
        toast.success('Category updated');
      } else {
        await api.post('/categories', formData);
        toast.success('Category created');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/categories/${id}`);
        toast.success('Category deleted');
        fetchCategories();
      } catch (error) {
        toast.error('Deletion failed');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase underline decoration-gray-200 underline-offset-8 text-black">CATEGORIES</h2>
          <p className="text-gray-500 font-medium mt-3">Organize your inventory by groups</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-8">
          <Plus size={20} /> NEW CATEGORY
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-400 font-black uppercase tracking-widest">
            LOADING COLLECTIONS...
          </div>
        ) : (
          categories.map((cat) => (
            <Card key={cat._id} className="group hover:border-black transition-all">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all transform group-hover:rotate-12">
                  <Layers size={24} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(cat)} className="p-2 hover:bg-gray-100 rounded-lg"><Edit2 size={16} /></button>
                  {isAdmin() && (
                    <button onClick={() => handleDelete(cat._id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={16} /></button>
                  )}
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-black uppercase tracking-tight">{cat.name}</h3>
                <p className="text-gray-400 text-sm font-medium mt-1 leading-relaxed">
                  {cat.description || 'No description provided for this category.'}
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                  SYSTEM COLLECTION
                </span>
                <span className="text-[10px] font-black bg-black text-white px-3 py-1 rounded-full uppercase tracking-widest">
                  ACTIVE
                </span>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'EDIT CATEGORY' : 'NEW CATEGORY'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>CANCEL</Button>
            <Button onClick={handleSubmit}>{editingCategory ? 'UPDATE' : 'CREATE'}</Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input 
            label="Category Name" 
            placeholder="e.g. Beverages" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <Input 
            label="Description" 
            placeholder="Brief details about this group..." 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </form>
      </Modal>
    </div>
  );
};

export default Categories;
