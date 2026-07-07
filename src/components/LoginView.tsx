import React, { useState } from 'react';
import { Eye, EyeOff, Sparkles, Smile, KeyRound, Check, HelpCircle, Laptop } from 'lucide-react';
import { loginWithEmail, registerWithEmail, resetPassword, loginWithGoogle, loginWithApple, loginWithMicrosoft } from '../lib/firebase';

interface LoginViewProps {
  onLoginSuccess: (name: string) => void;
}

function translateAuthError(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Formato de e-mail inválido.';
    case 'auth/user-disabled':
      return 'Este usuário foi desativado.';
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    case 'auth/wrong-password':
      return 'Senha incorreta. Tente novamente.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está em uso.';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres.';
    case 'auth/network-request-failed':
      return 'Erro de rede. Verifique sua conexão.';
    default:
      return 'Ocorreu um erro ao autenticar. Tente novamente.';
  }
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [invitedBy] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('invite') || localStorage.getItem('vyn_invited_by');
  });
  const [isRegister, setIsRegister] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return !!params.get('invite') || !!localStorage.getItem('vyn_invited_by');
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals / Extras
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handleSSO = async (provider: 'Google' | 'Apple' | 'Microsoft') => {
    setLoading(true);
    setError('');
    try {
      if (provider === 'Google') {
        await loginWithGoogle();
      } else if (provider === 'Apple') {
        await loginWithApple();
      } else if (provider === 'Microsoft') {
        await loginWithMicrosoft();
      }
      setSuccessMsg(`Login com ${provider} realizado com sucesso!`);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-blocked') {
        setError(`O popup de login do ${provider} foi bloqueado pelo seu navegador. Por favor, permita popups para este site.`);
      } else if (err.code === 'auth/iframe-secure-context-required' || err.code === 'auth/operation-not-supported-in-this-environment' || err.message?.includes('secure context')) {
        setError(`O login via ${provider} não é suportado diretamente dentro do painel incorporado do AI Studio devido a restrições de iframe. Por favor, abra o aplicativo em uma "Nova Guia" (New Tab) clicando no link no topo direito da tela para fazer login com ${provider}!`);
      } else {
        setError(`Erro ao autenticar com ${provider}: ` + translateAuthError(err.code));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    if (isRegister && !name) {
      setError('Por favor, digite seu nome.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await registerWithEmail(email, password, name);
        setSuccessMsg('Conta criada com sucesso! Carregando painel...');
      } else {
        await loginWithEmail(email, password);
        setSuccessMsg('Login realizado com sucesso!');
      }
    } catch (err: any) {
      console.error(err);
      setError(translateAuthError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleBiometric = async () => {
    setLoading(true);
    setError('');
    try {
      const bioEmail = `demo_biometric@vyntra.com`;
      const bioPassword = `VyntraPassDemo123!`;
      try {
        await loginWithEmail(bioEmail, bioPassword);
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          await registerWithEmail(bioEmail, bioPassword, 'Kevin (Biométrico)');
        } else {
          throw err;
        }
      }
    } catch (err: any) {
      console.error(err);
      setError('Erro Biométrico: ' + translateAuthError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setLoading(true);
    try {
      await resetPassword(forgotEmail);
      setForgotSubmitted(true);
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotSubmitted(false);
        setForgotEmail('');
        setSuccessMsg('E-mail de recuperação enviado com sucesso!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }, 1500);
    } catch (err: any) {
      setError(translateAuthError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#faf8ff] overflow-y-auto">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[50%] bg-[#004ac6]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[5%] left-[-10%] w-[60%] h-[50%] bg-[#6a1edb]/5 blur-[120px] rounded-full pointer-events-none" />

      <main className="w-full max-w-[420px] z-10 flex flex-col items-center py-6">
        {/* Logo Header */}
        <header className="mb-8 text-center space-y-2">
          {/* Brand concentric micro-circle logo */}
          <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-[#c3c6d7]/30 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin flex items-center justify-center" style={{ animationDuration: '4s' }}>
              <div className="w-4 h-4 rounded-full bg-[#10b981]" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-on-surface">Vyntra</h1>
          <p className="text-sm text-[#434655] font-medium">
            {isRegister ? 'Crie sua conta de alta performance.' : 'Optimize seu fluxo de alto desempenho.'}
          </p>
        </header>

        {/* Action Feedbacks */}
        {invitedBy && (
          <div className="w-full bg-blue-50/80 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-300 p-4 rounded-2xl mb-4 text-xs font-semibold leading-relaxed animate-fade-in flex flex-col gap-1 shadow-sm">
            <span className="text-sm">👋 Olá! Conexão de Rede</span>
            <span>Você foi convidado por <strong className="font-extrabold text-blue-800 dark:text-blue-200">{invitedBy}</strong> para disputar no ranking de consistência de treinos, estudos e hábitos saudáveis no Vyntra! Crie sua conta abaixo para começar.</span>
          </div>
        )}
        {error && (
          <div className="w-full bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#93000a] px-4 py-3 rounded-xl mb-4 text-xs font-semibold animate-fade-in flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
            {error}
          </div>
        )}
        {successMsg && (
          <div className="w-full bg-[#6cf8bb]/10 border border-[#006c49]/30 text-[#00714d] px-4 py-3 rounded-xl mb-4 text-xs font-semibold animate-fade-in flex items-center gap-2">
            <Check className="w-4 h-4" />
            {successMsg}
          </div>
        )}

        {/* Login Container glassmorphic card */}
        <div className="glass-card w-full rounded-[24px] p-8 shadow-[0px_10px_30px_rgba(0,0,0,0.04)] flex flex-col gap-6 relative">
          
          {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-[24px] z-20 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <span className="text-xs font-bold text-primary tracking-wider uppercase animate-pulse">Autenticando...</span>
            </div>
          )}

          {/* SSO Provider Button */}
          <div className="w-full">
            <button 
              type="button"
              onClick={() => handleSSO('Google')}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-[#5d5f6f]/50 rounded-xl bg-white text-[#191b23] hover:bg-slate-50 transition-all active:scale-[0.98] font-bold shadow-sm cursor-pointer"
              title="Entrar com Google"
            >
              <img 
                className="w-5 h-5 object-contain" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVcTs6UlE1yUxAoGNYnnO03czEuffKYOkiD3YUaDoZuEk3P3m1x_jrthZGx6vqU9r6X_drBPmp5RNu2NXmUTxX-_PdtU0YOpbkioz8BUlCOnMqEAEKSKhYmLE1pG7gNdRhIesKQbzuQPK7ogEvL8ubM9eflCwopL0Ci-MDp9cy7j7gYbpmsZhVb9BxPuQBwlOu_JAKc5Yz49NAtet2RDD7mVOcl5GhsirmEYhq3bHya8GH6SID8ZCW1JDfU4IBROLROeHuON0XbQWT" 
                alt="Google"
                referrerPolicy="no-referrer"
              />
              Entrar com o Google
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-[#c3c6d7]/50" />
            <span className="text-[10px] font-bold text-[#434655] uppercase tracking-widest">
              Ou use seu email
            </span>
            <div className="h-[1px] flex-1 bg-[#c3c6d7]/50" />
          </div>

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {isRegister && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#191b23] tracking-wide block ml-1">
                  Nome Completo
                </label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-white border border-[#5d5f6f]/40 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 rounded-xl px-4 py-3 text-sm text-[#191b23] focus:outline-none transition-all duration-300"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#191b23] tracking-wide block ml-1">
                E-mail
              </label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@exemplo.com"
                className="w-full bg-white border border-[#5d5f6f]/40 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 rounded-xl px-4 py-3 text-sm text-[#191b23] focus:outline-none transition-all duration-300"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-[#191b23] tracking-wide block">
                  Senha
                </label>
                {!isRegister && (
                  <button 
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-semibold text-blue-600 hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    Esqueci minha senha
                  </button>
                )}
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#5d5f6f]/40 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 rounded-xl px-4 py-3 text-sm text-[#191b23] focus:outline-none transition-all duration-300 pr-10"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#191b23] transition-colors cursor-pointer animate-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-[0px_10px_25px_rgba(37,99,235,0.15)] hover:bg-blue-700 active:scale-[0.98] transition-all cursor-pointer mt-2"
            >
              {isRegister ? 'Criar Conta' : 'Entrar'}
            </button>
          </form>

        </div>

        {/* Footer Toggle Mode */}
        <footer className="mt-8 text-center">
          <p className="text-sm text-[#434655]">
            {isRegister ? 'Já possui uma conta?' : 'Não tem uma conta?'} 
            <button 
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="font-bold text-blue-600 ml-1.5 hover:underline underline-offset-4 cursor-pointer"
            >
              {isRegister ? 'Faça Login' : 'Criar Conta'}
            </button>
          </p>
        </footer>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full space-y-4 shadow-xl border border-[#c3c6d7]/30">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-on-surface">Recuperar Senha</h3>
              <button 
                onClick={() => setShowForgotModal(false)}
                className="text-[#737686] font-bold hover:text-on-surface text-xl p-1"
              >
                ×
              </button>
            </div>
            <p className="text-xs text-[#434655]">
              Insira o seu e-mail cadastrado e enviaremos um link de redefinição instantâneo.
            </p>
            <form onSubmit={handleForgotSubmit} className="space-y-3">
              <input 
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="seu_email@exemplo.com"
                className="w-full bg-white border border-[#5d5f6f]/40 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 rounded-xl px-4 py-3 text-sm text-[#191b23] focus:outline-none transition-all"
              />
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
              >
                Enviar Link
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
