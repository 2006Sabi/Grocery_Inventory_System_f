import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button, Input, Card } from '../../components/common/UIComponents';
import { useAuth } from '../../context/AuthContext';

const StaffLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const success = await login(email, password);
            if (success) {
                toast.success('Welcome back, Staff!');
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center items-center p-6">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-4">
                    <div className="inline-block p-4 bg-black rounded-3xl shadow-2xl mb-2 rotate-3 hover:rotate-0 transition-transform duration-500">
                        <Lock className="text-white w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-none italic">STAFF ACCESS</h1>
                        <p className="text-gray-400 font-bold tracking-[0.2em] text-xs uppercase mt-2">Inventory Management Portal</p>
                    </div>
                </div>

                <Card className="p-10 !border-2 !border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="OFFICIAL EMAIL"
                            type="email"
                            placeholder="staff@store.com"
                            icon={<Mail size={20} />}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="!border-2 focus:!border-black"
                            required
                        />
                        <Input
                            label="SECURE PASSWORD"
                            type="password"
                            placeholder="••••••••"
                            icon={<Lock size={20} />}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="!border-2 focus:!border-black"
                            required
                        />

                        <Button
                            type="submit"
                            className="w-full h-16 text-lg font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>LOGIN TO SYSTEM <ArrowRight size={20} /></>}
                        </Button>
                    </form>
                </Card>

                <div className="text-center">
                    <p className="text-xs text-gray-300 font-black uppercase tracking-widest italic">
                        Secured Terminal. Authorized Personnel Only.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StaffLogin;
