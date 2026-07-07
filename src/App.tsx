import React, { useState, useEffect } from 'react';
import SplashView from './components/SplashView';
import OnboardingView from './components/OnboardingView';
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import FitnessView from './components/FitnessView';
import SleepView from './components/SleepView';
import WeightView from './components/WeightView';
import NutritionView from './components/NutritionView';
import ProfileView from './components/ProfileView';

// New Views
import AgendaView from './components/AgendaView';
import RankingView from './components/RankingView';
import EstudosView from './components/EstudosView';
import BibliotecaView from './components/BibliotecaView';
import AssistantView from './components/AssistantView';
import NotificationsView from './components/NotificationsView';

import { logout as firebaseLogout } from './lib/firebase';
import { useFirestoreState } from './lib/useFirestoreState';
import { AppState, ActiveScreen } from './types';
import { 
  Compass, 
  Dumbbell, 
  Utensils, 
  Moon, 
  User,
  Calendar,
  GraduationCap,
  Trophy,
  BookOpen,
  Heart,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('splash');
  const { state, loading: authLoading, currentUser, handleStateChange } = useFirestoreState();
  const [toast, setToast] = useState<{ id: string; title: string; message: string } | null>(null);
  const [pendingInvite, setPendingInvite] = useState<string | null>(null);
  const notifiedEventsRef = React.useRef<Set<string>>(new Set());

  // Capture invite parameter as soon as App loads and persist in localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get('invite');
    if (invite) {
      localStorage.setItem('vyn_invited_by', invite);
    }
  }, []);

  // Monitor pending invite and prompt user to accept once logged in
  useEffect(() => {
    if (!currentUser || !state?.profile?.name) return;
    const invitedBy = localStorage.getItem('vyn_invited_by');
    if (!invitedBy) return;

    // Don't invite yourself
    if (invitedBy.toLowerCase() === state.profile.name.toLowerCase()) {
      localStorage.removeItem('vyn_invited_by');
      return;
    }

    // Check if already in contacts
    const contacts = state.contacts || [];
    const alreadyFriend = contacts.some(
      (c) => c.name.toLowerCase() === invitedBy.toLowerCase()
    );

    if (!alreadyFriend) {
      setPendingInvite(invitedBy);
    } else {
      localStorage.removeItem('vyn_invited_by');
    }
  }, [currentUser, state?.profile?.name, state?.contacts]);

  const handleAcceptInvite = () => {
    if (!pendingInvite || !state) return;

    const newContact = {
      id: 'contact-' + Date.now(),
      name: pendingInvite,
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&q=80&w=200&h=200`,
      points: Math.floor(Math.random() * 1200) + 500, // random realistic points
      streak: Math.floor(Math.random() * 8) + 1, // random realistic streak
      rank: 0
    };

    handleStateChange({
      ...state,
      contacts: [...(state.contacts || []), newContact]
    });

    localStorage.removeItem('vyn_invited_by');
    setPendingInvite(null);

    // Show beautiful toast
    setToast({
      id: 'invite-accepted-' + Date.now(),
      title: "Convite Aceito!",
      message: `Você agora está conectado com ${pendingInvite}! Vocês disputarão a consistência semanal juntos.`
    });

    // Navigate to ranking so they can see their friend instantly
    setActiveScreen('ranking');
  };

  const handleDeclineInvite = () => {
    localStorage.removeItem('vyn_invited_by');
    setPendingInvite(null);
  };

  // Check for agenda alerts in background
  useEffect(() => {
    if (!state?.agendaEvents || state.agendaEvents.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const currentDateStr = `${year}-${month}-${day}`;

      const currentHoursStr = String(now.getHours()).padStart(2, '0');
      const currentMinutesStr = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHoursStr}:${currentMinutesStr}`;

      let stateUpdated = false;
      let nextNotifications = [...(state.notifications || [])];

      state.agendaEvents.forEach((event) => {
        if (!event.alertEnabled) return;
        if (event.dateString !== currentDateStr) return;

        const [evH, evM] = event.time.split(':').map(Number);
        const eventMinutesTotal = evH * 60 + evM;
        const currentMinutesTotal = now.getHours() * 60 + now.getMinutes();

        // Match exact starting time or exactly 15 minutes before
        const isExactMatch = eventMinutesTotal === currentMinutesTotal;
        const is15MinMatch = (eventMinutesTotal - 15) === currentMinutesTotal;

        if (isExactMatch || is15MinMatch) {
          const uniqueNotifId = `agenda-alert-${event.id}-${isExactMatch ? 'exact' : '15m'}`;
          
          if (!notifiedEventsRef.current.has(uniqueNotifId)) {
            notifiedEventsRef.current.add(uniqueNotifId);

            const message = isExactMatch
              ? `Sua programação "${event.title}" está começando agora às ${event.time}!`
              : `Sua programação "${event.title}" começará em 15 minutos às ${event.time}!`;

            // Display beautiful in-app toast
            setToast({
              id: event.id,
              title: "Lembrete de Programação",
              message
            });

            // Trigger actual HTML5 browser notification if permitted
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification("Vyntra - Lembrete", {
                  body: message,
                  icon: '/logo.png'
                });
              } catch (e) {
                console.error("Browser notification failed:", e);
              }
            }

            // Create a real database notification linked to this calendar alert
            const exists = nextNotifications.some(n => n.id === uniqueNotifId);
            if (!exists) {
              const newNotifItem: any = {
                id: uniqueNotifId,
                category: 'produtividade',
                source: 'AGENDA VYNTRA',
                time: 'Agora',
                title: event.title,
                description: message,
                read: false,
                actionType: 'agenda',
                actionLabel: 'Ver Agenda'
              };
              nextNotifications = [newNotifItem, ...nextNotifications];
              stateUpdated = true;
            }
          }
        }
      });

      if (stateUpdated) {
        handleStateChange({
          ...state,
          notifications: nextNotifications
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [state?.agendaEvents, state?.notificationsEnabled, state?.notifications]);

  // Handle auto-navigation on login status change
  useEffect(() => {
    if (currentUser) {
      setActiveScreen((prev) => (prev === 'login' || prev === 'splash' || prev === 'onboarding') ? 'dashboard' : prev);
    } else {
      setActiveScreen((prev) => (prev !== 'splash' && prev !== 'onboarding') ? 'login' : prev);
    }
  }, [currentUser]);

  // Load and apply persistent dark mode theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark');
    } else if (savedTheme === 'light') {
      document.body.classList.remove('dark');
    }
  }, []);

  // Transition handlers
  const handleSplashFinish = () => {
    if (currentUser) {
      setActiveScreen('dashboard');
    } else {
      setActiveScreen('onboarding');
    }
  };

  const handleOnboardingFinish = () => {
    setActiveScreen('login');
  };

  const handleLoginSuccess = (name: string) => {
    setActiveScreen('dashboard');
  };

  const handleLogout = async () => {
    try {
      await firebaseLogout();
    } catch (err) {
      console.error("Error signing out:", err);
    }
    setActiveScreen('login');
  };

  // Helper check to show premium bottom nav
  const showNav = [
    'dashboard', 'fitness', 'nutrition', 'sleep', 'weight', 'profile',
    'agenda', 'ranking', 'estudos', 'biblioteca', 'assistant', 'notifications'
  ].includes(activeScreen);

  // Group of screens that falls under "Início" hub
  const isInicioHub = ['dashboard', 'fitness', 'nutrition', 'sleep', 'weight'].includes(activeScreen);

  return (
    <div className="min-h-screen bg-[#faf8ff] text-on-surface flex flex-col font-sans select-none overflow-x-hidden antialiased">
      {/* Scrollable Frame Body */}
      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-6 pb-28">
        
        {activeScreen === 'splash' && (
          <SplashView onFinish={handleSplashFinish} />
        )}

        {activeScreen === 'onboarding' && (
          <OnboardingView 
            onSkip={handleOnboardingFinish} 
            onFinish={handleOnboardingFinish} 
          />
        )}

        {activeScreen === 'login' && (
          <LoginView onLoginSuccess={handleLoginSuccess} />
        )}

        {activeScreen === 'dashboard' && (
          <DashboardView 
            state={state} 
            onStateChange={handleStateChange} 
            onNavigate={setActiveScreen} 
          />
        )}

        {activeScreen === 'fitness' && (
          <FitnessView 
            state={state} 
            onStateChange={handleStateChange} 
          />
        )}

        {activeScreen === 'nutrition' && (
          <NutritionView 
            state={state} 
            onStateChange={handleStateChange} 
            onNavigate={setActiveScreen}
          />
        )}

        {activeScreen === 'sleep' && (
          <SleepView 
            state={state} 
            onStateChange={handleStateChange} 
          />
        )}

        {activeScreen === 'weight' && (
          <WeightView 
            state={state} 
            onStateChange={handleStateChange} 
          />
        )}

        {activeScreen === 'profile' && (
          <ProfileView 
            state={state} 
            onStateChange={handleStateChange} 
            onLogout={handleLogout}
          />
        )}

        {activeScreen === 'agenda' && (
          <AgendaView 
            state={state} 
            onStateChange={handleStateChange} 
          />
        )}

        {activeScreen === 'ranking' && (
          <RankingView 
            state={state} 
            onStateChange={handleStateChange} 
          />
        )}

        {activeScreen === 'estudos' && (
          <EstudosView 
            state={state} 
            onStateChange={handleStateChange} 
          />
        )}

        {activeScreen === 'biblioteca' && (
          <BibliotecaView 
            state={state} 
            onStateChange={handleStateChange} 
          />
        )}

        {activeScreen === 'assistant' && (
          <AssistantView 
            state={state} 
            onStateChange={handleStateChange} 
          />
        )}

        {activeScreen === 'notifications' && (
          <NotificationsView 
            state={state} 
            onStateChange={handleStateChange} 
            onNavigate={setActiveScreen}
          />
        )}

      </main>

      {/* Glassmorphic Rounded Bottom Tab Bar */}
      {showNav && (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[96%] max-w-[460px] h-20 bg-white/80 backdrop-blur-3xl rounded-[32px] border border-white/50 shadow-[0_24px_50px_rgba(0,0,0,0.08)] flex items-center justify-around px-1 z-40">
          
          {/* Nav Item: Inicio */}
          <button 
            onClick={() => setActiveScreen('dashboard')}
            className={`flex flex-col items-center justify-center w-10 h-12 rounded-2xl transition-all cursor-pointer ${
              isInicioHub ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-blue-600/80'
            }`}
          >
            <Compass className="w-4.5 h-4.5 stroke-[2.2]" />
            <span className="text-[8.5px] font-black mt-1 tracking-tight">Início</span>
          </button>

          {/* Nav Item: Agenda */}
          <button 
            onClick={() => setActiveScreen('agenda')}
            className={`flex flex-col items-center justify-center w-10 h-12 rounded-2xl transition-all cursor-pointer ${
              activeScreen === 'agenda' ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-blue-600/80'
            }`}
          >
            <Calendar className="w-4.5 h-4.5 stroke-[2.2]" />
            <span className="text-[8.5px] font-black mt-1 tracking-tight">Agenda</span>
          </button>

          {/* Nav Item: Estudos */}
          <button 
            onClick={() => setActiveScreen('estudos')}
            className={`flex flex-col items-center justify-center w-10 h-12 rounded-2xl transition-all cursor-pointer ${
              activeScreen === 'estudos' ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-blue-600/80'
            }`}
          >
            <GraduationCap className="w-4.5 h-4.5 stroke-[2.2]" />
            <span className="text-[8.5px] font-black mt-1 tracking-tight">Estudos</span>
          </button>

          {/* Nav Item: Biblioteca */}
          <button 
            onClick={() => setActiveScreen('biblioteca')}
            className={`flex flex-col items-center justify-center w-10 h-12 rounded-2xl transition-all cursor-pointer ${
              activeScreen === 'biblioteca' ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-blue-600/80'
            }`}
          >
            <BookOpen className="w-4.5 h-4.5 stroke-[2.2]" />
            <span className="text-[8.5px] font-black mt-1 tracking-tight">Livros</span>
          </button>

          {/* Nav Item: Assistente */}
          <button 
            onClick={() => setActiveScreen('assistant')}
            className={`flex flex-col items-center justify-center w-10 h-12 rounded-2xl transition-all cursor-pointer ${
              activeScreen === 'assistant' ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-blue-600/80'
            }`}
          >
            <Sparkles className="w-4.5 h-4.5 stroke-[2.2]" />
            <span className="text-[8.5px] font-black mt-1 tracking-tight">Vyn AI</span>
          </button>

          {/* Nav Item: Ranking */}
          <button 
            onClick={() => setActiveScreen('ranking')}
            className={`flex flex-col items-center justify-center w-10 h-12 rounded-2xl transition-all cursor-pointer ${
              activeScreen === 'ranking' ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-blue-600/80'
            }`}
          >
            <Heart className="w-4.5 h-4.5 stroke-[2.2]" />
            <span className="text-[8.5px] font-black mt-1 tracking-tight">Ranking</span>
          </button>

          {/* Nav Item: Perfil */}
          <button 
            onClick={() => setActiveScreen('profile')}
            className={`flex flex-col items-center justify-center w-10 h-12 rounded-2xl transition-all cursor-pointer ${
              activeScreen === 'profile' ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-blue-600/80'
            }`}
          >
            <User className="w-4.5 h-4.5 stroke-[2.2]" />
            <span className="text-[8.5px] font-black mt-1 tracking-tight">Perfil</span>
          </button>

        </nav>
      )}

      {/* In-app animated toast notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#2563eb] dark:bg-[#1a56db] text-white rounded-2xl p-4 shadow-[0_12px_40px_rgba(37,99,235,0.3)] z-50 flex items-start gap-3 border border-blue-500/30 animate-slide-down">
          <div className="p-1.5 bg-white/10 rounded-xl shrink-0">
            <Compass className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black uppercase tracking-wider text-blue-100">{toast.title}</h4>
            <p className="text-xs font-bold leading-relaxed mt-0.5">{toast.message}</p>
          </div>
          <button 
            onClick={() => setToast(null)}
            className="p-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-white font-black text-[10px] uppercase tracking-wider transition-all shrink-0 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Universal Accept Invite Modal */}
      {pendingInvite && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-6 space-y-5 animate-slide-up shadow-2xl border border-slate-100 dark:border-slate-800 text-center">
            
            {/* Animated Connection Avatar Rings */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute w-20 h-20 bg-blue-500/20 rounded-full animate-pulse" />
              <div className="relative w-16 h-16 bg-gradient-to-tr from-blue-600 to-blue-700 text-white rounded-2xl flex items-center justify-center shadow-lg font-black text-2xl">
                🤝
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Convite Recebido!</h3>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Compita com Amigos</p>
              <p className="text-xs text-slate-500 leading-relaxed pt-1.5">
                <span className="font-black text-slate-800 dark:text-slate-100">{pendingInvite}</span> convidou você para disputar a consistência semanal de hábitos e rotinas saudáveis!
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 text-[10px] text-slate-500 leading-relaxed text-left border border-slate-100/50 dark:border-slate-800/60">
              <span className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">O que muda ao conectar?</span>
              • Vocês acompanharão o progresso de treinos, sono, hidratação, estudos e leitura juntos.<br />
              • O ranking é atualizado em tempo real com base na consistência diária.<br />
              • Foco em motivação mútua sem dados privados expostos.
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <button
                onClick={handleDeclineInvite}
                className="py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold rounded-xl text-xs active:scale-95 transition-all cursor-pointer border border-slate-100 dark:border-slate-700"
              >
                Ignorar
              </button>
              <button
                onClick={handleAcceptInvite}
                className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs active:scale-95 transition-all cursor-pointer shadow-md shadow-blue-500/10"
              >
                Aceitar Convite
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

