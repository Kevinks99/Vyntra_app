import React, { useState } from 'react';
import { 
  Sparkles, 
  Dumbbell, 
  Droplet, 
  Flame, 
  ChevronRight, 
  Compass, 
  Check, 
  Plus, 
  Brain,
  Scale,
  Bell
} from 'lucide-react';
import { AppState, ActiveScreen } from '../types';

interface DashboardViewProps {
  state: AppState;
  onStateChange: (newState: AppState) => void;
  onNavigate: (screen: ActiveScreen) => void;
}

const INSIGHTS_POOL = [
  "Hoje é um ótimo dia para focar nos estudos de Design.",
  "Seu nível de hidratação está excelente hoje! Continue assim para manter o foco.",
  "Dica: Evite telas azuis 30 minutos antes de dormir às 22:45 hoje para aumentar o sono profundo.",
  "Você está com 15 dias de consistência! Que tal um treino de corrida para elevar a performance?",
  "O clima em São Paulo está ameno (24°C). Uma caminhada leve no final da tarde ajudará na digestão.",
  "Insight: Seu metabolismo respondeu muito bem aos ovos mexidos no café da manhã.",
  "Lembrete: Você já completou 65% do progresso diário de hoje. Só mais um pouco para atingir 100%!"
];

export default function DashboardView({ state, onStateChange, onNavigate }: DashboardViewProps) {
  const [insightIndex, setInsightIndex] = useState(0);
  const [insightPulse, setInsightPulse] = useState(false);

  // Trigger dynamic AI insights
  const handleGenerateInsight = () => {
    setInsightPulse(true);
    setTimeout(() => {
      setInsightIndex((prev) => (prev + 1) % INSIGHTS_POOL.length);
      setInsightPulse(false);
    }, 500);
  };

  // Add water log helper
  const handleAddWater = () => {
    const nextWater = Math.min(state.waterIntakeGoalCups, state.waterIntakeCups + 1);
    
    // Recalculate daily progress based on habits
    const waterRatio = nextWater / state.waterIntakeGoalCups;
    const mealsRatio = state.meals.filter(m => m.completed).length / state.meals.length;
    const progress = Math.round(((waterRatio + mealsRatio) / 2) * 100);

    onStateChange({
      ...state,
      waterIntakeCups: nextWater,
      dailyProgressPercentage: progress
    });
  };

  // Calculate circular SVG progress offset for weight
  // Weight goes from e.g. 75kg down to 70kg. Current is 72kg.
  // Let's draw a nice semi-circle or full circular progress ring for 72% representing target.
  const currentRatio = 0.72; // simulated offset matching mockup visual
  const strokeDashoffset = 251.2 * (1 - currentRatio);

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-24">
      {/* Top Welcome Header Bar */}
      <header className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div 
            onClick={() => onNavigate('profile')}
            className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-primary/20 hover:ring-primary/60 transition-all cursor-pointer"
          >
            <img 
              src={state.profile.avatarUrl} 
              alt={state.profile.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-on-surface">
              Bom dia {state.profile.name} 👋
            </h1>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">
              {state.profile.location} • {state.profile.temperature}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => onNavigate('notifications')}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-slate-600 dark:text-slate-300 active:scale-90 cursor-pointer relative"
            title="Notificações"
          >
            <Bell className="w-5 h-5 stroke-[2.2]" />
            {(() => {
              const unreadCount = (state.notifications || []).filter(n => !n.read).length;
              return unreadCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[9px] font-extrabold rounded-full border border-[#faf8ff] dark:border-[#0c0e17] flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              ) : null;
            })()}
          </button>
          
          <button 
            onClick={handleGenerateInsight}
            className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-primary active:scale-90 cursor-pointer relative"
            title="Pedir Insight da IA"
          >
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-purple-500 animate-ping" />
          </button>
        </div>
      </header>

      {/* Vyn AI Insight Glassmorphic Card */}
      <section 
        onClick={handleGenerateInsight}
        className={`glass-card rounded-[32px] p-6 purple-glow relative overflow-hidden group cursor-pointer transition-all duration-300 transform active:scale-[0.99] hover:shadow-lg ${
          insightPulse ? 'opacity-40 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-tertiary/10 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-700 pointer-events-none" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="bg-[#8343f4]/15 p-2 rounded-xl flex-shrink-0 text-tertiary">
            <Brain className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider">
              Vyn AI Insight
            </span>
            <p className="text-base font-semibold text-on-surface leading-tight">
              {INSIGHTS_POOL[insightIndex]}
            </p>
          </div>
        </div>
      </section>

      {/* Bento Grid Widgets */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Weight Tracker Health Widget */}
        <div 
          onClick={() => onNavigate('weight')}
          className="glass-card rounded-[24px] p-5 flex flex-col justify-between aspect-square cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <Scale className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">SAÚDE</span>
          </div>

          <div className="flex flex-col items-center py-2 relative">
            {/* SVG Weight Progress Gauge */}
            <svg className="w-20 h-20 transform -rotate-90">
              <circle 
                className="text-surface-container-high" 
                cx="40" 
                cy="40" 
                fill="transparent" 
                r="34" 
                stroke="currentColor" 
                strokeWidth="6.5" 
              />
              <circle 
                className="text-primary transition-all duration-1000" 
                cx="40" 
                cy="40" 
                fill="transparent" 
                r="34" 
                stroke="currentColor" 
                strokeDasharray="213.6" 
                strokeDashoffset={213.6 * (1 - 0.75)} 
                strokeLinecap="round"
                strokeWidth="7" 
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="block text-2xl font-bold text-on-surface leading-none">
                {state.currentWeight}
              </span>
              <span className="text-[8px] font-bold text-on-surface-variant">KG</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-on-surface-variant">
              Meta: <span className="font-bold text-on-surface">{state.weightGoal}kg</span>
            </p>
          </div>
        </div>

        {/* Hydration Habit Widget */}
        <div className="glass-card rounded-[24px] p-5 flex flex-col justify-between aspect-square">
          <div className="flex justify-between items-start">
            <Droplet className="w-5 h-5 text-sky-500" />
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">HÁBITO</span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-on-surface">Beber Água</h3>
            <div className="flex items-end gap-1 mt-0.5">
              <span className="text-2xl font-extrabold text-on-surface leading-none">
                {state.waterIntakeCups}
              </span>
              <span className="text-[10px] font-semibold text-on-surface-variant pb-0.5">
                / {state.waterIntakeGoalCups} copos
              </span>
            </div>
          </div>

          <button 
            onClick={handleAddWater}
            disabled={state.waterIntakeCups >= state.waterIntakeGoalCups}
            className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1 border ${
              state.waterIntakeCups >= state.waterIntakeGoalCups
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                : 'bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/10 text-sky-600 cursor-pointer'
            }`}
          >
            {state.waterIntakeCups >= state.waterIntakeGoalCups ? (
              <>
                <Check className="w-3.5 h-3.5" /> Concluído
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </>
            )}
          </button>
        </div>

        {/* Next Activity Card (Full Width Span) */}
        <div 
          onClick={() => onNavigate('fitness')}
          className="glass-card rounded-[24px] p-4 col-span-2 flex items-center justify-between border-l-4 border-l-primary cursor-pointer hover:shadow-md transition-shadow transform active:scale-[0.99]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">
                PRÓXIMA ATIVIDADE
              </p>
              <h3 className="text-sm font-bold text-on-surface">
                Academia em 45 min
              </h3>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-on-surface-variant" />
        </div>

        {/* Streak / Sequence Card (Full Width Span) */}
        <div className="glass-card rounded-[24px] p-4 col-span-2 flex items-center justify-between bg-gradient-to-r from-white to-orange-50/20 border border-orange-500/10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-orange-500/10 rounded-xl flex items-center justify-center text-xl text-orange-500">
              🔥
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-surface">
                {state.profile.streakDays} dias seguidos
              </h3>
              <p className="text-xs text-on-surface-variant">
                Você está no topo da sua performance!
              </p>
            </div>
          </div>
          {/* Progress bar represent */}
          <div className="h-1.5 w-20 bg-surface-container-high rounded-full overflow-hidden shrink-0">
            <div className="h-full bg-orange-500 w-3/4 rounded-full" />
          </div>
        </div>

      </div>

      {/* Daily Progress Section */}
      <section className="space-y-2 bg-white rounded-[24px] p-5 border border-[#c3c6d7]/20 shadow-[0px_8px_20px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-end">
          <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
            Progresso Diário
          </h2>
          <span className="text-sm font-bold text-primary">
            {state.dailyProgressPercentage}% <span className="text-xs text-on-surface-variant font-normal">Completo</span>
          </span>
        </div>
        
        {/* Double layered responsive dynamic track */}
        <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden border border-[#c3c6d7]/10 relative">
          <div 
            className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full shadow-[0_0_15px_rgba(37,99,235,0.25)] transition-all duration-700 ease-out" 
            style={{ width: `${state.dailyProgressPercentage}%` }}
          />
        </div>
      </section>
    </div>
  );
}
