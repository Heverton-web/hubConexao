import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useBrand } from '../contexts/BrandContext';
import { UserPlus, ArrowLeft, Eye, EyeOff, Shield, Box, Sparkles, Info, Briefcase, User, Database, AlertTriangle, ChevronRight } from 'lucide-react';
import { seedUsers } from '../lib/seed';
import { Role } from '../types';
import { SqlSetupModal } from '../components/SqlSetupModal';

export const AuthPage: React.FC = () => {
  const { login, register, loginMock, isDbMissing } = useAuth();
  const { t } = useLanguage();
  const { config } = useBrand();
  
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [showSqlSetup, setShowSqlSetup] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cro, setCro] = useState('');
  const [role, setRole] = useState('client');
  
  const [invitedRole, setInvitedRole] = useState<string | null>(null);

  useEffect(() => {
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

    if (!isLogin) {
        const demoEmails = ['admin@demo.com', 'client@demo.com', 'distributor@demo.com', 'consultant@demo.com'];
        if (demoEmails.includes(email.trim().toLowerCase())) {
            setError('Este e-mail é reservado para demonstração. Utilize os botões de "Ambiente de Teste".');
            return;
        }
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({ name, email, password, whatsapp, role, cro });
      }
    } catch (err: any) {
      let msg = err.message || 'Erro inesperado';
      if (msg === 'Invalid login credentials') msg = 'Email ou senha incorretos.';
      if (msg.includes('already registered')) msg = 'Este e-mail já está cadastrado.';
      if (msg === 'MISSING_DB_SETUP' || msg.includes('relation "public.profiles" does not exist')) {
          msg = 'Tabelas do banco de dados não encontradas.';
          setShowSqlSetup(true);
      }
      setError(msg);
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
        alert(result);
    } catch (e: any) {
        alert("Erro: " + e.message);
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
     <div className="flex items-center gap-3 justify-center mb-8 animate-float">
        {config.logoUrl ? (
             <img src={config.logoUrl} alt="Logo" className={`${size === "large" ? "h-28" : "h-16"} drop-shadow-[0_0_25px_rgba(255,255,255,0.3)] transition-all duration-500 hover:scale-105`} />
        ) : (
            <div className={`${size === "large" ? "w-24 h-24 text-5xl" : "w-16 h-16 text-3xl"} bg-gradient-to-br from-accent via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-2xl shadow-accent/50 ring-4 ring-white/10 backdrop-blur-xl transition-transform duration-700 hover:rotate-12`}>
              {config.appName.substring(0, 2).toUpperCase()}
            </div>
        )}
     </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative overflow-hidden">
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-page z-[-2]"></div>
      <div className="absolute top-0 left-0 w-full h-full z-[-1] overflow-hidden">
          <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-accent/20 rounded-full blur-[100px] animate-blob"></div>
          <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full opacity-20 animate-pulse-slow"></div>
      </div>

      <div className={`w-full max-w-[480px] bg-surface/40 dark:bg-black/40 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/10 relative overflow-hidden group transition-all duration-500 hover:shadow-accent/10 ${invitedRole ? 'bg-white/90 dark:bg-black/80' : ''}`}>
        
        {/* Top Glow Border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"></div>

        {!invitedRole && renderLogo()}

        <div className="text-center mb-8 relative z-10">
          {!isLogin && invitedRole ? (
             <div className="animate-fade-in md:hidden"> 
                <h2 className="text-2xl font-bold mb-2 text-main">{t(`landing.${invitedRole}.title`)}</h2>
             </div>
          ) : (
             <>
                <h2 className="text-3xl font-bold mb-3 text-main tracking-tight">{isLogin ? t('auth.login') : t('auth.register')}</h2>
                <p className="text-lg font-medium bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">{config.appName}</p>
             </>
          )}
        </div>
        
        {/* Error & Info Banners */}
        <div className="space-y-4 mb-6 relative z-10">
            {isDbMissing && (
                <button 
                    onClick={() => setShowSqlSetup(true)}
                    className="w-full bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-left hover:bg-red-500/20 transition-all group/alert hover:scale-[1.02]"
                >
                    <div className="p-2 bg-red-500/20 rounded-lg text-red-500 shrink-0 animate-pulse">
                        <Database size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-red-500 uppercase tracking-wide">Banco Incompleto</p>
                        <p className="text-[10px] text-muted">Clique para corrigir e liberar o acesso.</p>
                    </div>
                    <AlertTriangle size={16} className="ml-auto text-red-500/50" />
                </button>
            )}
            
            {!isLogin && !invitedRole && !isDbMissing && (
                <div className="bg-accent/5 border border-accent/10 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2 text-accent font-bold text-xs uppercase tracking-wider">
                        <Info size={14} /> Contas Demo
                    </div>
                    <p className="text-muted text-xs leading-relaxed">
                        {t('auth.hint')}
                    </p>
                </div>
            )}

            {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex flex-col gap-2 animate-slide-up">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                    <span className="leading-snug">{error}</span>
                </div>
                {error.includes('Tabelas') && (
                    <button onClick={() => setShowSqlSetup(true)} className="text-xs font-bold underline text-left mt-1 hover:text-red-500">
                        Resolver Agora
                    </button>
                )}
            </div>
            )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {!isLogin && (
            <div className="group">
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted pl-1">Nome Completo</label>
              <input type="text" required className="w-full p-4 rounded-xl border border-white/10 bg-black/5 dark:bg-white/5 text-main focus:bg-surface focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all shadow-inner hover:bg-black/10 dark:hover:bg-white/10" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}

          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted pl-1">Email</label>
            <input type="email" required className="w-full p-4 rounded-xl border border-white/10 bg-black/5 dark:bg-white/5 text-main focus:bg-surface focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all shadow-inner hover:bg-black/10 dark:hover:bg-white/10" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted pl-1">Senha</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                className="w-full p-4 pr-12 rounded-xl border border-white/10 bg-black/5 dark:bg-white/5 text-main focus:bg-surface focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all shadow-inner hover:bg-black/10 dark:hover:bg-white/10" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-accent focus:outline-none transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="group">
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted pl-1">WhatsApp</label>
                <input type="tel" required className="w-full p-4 rounded-xl border border-white/10 bg-black/5 dark:bg-white/5 text-main focus:bg-surface focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all shadow-inner hover:bg-black/10 dark:hover:bg-white/10" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
              </div>
              
              <div className="grid grid-cols-1 gap-5">
                 {!invitedRole && (
                    <div className="group">
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted pl-1">Tipo de Perfil</label>
                      <select className="w-full p-4 rounded-xl border border-white/10 bg-black/5 dark:bg-white/5 text-main focus:bg-surface focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all shadow-inner hover:bg-black/10 dark:hover:bg-white/10" value={role} onChange={e => setRole(e.target.value)}>
                        <option value="client">Cliente</option>
                        <option value="distributor">Distribuidor</option>
                        <option value="consultant">Consultor</option>
                      </select>
                    </div>
                 )}
                 <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted pl-1">CRO (Opcional)</label>
                    <input type="text" className="w-full p-4 rounded-xl border border-white/10 bg-black/5 dark:bg-white/5 text-main focus:bg-surface focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all shadow-inner hover:bg-black/10 dark:hover:bg-white/10" value={cro} onChange={e => setCro(e.target.value)} />
                 </div>
              </div>
            </>
          )}

          <button type="submit" className="w-full relative overflow-hidden bg-accent hover:bg-accent/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-accent/30 flex items-center justify-center gap-2 group/btn mt-6 hover:scale-[1.02] active:scale-95">
             <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out rounded-xl"></div>
             <span className="relative z-10 flex items-center gap-2">
                {!isLogin && invitedRole && <UserPlus size={20} />}
                {isLogin ? 'Entrar na Plataforma' : invitedRole ? 'Confirmar Cadastro' : 'Criar Nova Conta'}
                <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
             </span>
          </button>
        </form>

        <div className="mt-8 text-center text-sm space-y-8 relative z-10">
          {invitedRole ? (
             <button onClick={clearInvite} className="text-muted hover:text-main flex items-center justify-center gap-2 mx-auto transition-colors font-medium group">
               <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar para Login Padrão
             </button>
          ) : (
            <>
                <button onClick={() => setIsLogin(!isLogin)} className="text-muted hover:text-accent font-medium block w-full transition-colors underline decoration-transparent hover:decoration-accent underline-offset-4">
                {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
                </button>

                {/* Modern Mock Login */}
                <div className="pt-6 border-t border-white/10">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-4 flex items-center justify-center gap-2 opacity-70">
                        <Sparkles size={12} /> Ambiente de Teste
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => handleMockLogin('super_admin')} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-500/5 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-bold transition-all hover:scale-105 active:scale-95 group">
                            <Shield size={20} className="mb-2 group-hover:scale-110 transition-transform" /> Admin
                        </button>
                         <button onClick={() => handleMockLogin('client')} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-500/5 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold transition-all hover:scale-105 active:scale-95 group">
                            <User size={20} className="mb-2 group-hover:scale-110 transition-transform" /> Cliente
                        </button>
                         <button onClick={() => handleMockLogin('distributor')} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-orange-500/5 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-xs font-bold transition-all hover:scale-105 active:scale-95 group">
                            <Box size={20} className="mb-2 group-hover:scale-110 transition-transform" /> Distribuidor
                        </button>
                         <button onClick={() => handleMockLogin('consultant')} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-500/5 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all hover:scale-105 active:scale-95 group">
                            <Briefcase size={20} className="mb-2 group-hover:scale-110 transition-transform" /> Consultor
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    <button 
                        onClick={handleSeed}
                        disabled={isSeeding}
                        className="text-[10px] flex items-center justify-center gap-2 text-muted/50 hover:text-main transition-colors py-2 px-4 rounded-full mx-auto"
                    >
                        <Database size={12} />
                        {isSeeding ? 'Criando usuários...' : 'Resetar Banco REAL'}
                    </button>
                </div>
            </>
          )}
        </div>
        
        {showSqlSetup && <SqlSetupModal onClose={() => setShowSqlSetup(false)} />}
    </div>
  );
};