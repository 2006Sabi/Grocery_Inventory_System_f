import React, { useEffect, useState } from 'react';
import { Bell, Plus, Edit2, Trash2, X, AlertCircle, Clock, Package, Info, Loader2 } from 'lucide-react';
import { Card, Button, Loader } from '../components/common/UIComponents';
import notificationService from '../services/notificationService';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [formData, setFormData] = useState({
    message: '',
    type: 'INFO',
    productName: ''
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getNotifications();
      setNotifications(response.data);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await notificationService.updateNotification(currentNotification._id, formData);
        toast.success('Notification updated');
      } else {
        await notificationService.createNotification(formData);
        toast.success('Notification created');
      }
      setShowModal(false);
      resetForm();
      fetchNotifications();
    } catch (error) {
      toast.error(isEditing ? 'Failed to update' : 'Failed to create');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await notificationService.deleteNotification(id);
        toast.success('Notification deleted');
        fetchNotifications();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleEdit = (notification) => {
    setCurrentNotification(notification);
    setFormData({
      message: notification.message,
      type: notification.type,
      productName: notification.productName || ''
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ message: '', type: 'INFO', productName: '' });
    setIsEditing(false);
    setCurrentNotification(null);
  };

  const getStatusColor = (type) => {
    switch (type) {
      case 'OUT_OF_STOCK': return 'bg-red-500';
      case 'LOW_STOCK': return 'bg-orange-500';
      case 'EXPIRY': return 'bg-yellow-500';
      case 'INFO': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'OUT_OF_STOCK': return <AlertCircle className="text-white" size={18} />;
      case 'LOW_STOCK': return <Package className="text-white" size={18} />;
      case 'EXPIRY': return <Clock className="text-white" size={18} />;
      case 'INFO': return <Info className="text-white" size={18} />;
      default: return <Bell className="text-white" size={18} />;
    }
  };

  if (loading && notifications.length === 0) return <div className="flex justify-center items-center h-64"><Loader /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase underline decoration-gray-200 underline-offset-8">NOTIFICATIONS</h2>
          <p className="text-gray-500 text-xs mt-4 tracking-widest font-bold">MANAGE SYSTEM BROADCASTS & ALERTS</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 font-black tracking-widest uppercase"
        >
          <Plus size={18} /> Add Notification
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {notifications.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Bell size={48} strokeWidth={1} className="mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-widest text-xs">No notifications available</p>
          </Card>
        ) : (
          notifications.map((n) => (
            <Card key={n._id} className="!p-0 overflow-hidden border-l-4 border-black group">
              <div className="p-4 flex items-center gap-4">
                <div className={`${getStatusColor(n.type)} p-3 rounded-xl shadow-sm`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      {n.type} • {format(new Date(n.createdAt), 'MMM dd, HH:mm')}
                    </span>
                    {n.createdBy && (
                      <span className="text-[9px] font-bold text-gray-400 uppercase">
                        BY: {n.createdBy.name}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-black">{n.message}</h4>
                  {n.productName && (
                    <span className="text-[10px] font-bold text-gray-500 mt-1 block uppercase">
                      PRODUCT: {n.productName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(n)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-black">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(n._id)} className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md !p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase tracking-tighter">
                {isEditing ? 'Edit Notification' : 'Add Notification'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Message</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-black transition-all min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-black"
                  >
                    <option value="INFO">INFO</option>
                    <option value="LOW_STOCK">LOW STOCK</option>
                    <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                    <option value="EXPIRY">EXPIRY</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Product Name</label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData({...formData, productName: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-black"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full !py-4 font-black tracking-widest uppercase shadow-premium mt-4">
                {isEditing ? 'Update Alert' : 'Create Alert'}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
