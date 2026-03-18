import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, User, Clock, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Card, Button, Input } from '../components/common/UIComponents';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ApplicationMessages = () => {
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const { user, isAdmin } = useAuth();

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await api.get('/messages');
            setMessages(response.data);
        } catch (error) {
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageText.trim()) return;
        setSending(true);
        try {
            await api.post('/messages', { message: messageText });
            toast.success('Message sent to all staff!');
            setMessageText('');
            fetchMessages();
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-8 animate-fade-in">
            <div className="flex justify-between items-end border-b-4 border-black pb-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter uppercase italic">SYSTEM MESSAGES</h2>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">
                        {isAdmin() ? 'Broadcast alerts to your staff' : 'Direct messages from admin'}
                    </p>
                </div>
            </div>

            {isAdmin() && (
                <Card className="!p-8 border-2 border-black bg-gray-50/50">
                    <form onSubmit={handleSendMessage} className="space-y-4">
                        <div className="relative">
                            <textarea
                                className="w-full h-32 p-6 rounded-2xl border-2 border-gray-100 focus:border-black outline-none transition-all font-bold resize-none"
                                placeholder="Type your broadcast message here..."
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                required
                            />
                            <div className="absolute top-4 right-4 text-gray-200">
                                <MessageSquare size={40} />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button 
                                type="submit" 
                                className="px-10 h-14 flex items-center gap-3 active:scale-95 transition-all shadow-xl"
                                disabled={sending}
                            >
                                {sending ? <Loader2 className="animate-spin" /> : <>SEND BROADCAST <Send size={18} /></>}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-300 mb-6">RECORDS FEED</h3>
                {loading ? (
                    <div className="py-20 text-center font-black uppercase tracking-widest text-gray-300 animate-pulse">Retrieving logs...</div>
                ) : messages.length === 0 ? (
                    <div className="py-20 text-center opacity-20">
                        <MessageSquare size={64} className="mx-auto mb-4" />
                        <p className="font-black uppercase tracking-widest">No messages sent yet</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <Card key={msg._id} className="relative !p-8 border-2 border-transparent hover:border-gray-100 transition-all bg-white overflow-hidden group">
                            <div className="absolute -top-10 -right-10 text-gray-50 group-hover:text-black transition-colors opacity-10 group-hover:opacity-5">
                                <MessageSquare size={160} />
                            </div>
                            <div className="relative z-10 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                                            <User size={14} />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest">ADMIN BROADCAST</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Clock size={12} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                            {new Date(msg.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-lg font-bold leading-relaxed text-gray-700 italic border-l-4 border-black pl-6 py-2">
                                    "{msg.message}"
                                </p>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default ApplicationMessages;
