import React, { useState, useCallback } from 'react';
import { Zap, Target, Users, Activity, TrendingUp, ShieldCheck, ShieldAlert, RefreshCw, Sparkles, AlertCircle, Fingerprint, Download, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import axios from 'axios';
import Typewriter from './components/Typewriter';
import { LoginPage } from './LoginPage';

const API_BASE = '/api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    Age: 30,
    Income: 500000,
    LoanAmount: 200000,
    CreditScore: 650,
    YearsExperience: 5,
    Gender: 'Male',
    Education: 'Bachelors',
    City: 'Mumbai',
    EmploymentType: 'Salaried',
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSandbox, setIsSandbox] = useState(false);
  const [validationError, setValidationError] = useState('');

  const isSBILoanEligible =
    formData.CreditScore >= 300 &&
    formData.CreditScore <= 400 &&
    formData.Income >= 300000;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'CreditScore' || name === 'Age' || name === 'YearsExperience'
        ? parseInt(value) || 0
        : name === 'Income' || name === 'LoanAmount'
          ? parseFloat(value) || 0
          : value,
    }));
    setValidationError('');
  };

  const validate = () => {
    if (formData.Age < 18 || formData.Age > 100) return 'Age must be between 18 and 100';
    if (formData.Income <= 0) return 'Income must be a positive value';
    if (formData.LoanAmount <= 0) return 'Loan amount must be a positive value';
    if (formData.CreditScore < 300 || formData.CreditScore > 850) return 'Credit score must be 300-850';
    return '';
  };

  const triggerAnalysis = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.post(`${API_BASE}/predict`, data);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const vErr = validate();
    if (vErr) { setValidationError(vErr); return; }
    triggerAnalysis(formData);
  };

  const toggleSandbox = () => {
    setIsSandbox((prev) => !prev);
    if (!isSandbox) {
      triggerAnalysis(formData);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await fetch(`${API_BASE}/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicant_data: formData, prediction_result: result }),
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Credit_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Report generation failed:', err);
    }
  };

  const renderGauge = (prob) => {
    const gradientId = 'gaugeGradient';
    return (
      <div className="relative w-48 h-24 mx-auto overflow-hidden">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22C55E" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          <path d="M10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#E2E8F0" strokeWidth="8" strokeLinecap="round" />
          <path
            d="M10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${prob * 125.6} 125.6`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">{(prob * 100).toFixed(1)}%</span>
          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Confidence</span>
        </div>
      </div>
    );
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] text-slate-800 selection:bg-indigo-500/20 overflow-hidden">

      {/* SIDEBAR */}
      <aside className="w-full lg:w-80 bg-[#F1F5F9] border-r border-slate-200/80 flex flex-col sticky top-0 h-screen overflow-y-auto custom-scrollbar z-20">
        <div className="p-6 border-b border-slate-200/60 bg-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-xl shadow-md shrink-0">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <div className="leading-tight tracking-tight">
                <span className="block text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">Explainable AI</span>
                <span className="block text-base lg:text-xl font-semibold text-slate-700 mt-0.5">Framework for</span>
                <span className="block text-lg lg:text-2xl font-bold text-slate-900 mt-0.5">Credit Risk Prediction</span>
              </div>
              <div className="h-0.5 w-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full mt-2 mb-2"></div>
              <div className="mt-3 flex items-center gap-3 bg-white border border-slate-100/80 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 relative overflow-hidden">
                <div className="p-[2px] rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shrink-0">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                    <Users size={16} className="text-indigo-500" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#9CA3AF] mb-0.5">Developed by</p>
                  <p className="text-[14px] font-semibold text-[#0F172A] leading-snug">Bibhu &amp; Soumyashree</p>
                </div>
                <div className="absolute right-0 top-2 bottom-2 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full opacity-60"></div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Precision Engine Active</p>
          </div>
        </div>

        <div className="p-6 space-y-6 flex-1">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Target size={14} className="text-indigo-500" /> Dossier
            </h2>
            <button
              onClick={toggleSandbox}
              className={`px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase transition-all border cursor-pointer ${isSandbox ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600'}`}
            >
               {isSandbox ? 'Sandbox' : 'Direct Mode'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
             <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider ml-1">Employment Context</label>
                    <select name="EmploymentType" value={formData.EmploymentType} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium text-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none">
                      <option value="Salaried">Salaried Professional</option>
                      <option value="Self-Employed">Self Employed</option>
                      <option value="Unemployed">Seeking Opportunity</option>
                    </select>
                </div>

                {formData.EmploymentType === 'Salaried' && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider ml-1">Tenure (Years)</label>
                    <input type="number" name="YearsExperience" value={formData.YearsExperience} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm text-indigo-600 font-semibold focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" />
                  </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider ml-1">Education Level</label>
                    <select name="Education" value={formData.Education} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium text-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none">
                      <option value="High School">School Level (Below Higher Secondary)</option>
                      <option value="High School">Higher Secondary (12th Grade)</option>
                      <option value="Bachelors">Undergraduate Degree</option>
                      <option value="Masters">Postgraduate Degree</option>
                      <option value="PhD">Doctorate / Research</option>
                    </select>
                </div>

                <div className="py-1 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  <Users size={14} className="text-slate-300" />
                  <div className="h-px flex-1 bg-slate-200"></div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Risk Profile Score</label>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">{formData.CreditScore}</span>
                  </div>
                  <input type="range" min="300" max="850" name="CreditScore" value={formData.CreditScore} onChange={handleInputChange} className="w-full cursor-pointer" />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
                    <span>300</span>
                    <span>850</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider ml-1">Annual Revenue (₹)</label>
                  <input type="number" name="Income" value={formData.Income} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm text-emerald-600 font-semibold focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider ml-1">Requested Principal (₹)</label>
                  <input type="number" name="LoanAmount" value={formData.LoanAmount} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-700 font-semibold focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" />
                  {isSBILoanEligible && formData.LoanAmount > 100000 && (
                    <p className="text-[11px] text-amber-600 font-semibold mt-1.5 flex items-center gap-1.5">
                      <Sparkles size={12} /> Limited to ₹1L per SBI Protocol
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider ml-1">Age Factor</label>
                  <input type="number" name="Age" value={formData.Age} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold text-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" />
                </div>
             </div>

             {validationError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 flex items-center gap-3">
                  <AlertCircle size={16} className="shrink-0 text-red-500" />
                  {validationError}
                </div>
              )}

             {!isSandbox && (
                <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60">
                  {loading ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                  {loading ? 'Calculating...' : 'Generate Consensus'}
                </button>
              )}
          </form>
        </div>

        <div className="p-6 bg-white/50 border-t border-slate-200/60">
           <div className="flex flex-col items-center gap-1.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Platinum Consensus v3.0
              </p>
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 bg-[#F8FAFC] flex flex-col h-screen overflow-hidden">

        {/* HEADER BAR */}
        <header className="h-14 px-8 border-b border-slate-200/60 flex justify-between items-center bg-white/80 backdrop-blur-sm z-10 shrink-0">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-red-500 px-3 py-1 bg-red-50 rounded-lg border border-red-100">
                 <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-bold uppercase tracking-wider">Live Stream</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-600 px-3 py-1 bg-indigo-50 rounded-lg border border-indigo-100">
                 <Activity size={12} />
                 <span className="text-[10px] font-bold uppercase tracking-wider">Consensus Mode</span>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">42ms Latency</span>
              <div className="w-px h-4 bg-slate-200"></div>
              <div className="flex items-center gap-1.5 text-slate-600">
                 <ShieldCheck size={14} className="text-emerald-500" />
                 <span className="text-[10px] font-bold uppercase tracking-wider">Secured</span>
              </div>
           </div>
        </header>

        <div className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto custom-scrollbar-wide bg-[#F8FAFC]">

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Decision */}
            <div className="bg-white border border-slate-100 p-6 rounded-2xl flex flex-col justify-between card-hover relative overflow-hidden group" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <div className="flex justify-between items-start mb-5 relative z-10">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Risk Verdict</p>
                <div className={`p-2.5 rounded-xl ${!result ? 'bg-slate-100 text-slate-400' : result.prediction === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                   {result?.prediction === 'Approved' ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
                </div>
              </div>
              <div className="relative z-10">
                <h3 className={`text-3xl font-extrabold tracking-tight ${!result ? 'text-slate-300' : result.prediction === 'Approved' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {result ? result.prediction.toUpperCase() : 'PENDING'}
                </h3>
                <p className="text-xs font-medium text-slate-400 mt-1.5">
                   {result ? (result.prediction === 'Approved' ? 'Verified Consensus Approval' : 'Consensus Threshold Not Met') : 'Awaiting analysis...'}
                </p>
              </div>
            </div>

            {/* Card 2: Confidence Gauge */}
            <div className="bg-white border border-slate-100 p-6 rounded-2xl flex flex-col items-center justify-center card-hover relative" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
               <div className="absolute top-0 left-0 p-4">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Confidence Arc</p>
               </div>
               {renderGauge(result ? result.approval_probability : 0)}
               <div className="mt-1 text-[10px] font-semibold text-indigo-500 tracking-widest uppercase opacity-60">Probability Density</div>
            </div>

            {/* Card 3: Lending Grade */}
            <div className="bg-white border border-slate-100 p-6 rounded-2xl flex flex-col justify-between card-hover relative" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <div className="flex justify-between items-start mb-4">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Lending Grade</p>
                <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600">
                   <Target size={24} />
                </div>
              </div>
              <div>
                <h3 className={`text-4xl font-extrabold tracking-tight mb-1.5 ${
                  !result ? 'text-slate-300' :
                  result.approval_probability > 0.8 ? 'text-emerald-600' :
                  result.approval_probability > 0.5 ? 'text-indigo-600' : 'text-red-500'
                }`}>
                  {result ? (
                    result.approval_probability > 0.8 ? 'EXL' :
                    result.approval_probability > 0.5 ? 'MOD' : 'OPT'
                  ) : 'N/A'}
                </h3>
                <div className="flex items-center gap-2">
                   <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${
                        !result ? 'w-0' :
                        result.approval_probability > 0.8 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 w-full' :
                        result.approval_probability > 0.5 ? 'bg-gradient-to-r from-indigo-400 to-indigo-500 w-2/3' : 'bg-gradient-to-r from-red-400 to-red-500 w-1/3'
                      }`}></div>
                   </div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase">
                     {result ? (result.approval_probability > 0.8 ? 'T1-Premium' : result.approval_probability > 0.5 ? 'T2-Stable' : 'T3-Review') : ''}
                   </span>
                </div>
              </div>
            </div>

            {/* Card 4: SBI Eligibility */}
            <div className={`p-6 rounded-2xl flex flex-col justify-between card-hover transition-all duration-500 border relative overflow-hidden ${isSBILoanEligible ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-300 text-white' : 'bg-white border-slate-100'}`} style={!isSBILoanEligible ? { boxShadow: '0 4px 20px rgba(0,0,0,0.05)' } : { boxShadow: '0 8px 30px rgba(245,158,11,0.3)' }}>
              <div className="flex justify-between items-start relative z-10">
                <p className={`text-[11px] font-semibold uppercase tracking-wider ${isSBILoanEligible ? 'text-white/80' : 'text-slate-400'}`}>Special Credit Offer</p>
                <div className={`p-2.5 rounded-xl ${isSBILoanEligible ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                   <Sparkles size={24} />
                </div>
              </div>
              <div className="relative z-10 mt-4">
                <p className={`text-[10px] font-semibold uppercase tracking-wider leading-none mb-1 ${isSBILoanEligible ? 'text-white/70' : 'text-slate-400'}`}>SBI Elite Protocol</p>
                <h3 className={`text-3xl font-extrabold tracking-tight ${isSBILoanEligible ? 'text-white' : 'text-slate-300'}`}>
                  {isSBILoanEligible ? '₹1,00,000' : 'INELIGIBLE'}
                </h3>
                {isSBILoanEligible && (
                  <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
                    <Activity size={10}/> Approved for Disbursement
                  </div>
                )}
              </div>
            </div>
           </div>

          {/* EXPORT BUTTON */}
          {result && (
            <div className="flex justify-end">
              <button
                onClick={handleDownloadReport}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.97] flex items-center gap-2 cursor-pointer"
              >
                <Download size={14} />
                Export PDF Report
              </button>
            </div>
          )}

          {/* AWAITING STATE */}
          {!result && !error && (
            <div className="h-[calc(100vh-320px)] flex flex-col items-center justify-center text-center p-12 bg-white border border-slate-200 border-dashed rounded-2xl">
               <div className="p-10 bg-indigo-50 rounded-full mb-8 text-indigo-400">
                  <Users size={64} />
               </div>
               <h2 className="text-3xl font-bold text-slate-900 mb-4">Awaiting Cognitive Input</h2>
               <p className="max-w-md text-slate-400 text-base leading-relaxed">Adjust applicant profiles in the control panel to start neural consensus. The distributed agent network is in standby mode.</p>
            </div>
          )}

          {/* ERROR STATE */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-12 rounded-2xl text-center">
               <ShieldAlert size={64} className="mx-auto text-red-400 mb-6" />
               <h2 className="text-2xl font-bold text-slate-900 mb-3">Neural Sync Interrupted</h2>
               <p className="text-red-500/80 font-medium text-sm mb-8 max-w-sm mx-auto">{error}</p>
               <button onClick={() => triggerAnalysis(formData)} className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2.5 mx-auto cursor-pointer">
                 <RefreshCw size={14} /> Reset Neural Link
               </button>
            </div>
          )}

          {/* RESULTS */}
          {result && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

              {/* AI SUMMARY */}
              <div className="lg:col-span-8 bg-white border border-slate-100 p-8 rounded-2xl relative overflow-hidden animate-fade-in-up" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                       <Zap size={18} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">AI Summary</h3>
                 </div>
                 <div className="min-h-[140px] text-lg font-medium text-slate-600 leading-relaxed pr-10 pb-3 border-l-4 border-indigo-500 pl-6">
                    <Typewriter text={result.ai_insights.summary} />
                 </div>
              </div>

              {/* CLIENT SNAPSHOT */}
              <div className="lg:col-span-4 bg-white border border-slate-100 p-8 rounded-2xl animate-fade-in-up flex flex-col justify-between" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)', animationDelay: '0.1s' }}>
                 <div>
                    <h3 className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider flex items-center gap-2">
                      <Target size={14} className="text-indigo-500" /> Client Snapshot
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                       {[
                         {label: 'Age Group', val: `${formData.Age} Yrs`, icon: Activity},
                         {label: 'Income Index', val: `₹${(formData.Income/1000).toFixed(0)}k/Yr`, icon: TrendingUp},
                         {label: 'Risk Score', val: formData.CreditScore, icon: ShieldCheck},
                         {label: 'Education', val: formData.Education, icon: Target}
                       ].map((item, idx) => (
                         <div key={idx} className="flex justify-between items-center group">
                            <div className="flex items-center gap-2.5">
                               <item.icon size={13} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                               <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{item.label}</span>
                            </div>
                            <span className="text-sm font-bold text-slate-800">{item.val}</span>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center">
                    <div className="text-[10px] font-semibold text-indigo-500 tracking-widest uppercase mb-2">Stability Verified</div>
                    <div className="flex gap-1.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '0.15s' }}></div>
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                 </div>
              </div>

              {/* SHAP CHART */}
              <div className="lg:col-span-12 bg-white border border-slate-100 p-8 rounded-2xl animate-fade-in-up" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)', animationDelay: '0.2s' }}>
                 <div className="flex justify-between items-end mb-10">
                   <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2.5 mb-1">
                        <BarChart3 size={16} className="text-indigo-500" /> Feature Power Spectrum
                      </h3>
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider ml-7">SHAP Feature Contribution</p>
                   </div>
                   <div className="flex gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span className="flex items-center gap-2 border-b-2 border-emerald-500 pb-1 px-2">Positive Driver</span>
                      <span className="flex items-center gap-2 border-b-2 border-red-400 pb-1 px-2">Risk Factor</span>
                   </div>
                 </div>
                 <div className="h-[420px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.explanation.features.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))} layout="vertical" margin={{ left: 30, right: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                        <XAxis type="number" stroke="#94A3B8" fontSize={11} axisLine={false} tickLine={false} />
                        <YAxis dataKey="feature" type="category" stroke="#64748B" width={150} tickFormatter={(v) => v.replace(/([A-Z])/g, ' $1').trim().toUpperCase()} fontSize={11} axisLine={false} tickLine={false} fontWeight="600" />
                        <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                        <ReferenceLine x={0} stroke="#CBD5E1" strokeWidth={2} />
                        <Bar dataKey="impact" radius={[0, 8, 8, 0]} barSize={22}>
                          {result.explanation.features.map((entry, index) => (
                            <Cell key={index} fill={entry.impact > 0 ? '#22C55E' : '#EF4444'} fillOpacity={0.85} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* BOTTOM PANELS */}
              <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

                {/* AGENT VOTES */}
                <div className="bg-white border border-slate-100 p-8 rounded-2xl animate-fade-in-up h-full" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)', animationDelay: '0.3s' }}>
                   <div className="flex justify-between items-center mb-8">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Users size={16} className="text-indigo-500" /> Agent Jury
                      </h3>
                      <div className="px-3 py-1 bg-indigo-50 rounded-lg">
                         <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{result.agent_votes.length} Agents</span>
                      </div>
                   </div>
                   <div className="space-y-4">
                      {result.agent_votes.map((agent, i) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-indigo-200 transition-all duration-300 hover:bg-indigo-50/30">
                           <div className="flex justify-between items-center mb-3">
                              <span className="text-xs font-semibold text-slate-500">{agent.name}</span>
                              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${agent.vote === 'Approve' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                 {agent.vote}
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="flex-1 h-2 bg-slate-200/80 rounded-full overflow-hidden">
                                 <div className={`h-full rounded-full transition-all duration-1000 ${agent.vote === 'Approve' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`} style={{ width: `${agent.prob * 100}%` }}></div>
                              </div>
                              <span className="text-sm font-bold text-slate-700 w-12 text-right">{(agent.prob * 100).toFixed(0)}%</span>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* STRATEGIC OPTIMIZATION */}
                <div className="bg-white border border-slate-100 p-8 rounded-2xl animate-fade-in-up flex flex-col h-full" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)', animationDelay: '0.4s' }}>
                   <h3 className="text-sm font-bold text-slate-900 mb-8 uppercase tracking-wider flex items-center gap-2">
                     <RefreshCw size={16} className="text-amber-500" /> Strategic Optimization
                   </h3>
                   <div className="flex-1 space-y-4 overflow-y-auto max-h-[280px] mb-6 custom-scrollbar pr-3">
                     {result.ai_insights.mitigation_tips.map((tip, i) => (
                        <div key={i} className="flex gap-4 items-start bg-slate-50/80 p-4 rounded-xl border border-slate-100 hover:bg-amber-50/40 hover:border-amber-200 transition-colors group">
                           <div className="mt-1.5 h-2 w-2 rounded-full bg-amber-400 group-hover:scale-150 transition-transform shrink-0"></div>
                           <p className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors leading-relaxed">{tip}</p>
                        </div>
                     ))}
                   </div>

                   <div className="mt-auto pt-6 border-t border-slate-100">
                      <div className="flex justify-between items-center mb-4">
                         <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Sensitivity Mapping</div>
                         <Fingerprint size={14} className="text-slate-300" />
                      </div>
                      <div className="aspect-[21/9] w-full bg-white rounded-xl overflow-hidden border border-slate-200 relative" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)' }}>
                         <div className="grid grid-cols-10 h-full w-full">
                            {result.advanced_analytics.sensitivity_matrix.map((row, i) => row.map((cell, j) => (
                               <div key={`${i}-${j}`} className="group relative cursor-pointer" style={{ backgroundColor: cell.prob > 0.6 ? `rgba(34, 197, 94, ${0.15 + cell.prob * 0.55})` : `rgba(239, 68, 68, ${0.15 + (1 - cell.prob) * 0.4})` }}>
                                 <div className="opacity-0 group-hover:opacity-100 absolute inset-0 z-10 bg-white/70 backdrop-blur-sm transition-opacity flex items-center justify-center text-[8px] font-bold text-slate-700 pointer-events-none">{(cell.prob * 100).toFixed(0)}%</div>
                               </div>
                            )))}
                         </div>
                      </div>
                      <div className="flex justify-between text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-2.5 mx-0.5">
                         <span>Low Threshold</span>
                         <span>Decision Surface</span>
                         <span>High Fidelity</span>
                      </div>
                   </div>
                </div>
              </div>

            </div>
          )}

           {/* FOOTER */}
           <footer className="pt-12 pb-8 border-t border-slate-100 text-center opacity-80">
               <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2">Neural Ledger Consensus Framework</p>
               <div className="flex flex-wrap justify-center gap-3 text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider select-none mb-4">
                 <span>Ensemble 3.0</span>
                 <span>&middot;</span>
                 <span>Platinum Dashboard</span>
                 <span>&middot;</span>
                 <span>XAI Engine v2.4</span>
               </div>
                <div className="inline-flex items-center gap-3 bg-white border border-slate-100/80 rounded-2xl px-4 py-3 shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 relative overflow-hidden">
                  <div className="p-[2px] rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shrink-0">
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                      <Users size={16} className="text-indigo-500" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#9CA3AF] mb-0.5">Developed by</p>
                    <p className="text-[14px] font-semibold text-[#0F172A] leading-snug">Bibhu &amp; Soumyashree</p>
                  </div>
                  <div className="absolute right-0 top-2 bottom-2 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full opacity-60"></div>
                </div>
           </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
