import React, { useState } from 'react';
import { Zap, Mail, Lock, Check, Chrome, ArrowRight, Github } from 'lucide-react';

const BackgroundPattern = ({ pattern, className, size = "lg" }) => {
  if (pattern === 'grid') {
    return (
      <div className={`pointer-events-none opacity-[0.03] ${className}`}>
        <div 
          className="w-[800px] h-[800px]" 
          style={{ 
            backgroundImage: `radial-gradient(circle, #4F46E5 1px, transparent 1px)`,
            backgroundSize: size === 'lg' ? '40px 40px' : '20px 20px'
          }}
        />
      </div>
    );
  }
  return null;
};

const Tabs = ({ children, defaultSelectedKey }) => {
  const [selected, setSelected] = useState(defaultSelectedKey);
  return (
    <div className="z-10 w-full">
      {React.Children.map(children, child => 
        React.cloneElement(child, { selected, setSelected })
      )}
    </div>
  );
};

const TabList = ({ items, selected, setSelected, fullWidth }) => {
  return (
    <div className={`flex p-1 bg-slate-100 rounded-xl ${fullWidth ? 'w-full' : ''}`}>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setSelected(item.id)}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            selected === item.id 
              ? 'bg-white text-indigo-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export const LoginPage = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({ email: '', password: '', remember: false });

  const tabs = [
    { id: "signup", label: "Sign up" },
    { id: "login", label: "Log in" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form data:", formData);
    // Simulate login
    if (onLogin) onLogin();
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-white px-4 py-12 md:px-8 md:pt-24 flex items-center justify-center">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
      </div>

      <div className="relative z-10 mx-auto flex w-full flex-col gap-8 sm:max-w-[400px] animate-fade-in-up">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative">
            <BackgroundPattern pattern="grid" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block" />
            <BackgroundPattern pattern="grid" size="md" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden" />
            
            <div className="relative z-10 p-3 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-2xl shadow-xl shadow-indigo-200">
                <Zap size={32} className="text-white" />
            </div>
          </div>
          
          <div className="z-10 flex flex-col gap-2 md:gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              {activeTab === 'login' ? 'Log in to your account' : 'Create an account'}
            </h1>
            <p className="text-slate-500 text-sm md:text-base font-medium">
              {activeTab === 'login' ? 'Welcome back! Please enter your details.' : 'Start your journey with explainable AI.'}
            </p>
          </div>

          <div className="z-10 w-full p-1 bg-slate-100 rounded-xl flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white text-indigo-600 shadow-md' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="z-10 flex flex-col gap-6">
          <div className="flex flex-col gap-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  required
                  placeholder="Enter your email"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-slate-700 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-slate-700 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-md checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                  checked={formData.remember}
                  onChange={(e) => setFormData({...formData, remember: e.target.checked})}
                />
                <Check size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Remember for 30 days</span>
            </label>

            <button type="button" className="text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
              Forgot password
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              type="submit" 
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Sign in
              <ArrowRight size={18} />
            </button>
            
            <div className="relative flex items-center gap-4 py-2">
                <div className="h-px flex-1 bg-slate-100"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
                <div className="h-px flex-1 bg-slate-100"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button type="button" className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-semibold text-sm text-slate-700 active:scale-[0.98]">
                    <Chrome size={18} className="text-slate-500" />
                    Google
                </button>
                <button type="button" className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-semibold text-sm text-slate-700 active:scale-[0.98]">
                    <Github size={18} className="text-slate-500" />
                    GitHub
                </button>
            </div>
          </div>
        </form>

        <div className="z-10 flex justify-center gap-2 text-center pt-2">
          <span className="text-sm font-medium text-slate-500">Don't have an account?</span>
          <button 
            onClick={() => setActiveTab('signup')}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Sign up
          </button>
        </div>
      </div>
      
      {/* Footer info */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Neural Ledger Security v3.0</p>
          <div className="flex gap-1">
              {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-slate-300"></div>)}
          </div>
      </div>
    </section>
  );
};
