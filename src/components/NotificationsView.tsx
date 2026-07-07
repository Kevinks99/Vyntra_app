import React, { useState } from 'react';
import { 
  Sparkles, 
  Droplet, 
  Calendar, 
  Trophy, 
  X, 
  Check, 
  ExternalLink, 
  ArrowLeft,
  Bell,
  CheckCheck,
  Brain,
  MessageSquare
} from 'lucide-react';
import { AppState } from '../types';

interface NotificationsViewProps {
  state: AppState;
  onStateChange: (newState: AppState) => void;
  onNavigate: (screen: any) => void;
}

interface NotificationItem {
  id: string;
  category: 'vyn' | 'saude' | 'produtividade' | 'conquista';
  source: string;
  time: string;
  title: string;
  description: string;
  read: boolean;
  actionType?: 'water' | 'meet' | 'agenda' | 'none';
  actionLabel?: string;
  metaData?: any;
}

export default function NotificationsView({ state, onStateChange, onNavigate }: NotificationsViewProps) {
  const [activeFilter, setActiveFilter] = useState<'tudo' | 'saude' | 'produtividade' | 'vyn'>('tudo');
  
  const notifications = state.notifications || [];

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    onStateChange({ ...state, notifications: updated });
  };

  const handleMarkRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    onStateChange({ ...state, notifications: updated });
  };

  const handleDeleteNotif = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.filter(n => n.id !== id);
    onStateChange({ ...state, notifications: updated });
  };

  const handleNotificationAction = (notif: NotificationItem) => {
    if (notif.actionType === 'water') {
      // Drink water and update state
      const nextWater = Math.min(state.waterIntakeGoalCups, state.waterIntakeCups + 1);
      const mealsRatio = state.meals.filter(m => m.completed).length / state.meals.length;
      const waterRatio = nextWater / state.waterIntakeGoalCups;
      const progress = Math.round(((waterRatio + mealsRatio) / 2) * 100);

      const updatedNotifs = notifications.map(n => n.id === notif.id ? { 
        ...n, 
        read: true, 
        description: `Copo registrado com sucesso! Total hoje: ${nextWater}/${state.waterIntakeGoalCups} copos.`,
        actionType: 'none' as any
      } : n);

      onStateChange({
        ...state,
        waterIntakeCups: nextWater,
        dailyProgressPercentage: progress,
        notifications: updatedNotifs
      });

    } else if (notif.actionType === 'meet') {
      // Open link
      window.open(notif.metaData?.link, '_blank');
      handleMarkRead(notif.id);
    } else if (notif.actionType === 'agenda') {
      onNavigate('nutrition');
    }
  };

  const filteredNotifs = notifications.filter(notif => {
    if (activeFilter === 'tudo') return true;
    if (activeFilter === 'saude') return notif.category === 'saude' || notif.category === 'conquista';
    if (activeFilter === 'produtividade') return notif.category === 'produtividade';
    if (activeFilter === 'vyn') return notif.category === 'vyn';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-24">
      {/* Header bar matching other screens */}
      <header className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/60 pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="p-2.5 bg-white dark:bg-slate-900 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4.5 h-4.5 stroke-[2.5]" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-on-surface">
              Notificações
            </h1>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">
              {unreadCount} novas mensagens
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            className="p-2.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Lidas
          </button>
        )}
      </header>

      {/* Categories Horizontal Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {[
          { id: 'tudo', label: 'Tudo' },
          { id: 'saude', label: 'Saúde' },
          { id: 'produtividade', label: 'Produtividade' },
          { id: 'vyn', label: 'Vyn AI' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeFilter === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/15 scale-[1.03]'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifs.length === 0 ? (
          <div className="glass-card rounded-[32px] p-8 text-center space-y-3.5 py-12">
            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500">
              <Bell className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Nenhum aviso encontrado</h3>
              <p className="text-xs text-slate-400 max-w-[240px] mx-auto leading-relaxed">
                Você leu todos os insights e avisos. Bom trabalho mantendo-se em dia!
              </p>
            </div>
          </div>
        ) : (
          filteredNotifs.map((notif) => {
            // Determine icon and color based on category
            let IconComp = Bell;
            let iconBgClass = 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400';
            let cardBorderClass = 'border-slate-100 dark:border-slate-800/80';
            
            if (notif.category === 'vyn') {
              IconComp = Sparkles;
              iconBgClass = 'bg-purple-50 text-[#8343f4] dark:bg-[#8343f4]/10 dark:text-[#a78bfa]';
            } else if (notif.category === 'saude') {
              IconComp = Droplet;
              iconBgClass = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400';
            } else if (notif.category === 'produtividade') {
              IconComp = Calendar;
              iconBgClass = 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400';
            } else if (notif.category === 'conquista') {
              IconComp = Trophy;
              iconBgClass = 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400';
            }

            return (
              <div 
                key={notif.id}
                onClick={() => handleMarkRead(notif.id)}
                className={`glass-card rounded-[24px] p-5 border relative overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer ${
                  !notif.read ? 'border-blue-100/80 dark:border-blue-900/30 bg-blue-50/10 dark:bg-blue-950/5' : cardBorderClass
                }`}
              >
                {/* Unread indicator dot */}
                {!notif.read && (
                  <span className="absolute top-5 right-12 w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                )}

                {/* Close Button to Delete */}
                <button
                  onClick={(e) => handleDeleteNotif(notif.id, e)}
                  className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title="Remover"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-4">
                  {/* Left Icon Panel */}
                  <div className={`${iconBgClass} p-3 rounded-2xl shrink-0`}>
                    <IconComp className="w-5 h-5 stroke-[2]" />
                  </div>

                  {/* Text Content */}
                  <div className="space-y-1.5 flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        {notif.source}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">• {notif.time}</span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 leading-snug">
                      {notif.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {notif.description}
                    </p>

                    {/* Expandable Link for Video Call in Productivity */}
                    {notif.actionType === 'meet' && (
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3.5 mt-3 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 animate-fade-in">
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Video Call Link</span>
                          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 truncate block mt-0.5">
                            {notif.metaData?.link?.replace('https://', '')}
                          </span>
                        </div>
                        <button
                          onClick={() => handleNotificationAction(notif)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
                        >
                          Join Meet
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Standard Action button for health or nutrition */}
                    {notif.actionType && notif.actionType !== 'meet' && (
                      <div className="pt-2">
                        <button
                          onClick={() => handleNotificationAction(notif)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                        >
                          {notif.actionLabel}
                          <Check className="w-3 h-3 stroke-[3.5]" />
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Helpful AI Assistant Footer Notice */}
      <div className="glass-card rounded-[28px] p-5 text-center bg-purple-500/5 dark:bg-purple-500/[0.02] border-purple-500/10 flex items-center gap-3">
        <div className="bg-purple-100 dark:bg-purple-950/40 p-2 rounded-xl text-[#8343f4] shrink-0">
          <Brain className="w-4 h-4" />
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium text-left leading-relaxed">
          Seus lembretes de agenda e alertas de hidratação estão sincronizados. Vyn AI envia insights baseados no seu sono e progresso acadêmico.
        </p>
      </div>
    </div>
  );
}
