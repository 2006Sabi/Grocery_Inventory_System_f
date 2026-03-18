import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { Button, Input, Card } from '../../components/common/UIComponents';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', formData);
      const { token, ...userData } = response.data;
      login(token, userData);
      toast.success(`Welcome back, ${userData.name}!`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-lg animate-fade-in text-center">
        <h1 className="text-4xl font-black text-white tracking-tighter mb-8 italic uppercase">
          SECURE <span className="text-gray-500 underline decoration-gray-800 underline-offset-8">LOGIN</span>
        </h1>
        
        <Card className="!p-10 text-left border-t-8 border-black">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter your email"
              icon={<Mail size={18} />}
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input 
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={18} />}
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Button 
              type="submit" 
              className="w-full flex justify-center items-center py-4 bg-black group"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <span className="flex items-center gap-2">
                  ENTER SYSTEM <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-10 pt-6 border-t border-gray-100 space-y-4">
            <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-[0.15em]">
              New Store Owner?
            </p>
            <Link 
              to="/register" 
              className="w-full flex justify-center items-center py-3 border-2 border-black rounded-xl text-black font-black text-sm hover:bg-black hover:text-white transition-all uppercase tracking-tighter"
            >
              Register your store
            </Link>
          </div>
        </Card>
        
        <p className="mt-8 text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed">
          Authorized personnel only. All access is logged for security audits.
        </p>
      </div>
    </div>
  );
};

export default Login;
