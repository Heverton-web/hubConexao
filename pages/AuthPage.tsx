import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useBrand } from '../contexts/BrandContext';
import { UserPlus, ArrowLeft, Eye, EyeOff, Shield, Box, Sparkles, Info, Briefcase, User, Database, AlertTriangle, ChevronRight } from 'lucide-react';
import { seedUsers } from '../lib/seed';
import { Role } from '../types';
import { SqlSetupModal } from '../components/SqlSetupModal';
import { useToast } from '../contexts/ToastContext';

export const AuthPage: React.FC = () => {
  const { login, register, loginMock, isDbMissing } = useAuth();
  const { t } = useLanguage();
  const { config } = useBrand();
  const { addToast } = useToast();

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

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Mouse tracker for the 2026 Aura Glass effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && ['client', 'distributor', 'consultant'].includes(roleParam)) {
      setIsLogin(false);
      setInvitedRole(roleParam);
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin) {
      const demoEmails = ['admin@demo.com', 'client@demo.com', 'distributor@demo.com', 'consultant@demo.com'];
      if (demoEmails.includes(email.trim().toLowerCase())) {
        setError(t('auth.error.demo_email'));
        return;
      }
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({ name, email, password, whatsapp, role, cro });
        addToast(t('auth.success.register'), 'success', 6000);
      }
    } catch (err: any) {
      let msg = err.message || 'Erro inesperado';
      if (msg === 'Invalid login credentials') msg = t('auth.error.invalid_credentials');
      if (msg.includes('already registered')) msg = t('auth.error.email_registered');
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
      addToast(result, 'success');
    } catch (e: any) {
      addToast('Erro: ' + e.message, 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const clearInvite = () => {
    navigate('/login', { replace: true });
    setInvitedRole(null);
    setIsLogin(true);
  };

  const renderLogo = (size: "normal" | "large" = "normal") => (
    <div className="flex items-center gap-3 justify-center mb-6 animate-float-soft">
      {config.logoUrl ? (
        <img src={config.logoUrl} alt="Logo" className={`${size === "large" ? "h-24" : "h-14"} drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-500`} />
      ) : (
        <div className={`${size === "large" ? "w-20 h-20 text-4xl" : "w-12 h-12 text-2xl"} bg-neutral-900 border border-white/10 rounded-xl flex items-center justify-center text-white font-bold shadow-2xl backdrop-blur-xl`}>
          {config.appName.substring(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden bg-[#08090B]">

      {/* 2026 Aura Mesh Background */}
      <div className="noise-overlay"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-accent/10 blur-[120px] animate-aura-drift"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-aura-lume/5 blur-[100px] animate-aura-drift" style={{ animationDelay: '-5s' }}></div>

      <div className={`w-full max-w-[440px] aura-glass p-10 rounded-[2.5rem] animate-reveal`}>

        {!invitedRole && renderLogo()}

        <div className="text-center mb-8 relative z-10 w-full">
          {!isLogin && invitedRole ? (
            <div className="animate-reveal">
              <h2 className="text-2xl font-bold mb-2 text-white heading-aura">{t(`landing.${invitedRole}.title`)}</h2>
            </div>
          ) : (
            <div className="space-y-1">
              <h2 className="text-4xl heading-aura text-white">{isLogin ? t('auth.login') : t('auth.register')}</h2>
              <p className="text-[10px] uppercase tracking-[0.4em] text-aura-phantom font-semibold">{config.appName}</p>
            </div>
          )}
        </div>

        {/* Status Banners */}
        <div className="space-y-3 mb-8 relative z-10">
          {isDbMissing && (
            <button
              onClick={() => setShowSqlSetup(true)}
              className="w-full bg-error/10 border border-error/20 rounded-2xl p-4 flex items-center gap-3 text-left transition-all hover:bg-error/15"
            >
              <div className="p-2 bg-error/20 rounded-xl text-error shrink-0">
                <Database size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-error uppercase tracking-wider">{t('auth.error.missing_db')}</p>
                <p className="text-[10px] text-white/50">{t('auth.error.missing_db.desc')}</p>
              </div>
            </button>
          )}

          {error && (
            <div className="p-4 bg-error/10 border border-error/20 text-error rounded-2xl text-[12px] flex items-start gap-3 animate-reveal">
              <AlertTriangle className="shrink-0 mt-0.5" size={14} />
              <span className="leading-snug font-medium">{error}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-white/40 ml-1">{t('auth.label.name')}</label>
              <input type="text" required className="w-full aura-input" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-white/40 ml-1">{t('auth.label.email')}</label>
            <input type="email" placeholder="seu@email.com" required className="w-full aura-input" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-white/40 ml-1">{t('auth.label.password')}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full aura-input pr-12"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-white/40 ml-1">{t('auth.label.whatsapp')}</label>
                <input type="tel" required className="w-full aura-input" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 gap-4">
                {!invitedRole && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-white/40 ml-1">{t('auth.label.role')}</label>
                    <div className="relative">
                      <select className="w-full aura-input appearance-none" value={role} onChange={e => setRole(e.target.value)}>
                        <option value="client" className="bg-[#08090B]">{t('role.client')}</option>
                        <option value="distributor" className="bg-[#08090B]">{t('role.distributor')}</option>
                        <option value="consultant" className="bg-[#08090B]">{t('role.consultant')}</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-white/20 pointer-events-none" size={14} />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-white/40 ml-1">{t('auth.label.cro')}</label>
                  <input type="text" className="w-full aura-input" value={cro} onChange={e => setCro(e.target.value)} />
                </div>
              </div>
            </>
          )}

          <button type="submit" className="w-full btn-aura-lume py-4 mt-6">
            <span className="flex items-center justify-center gap-2">
              {!isLogin && invitedRole && <UserPlus size={16} />}
              {isLogin ? t('auth.btn.login') : invitedRole ? t('auth.btn.confirm_register') : t('auth.btn.create_account')}
            </span>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 space-y-6 relative z-10 w-full">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[11px] font-bold text-white/30 hover:text-white uppercase tracking-widest block w-full transition-all"
          >
            {isLogin ? t('auth.link.register') : t('auth.link.login')}
          </button>

          {!invitedRole && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleMockLogin('super_admin')}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] text-white/40 hover:text-white hover:bg-white/[0.05] transition-all"
              >
                <Shield size={14} className="text-accent" /> Admin
              </button>
              <button
                onClick={() => handleMockLogin('client')}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] text-white/40 hover:text-white hover:bg-white/[0.05] transition-all"
              >
                <User size={14} className="text-aura-lume" /> Cliente
              </button>
            </div>
          )}

          {invitedRole && (
            <button onClick={clearInvite} className="text-white/20 hover:text-white flex items-center justify-center gap-2 mx-auto transition-all text-[10px] uppercase tracking-widest font-bold">
              <ArrowLeft size={14} /> {t('auth.btn.back_login')}
            </button>
          )}
        </div>

        {showSqlSetup && <SqlSetupModal onClose={() => setShowSqlSetup(false)} />}
      </div>
    </div>
  );
};