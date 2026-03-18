import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Plus, Edit2, Trash2, Search, Barcode, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import { Card, Button, Input, Modal, Loader, Select } from '../components/common/UIComponents';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import supplierService from '../services/supplierService';
import { useAuth } from '../context/AuthContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filters, setFilters] = useState({
    categoryId: '',
    keyword: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });

  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchProducts();
    fetchMetadata();
  }, [filters, pagination.page, pagination.pageSize]);

  const fetchMetadata = async () => {
    try {
      const [catRes, supRes] = await Promise.all([
        categoryService.getAll(),
        supplierService.getAll()
      ]);
      setCategories(catRes.data);
      setSuppliers(supRes.data);
    } catch (error) {
      toast.error('Failed to load categories or suppliers');
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getAll({
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...filters
      });
      setProducts(response.data.products.map(p => ({ ...p, id: p._id })));
      setPagination(prev => ({ ...prev, total: response.data.total }));
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // ... (keeping other handlers as is, just need to update the return statement)
  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        categoryId: product.categoryId?._id || product.categoryId,
        price: product.price,
        stock: product.stock,
        threshold: product.threshold || product.minStock,
        barcode: product.barcode,
        expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : '',
        supplierId: product.supplierId?._id || product.supplierId
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        categoryId: '',
        price: '',
        stock: '',
        threshold: '',
        barcode: '',
        expiryDate: '',
        supplierId: ''
      });
    }
    setIsModalOpen(true);
  };

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    stock: '',
    threshold: '',
    barcode: '',
    expiryDate: '',
    supplierId: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productService.update(editingProduct._id, formData);
        toast.success('Product updated successfully');
      } else {
        await productService.create(formData);
        toast.success('Product added successfully');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.delete(id);
        toast.success('Product deleted');
        fetchProducts();
      } catch (error) {
        toast.error('Deletion failed');
      }
    }
  };

  const columns = [
    { field: 'name', headerName: 'Product Name', flex: 1, minWidth: 200 },
    { field: 'barcode', headerName: 'Barcode', width: 150 },
    { 
      field: 'price', 
      headerName: 'Price', 
      width: 120,
      renderCell: (params) => <span className="font-bold">${params.value}</span>
    },
    { 
      field: 'stock', 
      headerName: 'Stock', 
      width: 120,
      renderCell: (params) => (
        <span className={`font-bold ${params.value <= params.row.threshold ? 'text-red-500' : 'text-green-500'}`}>
          {params.value}
        </span>
      )
    },
    { 
      field: 'categoryId', 
      headerName: 'Category', 
      width: 150,
      valueGetter: (value, row) => row.categoryId?.name || 'N/A'
    },
    { 
      field: 'supplierId', 
      headerName: 'Supplier', 
      width: 150,
      valueGetter: (value, row) => row.supplierId?.name || 'N/A'
    },
    { 
      field: 'autoReorder', 
      headerName: 'Auto Reorder', 
      width: 150,
      renderCell: (params) => (
        <button
          onClick={() => handleToggleAutoReorder(params.row._id)}
          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
            params.value 
              ? 'bg-black text-white border-black shadow-[0_0_10px_rgba(0,0,0,0.2)]' 
              : 'bg-white text-gray-300 border-gray-100 hover:border-gray-200'
          }`}
        >
          {params.value ? 'Enabled' : 'Manual'}
        </button>
      )
    },
    { 
      field: 'actions', 
      headerName: 'Actions', 
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <div className="flex gap-2">
          <button onClick={() => handleOpenModal(params.row)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><Edit2 size={16} /></button>
          {isAdmin() && (
            <button onClick={() => handleDelete(params.row._id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
          )}
        </div>
      )
    }
  ];

  const handleToggleAutoReorder = async (id) => {
    try {
      await productService.toggleAutoReorder(id);
      toast.success('Reorder mode updated');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update reorder mode');
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase underline decoration-gray-200 underline-offset-8">PRODUCTS</h2>
          <p className="text-gray-500 font-medium mt-3">Manage your store inventory catalog</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-8">
          <Plus size={20} /> ADD PRODUCT
        </Button>
      </div>

      <Card className="!p-0 overflow-hidden !border-none shadow-premium">
        <div className="p-4 border-b border-gray-100 flex gap-4 bg-white">
          <div className="flex-1 flex items-center bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl focus-within:border-black focus-within:bg-white transition-all">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products, barcode..." 
              className="bg-transparent border-none outline-none ml-2 text-sm w-full"
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
            />
          </div>
          <Select 
            className="!space-y-0 min-w-[200px]"
            options={categories}
            value={filters.categoryId}
            onChange={(e) => handleFilterChange('categoryId', e.target.value)}
            placeholder="All Categories"
          />
        </div>
        
        <div className="h-[600px] w-full bg-white">
          <DataGrid
            rows={products}
            columns={columns}
            pageSize={pagination.pageSize}
            rowCount={pagination.total}
            paginationMode="server"
            onPageChange={(page) => setPagination(prev => ({ ...prev, page: page + 1 }))}
            onPageSizeChange={(size) => setPagination(prev => ({ ...prev, pageSize: size, page: 1 }))}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            loading={loading}
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f9f9f9',
                borderBottom: '1px solid #eee',
                color: '#000',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #f5f5f5',
                fontSize: '14px',
                fontWeight: '500'
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#fcfcfc'
              }
            }}
          />
        </div>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'EDIT PRODUCT' : 'NEW PRODUCT'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>CANCEL</Button>
            <Button onClick={handleSubmit}>{editingProduct ? 'UPDATE PRODUCT' : 'SAVE PRODUCT'}</Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input 
            label="Product Name" 
            placeholder="e.g. Organic Soy Milk" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Barcode" 
              placeholder="Scan or enter" 
              value={formData.barcode}
              onChange={(e) => setFormData({...formData, barcode: e.target.value})}
              required
            />
            <Select 
              label="Category" 
              options={categories}
              value={formData.categoryId}
              onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Supplier" 
              options={suppliers}
              value={formData.supplierId}
              onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
              required
            />
            <Input 
              label="Expiry Date" 
              type="date" 
              value={formData.expiryDate}
              onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input 
              label="Price ($)" 
              type="number" 
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
            />
            <Input 
              label="Stock Qty" 
              type="number" 
              value={formData.stock}
              onChange={(e) => setFormData({...formData, stock: e.target.value})}
              required
            />
            <Input 
              label="Min Stock" 
              type="number" 
              value={formData.threshold}
              onChange={(e) => setFormData({...formData, threshold: e.target.value})}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
