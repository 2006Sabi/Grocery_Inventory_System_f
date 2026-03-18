import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Trash2, Plus, Minus, Printer, FileText, Barcode, CheckCircle2 } from 'lucide-react';
import { Card, Button, Input, Modal } from '../components/common/UIComponents';
import productService from '../services/productService';
import billingService from '../services/billingService';
import { toast } from 'react-toastify';

const Billing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastInvoice, setLastInvoice] = useState(null);

  const GST_PERCENTAGE = 18;

  const handleSearch = async (val) => {
    setSearchTerm(val);
    if (val.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await productService.getAll();
      const filtered = response.data.products.filter(p => 
        p.name.toLowerCase().includes(val.toLowerCase()) || 
        p.barcode.includes(val)
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Search error');
    }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) {
      toast.warning('Product out of stock');
      return;
    }
    const existing = cart.find(item => item._id === product._id);
    if (existing) {
      updateQuantity(product._id, 1);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item._id === id) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        if (newQty > item.stock) {
          toast.warning(`Only ${item.stock} units available`);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item._id !== id));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const gst = (subtotal * GST_PERCENTAGE) / 100;
    const total = subtotal + gst;
    return { subtotal, gst, total };
  };

  const { subtotal, gst, total } = calculateTotals();

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const invoiceData = {
        items: cart.map(item => ({
          productId: item._id,
          quantity: item.quantity
        })),
        gstRate: GST_PERCENTAGE
      };
      
      const response = await billingService.createInvoice(invoiceData);
      setLastInvoice(response.data);
      toast.success('Invoiced successfully!');
      setCart([]);
      setShowInvoice(true);
    } catch (error) {
      toast.error('Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
      {/* Product Selection */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-3xl font-black tracking-tighter uppercase underline decoration-gray-200 underline-offset-8">BILLING SYSTEM</h2>
            <p className="text-gray-500 font-medium mt-3">Scan barcodes or search products to bill</p>
          </div>
        </div>

        <Card className="!p-0 overflow-hidden !border-none shadow-premium relative">
          <div className="p-6 bg-black text-white rounded-t-xl flex items-center gap-4">
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="PRO TIP: SCAN BARCODE OR TYPE PRODUCT NAME..." 
                className="w-full bg-gray-900 border-none rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-gray-700 transition-all font-black text-sm uppercase tracking-widest"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
              />
              <Barcode size={24} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="absolute top-[88px] left-0 right-0 bg-white border-x border-b border-gray-100 shadow-2xl z-20 max-h-80 overflow-y-auto rounded-b-2xl">
              {searchResults.map(product => (
                <button 
                  key={product._id}
                  onClick={() => addToCart(product)}
                  className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center font-black text-xs">SKU</div>
                    <div className="text-left">
                      <p className="font-bold text-black uppercase tracking-tight">{product.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Stock: {product.stock} | {product.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-black text-lg">${product.price}</span>
                    <Plus size={20} className="text-black" />
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="p-6 min-h-[400px]">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full pt-12 space-y-4 opacity-30">
                <ShoppingCart size={80} strokeWidth={1} />
                <p className="font-black uppercase tracking-[0.3em] text-sm">Cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-black transition-all group">
                    <div className="flex items-center gap-4">
                      <button onClick={() => removeFromCart(item._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                      <div>
                        <p className="font-bold text-black uppercase tracking-tight">{item.name}</p>
                        <p className="text-xs font-bold text-gray-400">${item.price} per unit</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-soft">
                        <button onClick={() => updateQuantity(item._id, -1)} className="p-2 hover:bg-gray-50 text-black"><Minus size={16} /></button>
                        <span className="px-4 font-black">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, 1)} className="p-2 hover:bg-gray-50 text-black"><Plus size={16} /></button>
                      </div>
                      <span className="w-20 text-right font-black text-lg">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Checkout Sidebar */}
      <div className="space-y-6">
        <Card className="h-fit sticky top-28 shadow-premium !border-none">
          <h3 className="text-xl font-black tracking-tight mb-8 flex items-center gap-2">
            <FileText size={20} /> SUMMARY
          </h3>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-sm font-bold text-gray-400 uppercase tracking-widest">
              <span>Subtotal</span>
              <span className="text-black font-black">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-400 uppercase tracking-widest">
              <span>GST ({GST_PERCENTAGE}%)</span>
              <span className="text-black font-black">${gst.toFixed(2)}</span>
            </div>
            <div className="pt-4 border-t border-dashed border-gray-200 flex justify-between">
              <span className="text-lg font-black tracking-tighter uppercase">Total Amount</span>
              <span className="text-3xl font-black">${total.toFixed(2)}</span>
            </div>
          </div>

          <Button 
            className="w-full py-6 flex items-center justify-center gap-3 shadow-xl"
            disabled={cart.length === 0 || submitting}
            onClick={handleCheckout}
          >
            {submitting ? 'PROCESSING...' : (
              <>
                PROCEED TO CHECKOUT <CheckCircle2 size={20} />
              </>
            )}
          </Button>

          <p className="text-[10px] text-center mt-6 text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
            By clicking checkout, you confirm that products have been verified and stock will be auto-deducted.
          </p>
        </Card>

        <Card title="Payment Method" className="!p-6">
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 border-2 border-black bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-center">CASH</button>
            <button className="p-4 border-2 border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-center text-gray-400">DIGITAL</button>
          </div>
        </Card>
      </div>

      {/* Invoice Modal */}
      <Modal 
        isOpen={showInvoice} 
        onClose={() => setShowInvoice(false)}
        title="INVOICE GENERATED"
        footer={<Button className="w-full flex items-center justify-center gap-2" onClick={() => window.print()}><Printer size={18} /> PRINT INVOICE</Button>}
      >
        <div className="text-center space-y-4 py-6">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-100">
            <CheckCircle2 size={40} />
          </div>
          <h4 className="text-2xl font-black tracking-tighter">SUCCESS!</h4>
          <p className="text-gray-500 font-medium">Invoice <span className="text-black font-black">#{lastInvoice?._id?.slice(-6).toUpperCase()}</span> has been generated and stock levels updated.</p>
        </div>
      </Modal>
    </div>
  );
};

export default Billing;
