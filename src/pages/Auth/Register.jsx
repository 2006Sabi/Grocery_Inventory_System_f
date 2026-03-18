import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { User, Mail, Lock, Building, Loader2 } from 'lucide-react';
import { Button, Input, Card } from '../../components/common/UIComponents';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    storeName: ''
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
      const response = await api.post('/auth/register', formData);
      const { token, ...userData } = response.data;
      login(token, userData);
      toast.success('Store Registered Successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-lg animate-fade-in text-center">
        <h1 className="text-4xl font-black text-white tracking-tighter mb-8 italic uppercase">
          CLIENT <span className="text-gray-500 underline decoration-gray-800 underline-offset-8">REGISTRATION</span>
        </h1>
        
        <Card className="!p-10 text-left">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8 border-l-4 border-black pl-4 leading-relaxed">
            Register your store as an <span className="text-black underline">ADMIN</span>. Once registered, you can create accounts for your staff.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Store Name"
              name="storeName"
              placeholder="e.g. Modern Supermarket"
              icon={<Building size={18} />}
              value={formData.storeName}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Owner Name"
                name="name"
                placeholder="John Doe"
                icon={<User size={18} />}
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input 
                label="Email Address"
                name="email"
                type="email"
                placeholder="owner@example.com"
                icon={<Mail size={18} />}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <Input 
              label="Secure Password"
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
              className="w-full flex justify-center items-center py-4 bg-black"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'INITIALIZE SYSTEM'}
            </Button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-500 font-medium">
            Already have an account? <Link to="/login" className="text-black font-black hover:underline uppercase tracking-tight">Login Now</Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Register;
