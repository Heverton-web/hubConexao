import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useBrand } from '../contexts/BrandContext';
import { UserPlus, ArrowLeft, CheckCircle, Globe, Briefcase, User, TrendingUp, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const { t } = useLanguage();
  const { config } = useBrand();
  
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
        await register({ name, email, whatsapp, role, cro });
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado');
    }
  };

  const clearInvite = () => {
    // Remove query param without refreshing to go back to standard flow
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.pushState({path:newUrl},'',newUrl);
    setInvitedRole(null);
    setIsLogin(true);
  };

  // --- Layout Helper Functions (Functions instead of Components to avoid remounting issues) ---

  const renderLogo = (size: "normal" | "large" = "normal") => (
     <div className="flex items-center gap-3 justify-center mb-6">
        {config.logoUrl ? (
             <img src={config.logoUrl} alt="Logo" className={size === "large" ? "h-20" : "h-12"} />
        ) : (
            <div className={`${size === "large" ? "w-16 h-16 text-3xl" : "w-12 h-12 text-xl"} bg-accent rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-accent/20`}>
              {config.appName.substring(0, 2).toUpperCase()}
            </div>
        )}
     </div>
  );

  const renderForm = () => (
    <div className={`w-full max-w-md bg-surface p-8 rounded-2xl shadow-xl border border-border relative ${invitedRole ? 'bg-white/95 backdrop-blur-sm' : ''}`}>
        
        {/* Only show logo here if NOT in landing page mode (since landing page has logo in header/side) */}
        {!invitedRole && renderLogo()}

        <div className="text-center mb-8">
          {!isLogin && invitedRole ? (
             <div className="animate-fade-in md:hidden"> 
                {/* Mobile only header for landing page */}
                <h2 className="text-2xl font-bold mb-2 text-main">{t(`landing.${invitedRole}.title`)}</h2>
             </div>
          ) : (
             <>
                <h2 className="text-2xl font-bold mb-2 text-main">{isLogin ? t('auth.login') : t('auth.register')}</h2>
                <p className="text-xl font-medium text-accent">{config.appName}</p>
                <p className="text-muted text-sm mt-2 px-2">
                   {t('auth.hint')}
                </p>
             </>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-red-700" />
             {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1 text-main">Nome Completo</label>
              <input type="text" required className="w-full p-2.5 rounded-lg border border-border bg-page text-main focus:ring-2 focus:ring-accent outline-none" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-main">Email</label>
            <input type="email" required className="w-full p-2.5 rounded-lg border border-border bg-page text-main focus:ring-2 focus:ring-accent outline-none" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-main">Senha</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                className="w-full p-2.5 pr-10 rounded-lg border border-border bg-page text-main focus:ring-2 focus:ring-accent outline-none" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-main focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1 text-main">WhatsApp</label>
                <input type="tel" required className="w-full p-2.5 rounded-lg border border-border bg-page text-main focus:ring-2 focus:ring-accent outline-none" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                 {/* Only show Role Selector if NOT in invite flow */}
                 {!invitedRole && (
                    <div>
                      <label className="block text-sm font-medium mb-1 text-main">Tipo de Perfil</label>
                      <select className="w-full p-2.5 rounded-lg border border-border bg-page text-main focus:ring-2 focus:ring-accent outline-none" value={role} onChange={e => setRole(e.target.value)}>
                        <option value="client">Cliente</option>
                        <option value="distributor">Distribuidor</option>
                        <option value="consultant">Consultor</option>
                      </select>
                    </div>
                 )}
                 {/* Always show CRO optional if in register mode */}
                 <div>
                    <label className="block text-sm font-medium mb-1 text-main">CRO (Opcional)</label>
                    <input type="text" className="w-full p-2.5 rounded-lg border border-border bg-page text-main focus:ring-2 focus:ring-accent outline-none" value={cro} onChange={e => setCro(e.target.value)} />
                 </div>
              </div>
            </>
          )}

          <button type="submit" className="w-full bg-accent hover:bg-opacity-90 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2 hover:scale-[1.02]">
            {!isLogin && invitedRole && <UserPlus size={20} />}
            {isLogin ? 'Entrar' : invitedRole ? 'Confirmar Cadastro' : 'Criar Conta'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {invitedRole ? (
             <button onClick={clearInvite} className="text-muted hover:text-main flex items-center justify-center gap-2 mx-auto transition-colors font-medium">
               <ArrowLeft size={16} /> Voltar para Login Padrão
             </button>
          ) : (
            <button onClick={() => setIsLogin(!isLogin)} className="text-accent hover:underline font-medium">
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
            </button>
          )}
        </div>
    </div>
  );

  // --- SCENARIO 1: Standard Login/Register (Centered Card) ---
  if (!invitedRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-page p-4 transition-colors duration-200 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface via-page to-page">
           {renderForm()}
        </div>
      );
  }

  // --- SCENARIO 2: Landing Page (Split Screen) ---
  
  // Configuration for each landing page style
  const landingConfig: Record<string, { bgClass: string, icon: any, pattern: string }> = {
      'client': {
          bgClass: 'bg-blue-600',
          icon: User,
          pattern: 'radial-gradient(circle at 10% 20%, rgb(37, 99, 235) 0%, rgb(30, 64, 175) 90.1%)' // Blue gradient
      },
      'distributor': {
          bgClass: 'bg-slate-900',
          icon: Globe,
          pattern: 'linear-gradient(109.6deg, rgb(15, 23, 42) 11.2%, rgb(51, 65, 85) 91.1%)' // Dark Slate
      },
      'consultant': {
          bgClass: 'bg-purple-700',
          icon: TrendingUp,
          pattern: 'radial-gradient(circle at 50% -20.71%, #a855f7 0, #9333ea 10%, #7e22ce 20%, #6b21a8 30%, #581c87 40%, #4c1d95 50%, #2e1065 60%, #1e1b4b 70%)' // Purple Aurora
      }
  };

  const currentTheme = landingConfig[invitedRole] || landingConfig['client'];
  const Icon = currentTheme.icon;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-page">
        
        {/* Left Side - Marketing Content */}
        <div 
            className={`w-full md:w-1/2 p-8 md:p-16 text-white flex flex-col justify-center relative overflow-hidden`}
            style={{ background: currentTheme.pattern }}
        >
            {/* Background Texture/Pattern Overlay */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
            
            <div className="relative z-10 max-w-lg mx-auto md:mx-0">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                        <Icon size={24} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">{config.appName}</h1>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                    {t(`landing.${invitedRole}.title`)}
                </h2>
                
                <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
                    {t(`landing.${invitedRole}.desc`)}
                </p>

                <div className="space-y-4">
                    {[1, 2, 3].map((num) => (
                        <div key={num} className="flex items-center gap-4 bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm transition-transform hover:translate-x-2">
                            <div className="shrink-0 w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center">
                                <CheckCircle size={18} className="text-green-300" />
                            </div>
                            <span className="font-medium">{t(`landing.${invitedRole}.benefit.${num}`)}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex items-center gap-2 text-sm text-blue-200/80">
                   <ShieldCheck size={16} />
                   <span>Ambiente Seguro & Criptografado</span>
                </div>
            </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 bg-page">
            {renderForm()}
        </div>
    </div>
  );
};