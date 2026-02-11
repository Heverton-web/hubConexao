import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useBrand } from '../contexts/BrandContext';
import { UserPlus, ArrowLeft, CheckCircle, Globe, Briefcase, User, TrendingUp, ShieldCheck, Eye, EyeOff, Database, Shield, Box, Sparkles } from 'lucide-react';
import { seedUsers } from '../lib/seed';
import { Role } from '../types';

export const AuthPage: React.FC = () => {
  const { login, register, loginMock } = useAuth();
  const { t } = useLanguage();
  const { config } = useBrand();
  
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Register State
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cro, setCro] = useState('');
  const [role, setRole] = useState('client');
  
  // Landing Page Invite State
  const [invitedRole, setInvitedRole] = useState<string | null>(null);

  useEffect(() => {
    // Check for role query param to handle invites
    const searchParams = new URLSearchParams(window.location.search);
    const roleParam = searchParams.get('role');
    
    if (roleParam && ['client', 'distributor', 'consultant'].includes(roleParam)) {
      setIsLogin(false);
      setInvitedRole(roleParam);
      setRole(roleParam);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({ name, email, password, whatsapp, role, cro });
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado');
    }
  };

  const handleMockLogin = async (role: Role) => {
      try {
          await loginMock(role);
      } catch (e: any) {
          setError('Erro no login mock: ' + e.message);
      }
  };

  const handleSeed = async () => {
    if (!window.confirm("Isso tentará criar as contas demo no banco de dados REAL. Continuar?")) return;
    setIsSeeding(true);
    try {
        const result = await seedUsers();
        alert("Resultado da criação:\n\n" + result);
    } catch (e: any) {
        alert("Erro ao criar usuários: " + e.message);
    } finally {
        setIsSeeding(false);
    }
  };

  const clearInvite = () => {
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.pushState({path:newUrl},'',newUrl);
    setInvitedRole(null);
    setIsLogin(true);
  };

  const renderLogo = (size: "normal" | "large" = "normal") => (
     <div className="flex items-center gap-3 justify-center mb-6 animate-float">
        {config.logoUrl ? (
             <img src={config.logoUrl} alt="Logo" className={`${size === "large" ? "h-24" : "h-14"} drop-shadow-2xl`} />
        ) : (
            <div className={`${size === "large" ? "w-20 h-20 text-4xl" : "w-14 h-14 text-2xl"} bg-gradient-to-br from-accent to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-2xl shadow-accent/40 ring-4 ring-white/10 backdrop-blur-xl`}>
              {config.appName.substring(0, 2).toUpperCase()}
            </div>
        )}
     </div>
  );

  const renderForm = () => (
    <div className={`w-full max-w-md bg-surface/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden group ${invitedRole ? 'bg-white/90' : ''}`}>
        
        {/* Glow Effect inside card */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl group-hover:bg-accent/30 transition-colors duration-500"></div>

        {!invitedRole && renderLogo()}

        <div className="text-center mb-8 relative z-10">
          {!isLogin && invitedRole ? (
             <div className="animate-fade-in md:hidden"> 
                <h2 className="text-2xl font-bold mb-2 text-main">{t(`landing.${invitedRole}.title`)}</h2>
             </div>
          ) : (
             <>
                <h2 className="text-3xl font-bold mb-2 text-main tracking-tight">{isLogin ? t('auth.login') : t('auth.register')}</h2>
                <p className="text-lg font-medium text-accent">{config.appName}</p>
                <p className="text-muted text-sm mt-3 px-2 leading-relaxed opacity-80">
                   {t('auth.hint')}
                </p>
             </>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center gap-3 animate-slide-up">
             <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
             {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {!isLogin && (
            <div className="group">
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted group-focus-within:text-accent transition-colors">Nome Completo</label>
              <input type="text" required className="w-full p-3 rounded-xl border border-border/50 bg-page/50 text-main focus:bg-surface focus:ring-2 focus:ring-accent/50 focus:border-transparent outline-none transition-all shadow-inner" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}

          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted group-focus-within:text-accent transition-colors">Email</label>
            <input type="email" required className="w-full p-3 rounded-xl border border-border/50 bg-page/50 text-main focus:bg-surface focus:ring-2 focus:ring-accent/50 focus:border-transparent outline-none transition-all shadow-inner" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted group-focus-within:text-accent transition-colors">Senha</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                className="w-full p-3 pr-10 rounded-xl border border-border/50 bg-page/50 text-main focus:bg-surface focus:ring-2 focus:ring-accent/50 focus:border-transparent outline-none transition-all shadow-inner" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-accent focus:outline-none transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="group">
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted group-focus-within:text-accent transition-colors">WhatsApp</label>
                <input type="tel" required className="w-full p-3 rounded-xl border border-border/50 bg-page/50 text-main focus:bg-surface focus:ring-2 focus:ring-accent/50 focus:border-transparent outline-none transition-all shadow-inner" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
              </div>
              
              <div className="grid grid-cols-1 gap-5">
                 {!invitedRole && (
                    <div className="group">
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted group-focus-within:text-accent transition-colors">Tipo de Perfil</label>
                      <select className="w-full p-3 rounded-xl border border-border/50 bg-page/50 text-main focus:bg-surface focus:ring-2 focus:ring-accent/50 focus:border-transparent outline-none transition-all shadow-inner" value={role} onChange={e => setRole(e.target.value)}>
                        <option value="client">Cliente</option>
                        <option value="distributor">Distribuidor</option>
                        <option value="consultant">Consultor</option>
                      </select>
                    </div>
                 )}
                 <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted group-focus-within:text-accent transition-colors">CRO (Opcional)</label>
                    <input type="text" className="w-full p-3 rounded-xl border border-border/50 bg-page/50 text-main focus:bg-surface focus:ring-2 focus:ring-accent/50 focus:border-transparent outline-none transition-all shadow-inner" value={cro} onChange={e => setCro(e.target.value)} />
                 </div>
              </div>
            </>
          )}

          <button type="submit" className="w-full bg-gradient-to-r from-accent to-purple-600 hover:to-accent text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-accent/30 flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-accent/40 active:scale-95 mt-4">
            {!isLogin && invitedRole && <UserPlus size={20} />}
            {isLogin ? 'Entrar na Plataforma' : invitedRole ? 'Confirmar Cadastro' : 'Criar Nova Conta'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm space-y-6 relative z-10">
          {invitedRole ? (
             <button onClick={clearInvite} className="text-muted hover:text-main flex items-center justify-center gap-2 mx-auto transition-colors font-medium group">
               <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar para Login Padrão
             </button>
          ) : (
            <>
                <button onClick={() => setIsLogin(!isLogin)} className="text-muted hover:text-accent font-medium block w-full transition-colors">
                {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
                </button>

                {/* MOCK LOGIN SECTION */}
                <div className="pt-6 border-t border-border/50">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                        <Sparkles size={12} /> Ambiente de Teste (Offline)
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => handleMockLogin('super_admin')} className="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-500/5 hover:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-bold transition-all hover:scale-105 active:scale-95">
                            <Shield size={18} className="mb-1.5" /> Admin
                        </button>
                         <button onClick={() => handleMockLogin('client')} className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold transition-all hover:scale-105 active:scale-95">
                            <User size={18} className="mb-1.5" /> Cliente
                        </button>
                         <button onClick={() => handleMockLogin('distributor')} className="flex flex-col items-center justify-center p-3 rounded-xl bg-orange-500/5 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-xs font-bold transition-all hover:scale-105 active:scale-95">
                            <Box size={18} className="mb-1.5" /> Distribuidor
                        </button>
                         <button onClick={() => handleMockLogin('consultant')} className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all hover:scale-105 active:scale-95">
                            <Briefcase size={18} className="mb-1.5" /> Consultor
                        </button>
                    </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                    <button 
                        onClick={handleSeed}
                        disabled={isSeeding}
                        className="text-[10px] flex items-center justify-center gap-2 mx-auto text-muted hover:text-main transition-colors py-2 px-4 rounded-full border border-transparent hover:border-border/50 hover:bg-page/50"
                    >
                        <Database size={12} />
                        {isSeeding ? 'Criando usuários...' : 'Resetar Banco REAL'}
                    </button>
                </div>
            </>
          )}
        </div>
    </div>
  );

  // --- SCENARIO 1: Standard Login/Register (Centered Card) ---
  if (!invitedRole) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
           {/* Fallback gradient if blobs fail or for extra depth */}
           <div className="absolute inset-0 bg-gradient-to-tr from-page via-page to-surface opacity-50 z-[-2]" />
           {renderForm()}
        </div>
      );
  }

  // --- SCENARIO 2: Landing Page (Split Screen) ---
  const landingConfig: Record<string, { bgClass: string, icon: any, gradient: string }> = {
      'client': {
          bgClass: 'bg-blue-600',
          icon: User,
          gradient: 'from-blue-600 to-indigo-900'
      },
      'distributor': {
          bgClass: 'bg-slate-900',
          icon: Globe,
          gradient: 'from-slate-800 to-black'
      },
      'consultant': {
          bgClass: 'bg-purple-700',
          icon: TrendingUp,
          gradient: 'from-purple-700 to-fuchsia-900'
      }
  };

  const currentTheme = landingConfig[invitedRole] || landingConfig['client'];
  const Icon = currentTheme.icon;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-page">
        
        {/* Left Side - Marketing Content */}
        <div 
            className={`w-full md:w-1/2 p-8 md:p-16 text-white flex flex-col justify-center relative overflow-hidden bg-gradient-to-br ${currentTheme.gradient}`}
        >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            
            {/* Animated Circles */}
            <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-black/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

            <div className="relative z-10 max-w-lg mx-auto md:mx-0">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
                        <Icon size={32} className="text-white drop-shadow-md" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">{config.appName}</h1>
                </div>

                <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight drop-shadow-lg">
                    {t(`landing.${invitedRole}.title`)}
                </h2>
                
                <p className="text-lg md:text-xl text-blue-50 mb-12 leading-relaxed font-light border-l-4 border-white/30 pl-6">
                    {t(`landing.${invitedRole}.desc`)}
                </p>

                <div className="space-y-6">
                    {[1, 2, 3].map((num) => (
                        <div key={num} className="group flex items-center gap-5 bg-white/5 hover:bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-sm transition-all hover:translate-x-2 hover:shadow-lg">
                            <div className="shrink-0 w-10 h-10 rounded-full bg-green-400/20 flex items-center justify-center group-hover:bg-green-400/30 transition-colors">
                                <CheckCircle size={20} className="text-green-300" />
                            </div>
                            <span className="font-medium text-lg">{t(`landing.${invitedRole}.benefit.${num}`)}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-16 flex items-center gap-3 text-sm text-blue-200/80 bg-black/20 w-fit px-4 py-2 rounded-full backdrop-blur-md">
                   <ShieldCheck size={16} />
                   <span className="tracking-wide uppercase font-bold text-xs">Ambiente Seguro & Criptografado</span>
                </div>
            </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-page to-surface opacity-80 z-[-1]" />
            {renderForm()}
        </div>
    </div>
  );
};