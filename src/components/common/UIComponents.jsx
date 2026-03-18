import React from 'react';

// Card Component
export const Card = ({ children, title, subtitle, className = '', rightElement = null }) => (
  <div className={`premium-card p-6 ${className}`}>
    {(title || rightElement) && (
      <div className="flex justify-between items-start mb-6">
        <div>
          {title && <h3 className="text-lg font-bold text-black">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {rightElement}
      </div>
    )}
    {children}
  </div>
);

// Button Component
export const Button = ({ children, variant = 'primary', loading = false, className = '', ...props }) => {
  const variants = {
    primary: 'btn-black',
    secondary: 'bg-white border-2 border-black text-black hover:bg-gray-50 px-6 py-2.5 rounded-xl transition-all active:scale-[0.98] font-bold uppercase tracking-wider',
    outline: 'btn-outline',
    ghost: 'hover:bg-gray-100 text-black px-4 py-2 rounded-xl transition-all',
    danger: 'bg-red-500 text-white px-6 py-2.5 rounded-xl hover:bg-red-600 transition-all active:scale-[0.98]',
  };

  return (
    <button 
      className={`${variants[variant] || variants.primary} ${className} ${loading ? 'opacity-70 cursor-not-allowed' : ''} flex items-center justify-center gap-2`} 
      disabled={loading}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      )}
      {children}
    </button>
  );
};

// Input Component
export const Input = ({ label, error, className = '', ...props }) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>}
    <input 
      className={`input-field ${error ? 'border-red-500 focus:border-red-500' : ''}`}
      {...props}
    />
    {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
  </div>
);

// Select Component
export const Select = ({ label, options, error, className = '', ...props }) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>}
    <select 
      className={`input-field appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em] ${error ? 'border-red-500 focus:border-red-500' : ''}`}
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
      {...props}
    >
      <option value="">Select {label}</option>
      {options.map(opt => (
        <option key={opt.id || opt._id || opt} value={opt.id || opt._id || opt}>
          {opt.name || opt.label || opt}
        </option>
      ))}
    </select>
    {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
  </div>
);

// Loader Component
export const Loader = ({ fullPage = false }) => {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return <div className="p-8 flex items-center justify-center">{spinner}</div>;
};

// Modal Component
export const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative z-10 animate-slide-up overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-black transition-colors">
            <svg size={20} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
