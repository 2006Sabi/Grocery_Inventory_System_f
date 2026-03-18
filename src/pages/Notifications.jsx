import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle, Clock, Package, AlertCircle, Send, MessageSquare, Info } from 'lucide-react';
import { Card, Button, Loader } from '../components/common/UIComponents';
import notificationService from '../services/notificationService';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

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

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      toast.error('Failed to update notification');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      await notificationService.sendStaffMessage({ message });
      setMessage('');
      toast.success('Message broadcasted');
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (type) => {
    switch (type) {
      case 'OUT_OF_STOCK': return 'bg-red-500';
      case 'LOW_STOCK': return 'bg-orange-500';
      case 'EXPIRY': return 'bg-yellow-500';
      case 'MESSAGE': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'OUT_OF_STOCK': return <AlertCircle className="text-white" size={18} />;
      case 'LOW_STOCK': return <Package className="text-white" size={18} />;
      case 'EXPIRY': return <Clock className="text-white" size={18} />;
      case 'MESSAGE': return <MessageSquare className="text-white" size={18} />;
      default: return <Bell className="text-white" size={18} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading && notifications.length === 0) return <div className="flex justify-center items-center h-64"><Loader /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase underline decoration-gray-200 underline-offset-8">COMMUNICATION HUB</h2>
          <p className="text-gray-500 text-xs mt-4 tracking-widest font-bold">SYSTEM ALERTS & STAFF BROADCASTS ({unreadCount} UNREAD)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {notifications.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Bell size={48} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-widest text-xs">No notifications available</p>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification._id} 
                className={`!p-0 overflow-hidden border-l-4 transition-all hover:shadow-lg ${notification.isRead ? 'opacity-70 border-gray-200' : 'border-black shadow-md'}`}
              >
                <div className={`p-4 flex items-start gap-4 ${!notification.isRead ? 'bg-white' : 'bg-gray-50'}`}>
                  <div className={`${getStatusColor(notification.type)} p-3 rounded-xl shadow-sm mt-1 shrink-0`}>
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                            {notification.type.replace('_', ' ')} • {format(new Date(notification.createdAt), 'MMM dd, HH:mm')}
                          </span>
                          {notification.type === 'MESSAGE' && notification.sender && (
                            <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                              FROM: {notification.sender.name} ({notification.sender.role})
                            </span>
                          )}
                        </div>
                        
                        <h4 className={`text-sm font-bold leading-relaxed ${!notification.isRead ? 'text-black' : 'text-gray-500'}`}>
                          {notification.message}
                        </h4>

                        {(notification.productId || notification.productName) && (
                          <div className="mt-2 flex flex-wrap gap-2">
                             <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-[9px] font-black text-gray-600 uppercase">
                                <Package size={10} /> {notification.productName || notification.productId?.name}
                             </div>
                             {notification.stock !== undefined && (
                               <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-[9px] font-black text-gray-600 uppercase">
                                  <Info size={10} /> STOCK: {notification.stock}
                               </div>
                             )}
                             {notification.expiryDate && (
                               <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-[9px] font-black text-gray-600 uppercase">
                                  <Clock size={10} /> EXP: {format(new Date(notification.expiryDate), 'MMM dd, yyyy')}
                               </div>
                             )}
                          </div>
                        )}
                      </div>
                      
                      {!notification.isRead && (
                        <button 
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="text-gray-400 hover:text-black transition-colors"
                          title="Mark as read"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6 !p-6 border-2 border-black">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Send size={14} /> Send Broadcast
            </h4>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message to all staff..."
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-black transition-all min-h-[150px] resize-none"
                  disabled={sending}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full !py-4 font-black tracking-widest uppercase flex items-center justify-center gap-2 shadow-premium"
                disabled={sending || !message.trim()}
              >
                {sending ? <Loader /> : <><Send size={16} /> REQUISITION BLAST</>}
              </Button>
            </form>
            <p className="mt-6 text-[10px] text-gray-400 font-bold leading-relaxed italic">
              * Messages sent here will be visible to all administrators and floor staff immediately.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
