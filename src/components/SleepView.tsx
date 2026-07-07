import React, { useState } from 'react';
import { Moon, Sun, Clock, Lightbulb, Compass, Award, Plus, Calendar, CheckCircle } from 'lucide-react';
import { AppState } from '../types';

interface SleepViewProps {
  state: AppState;
  onStateChange: (newState: AppState) => void;
}

export default function SleepView({ state, onStateChange }: SleepViewProps) {
  const [showSleepModal, setShowLogModal] = useState(false);
  const [hoursSlept, setHoursSlept] = useState('7.5');
  const [sleepScore, setSleepScore] = useState('85');
  const [bedtime, setBedtime] = useState('22:45');
  const [wakeTime, setWakeTime] = useState('06:30');

  // Submit sleep log helper
  const handleLogSleep = (e: React.FormEvent) => {
    e.preventDefault();
    const scoreVal = parseInt(sleepScore, 10) || 85;
    
    // Average calculation or simple state change simulated
    onStateChange({
      ...state,
      // mock updates to state
    });

    setShowLogModal(false);
  };

  // Ring offset calculations for sleep score (e.g. score 82)
  const scoreRatio = 82 / 100;
  const scoreStrokeOffset = 552.92 * (1 - scoreRatio);

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-24">
      {/* Title Header */}
      <section className="space-y-0.5">
        <p className="text-xs font-bold text-primary uppercase tracking-widest">
          Painel de Saúde
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-on-surface">Saúde - Sono</h2>
      </section>

      {/* Sleep Score Ring Card */}
      <section className="relative overflow-hidden bg-white rounded-[32px] p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.03)] border border-[#c3c6d7]/30 flex flex-col items-center justify-center text-center">
        <div className="absolute top-4 right-4">
          <Moon className="w-5 h-5 text-outline-variant opacity-60" />
        </div>

        <div className="relative w-44 h-44 flex items-center justify-center">
          {/* Circular Progress Gauge */}
          <svg className="w-full h-full transform -rotate-90">
            <circle 
              className="text-[#ededf9]" 
              cx="88" 
              cy="88" 
              fill="transparent" 
              r="76" 
              stroke="currentColor" 
              strokeWidth="7" 
            />
            <circle 
              className="transition-all duration-1000" 
              cx="88" 
              cy="88" 
              fill="transparent" 
              r="76" 
              stroke="url(#sleep-score-grad)" 
              strokeDasharray="477.5" 
              strokeDashoffset={477.5 * (1 - scoreRatio)} 
              strokeLinecap="round" 
              strokeWidth="9" 
            />
            <defs>
              <linearGradient id="sleep-score-grad" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#7C3AED' }} />
                <stop offset="100%" style={{ stopColor: '#2563EB' }} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-extrabold text-on-surface">82</span>
            <span className="text-[10px] font-bold text-[#737686] uppercase tracking-wider">
              Pontuação
            </span>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-base font-bold text-on-surface">Qualidade Ótima</p>
          <p className="text-xs text-on-surface-variant max-w-[240px] mx-auto mt-1 leading-relaxed">
            Seu sono REM foi 15% superior à média da última semana.
          </p>
        </div>
      </section>

      {/* Bedtime & Wakeup grids */}
      <section className="grid grid-cols-2 gap-4">
        {/* Bedtime card */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0px_10px_30px_rgba(0,0,0,0.03)] border border-[#c3c6d7]/30">
          <div className="flex items-center gap-2 mb-3">
            <Moon className="w-4 h-4 text-tertiary" />
            <span className="text-[10px] font-bold text-[#737686] uppercase tracking-wider">
              Hora de Deitar
            </span>
          </div>
          <p className="text-2xl font-extrabold text-on-surface">{bedtime}</p>
          <p className="text-[10px] font-bold text-[#006c49] mt-2 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> No horário
          </p>
        </div>

        {/* Wake up card */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0px_10px_30px_rgba(0,0,0,0.03)] border border-[#c3c6d7]/30">
          <div className="flex items-center gap-2 mb-3">
            <Sun className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-bold text-[#737686] uppercase tracking-wider">
              Hora de Acordar
            </span>
          </div>
          <p className="text-2xl font-extrabold text-on-surface">{wakeTime}</p>
          <p className="text-[10px] font-bold text-tertiary mt-2 flex items-center gap-1">
            <Clock className="w-3 h-3" /> +15min hoje
          </p>
        </div>
      </section>

      {/* Dynamic Targets adjustments */}
      <div className="bg-white rounded-2xl p-4 border border-[#c3c6d7]/20 flex justify-around text-center">
        <div>
          <span className="text-[9px] font-bold text-[#737686] uppercase block">Ajustar Alvo Deitar</span>
          <input 
            type="text" 
            value={bedtime} 
            onChange={(e) => setBedtime(e.target.value)} 
            className="w-16 text-center text-xs font-bold bg-[#f3f4f6] rounded px-1.5 py-0.5 border-none mt-1 focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="w-[1px] bg-[#c3c6d7]/30" />
        <div>
          <span className="text-[9px] font-bold text-[#737686] uppercase block">Ajustar Alvo Acordar</span>
          <input 
            type="text" 
            value={wakeTime} 
            onChange={(e) => setWakeTime(e.target.value)} 
            className="w-16 text-center text-xs font-bold bg-[#f3f4f6] rounded px-1.5 py-0.5 border-none mt-1 focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* 7-Day History Chart */}
      <section className="bg-white rounded-[32px] p-5 shadow-[0px_10px_30px_rgba(0,0,0,0.03)] border border-[#c3c6d7]/30">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-on-surface">Histórico (7 dias)</h3>
          <span className="text-[10px] font-bold text-[#737686] uppercase">Média: 7h 20m</span>
        </div>

        <div className="flex items-end justify-between h-36 px-2">
          {/* Loop sleepLogs to render historic bars */}
          {state.sleepLogs.map((log) => {
            const isActive = log.day === 'Dom';
            const barHeight = `${(log.hours / 9) * 100}%`;

            return (
              <div key={log.day} className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="relative w-7 h-24 bg-[#f3f3fe] rounded-full overflow-hidden flex items-end">
                  <div 
                    className={`w-full rounded-full transition-all duration-700 ${
                      isActive 
                        ? 'bg-gradient-to-t from-[#2563eb] to-[#7c3aed] shadow-md' 
                        : 'bg-[#ededf9] group-hover:bg-[#c3c6d7]/40'
                    }`} 
                    style={{ height: barHeight }} 
                  />
                </div>
                <span className={`text-[10px] font-bold ${isActive ? 'text-primary' : 'text-[#737686]'}`}>
                  {log.day}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Coach advice widget */}
      <section className="bg-primary/5 rounded-[24px] p-5 border border-primary/10 flex gap-4">
        <div className="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 text-primary">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider">
            Dica do Coach
          </h4>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Evite telas 30 minutos antes das {bedtime} hoje para melhorar seu sono profundo em até 20%.
          </p>
        </div>
      </section>

      {/* Add Sleep Log CTA button */}
      <button 
        onClick={() => setShowLogModal(true)}
        className="w-full py-3.5 bg-tertiary text-white rounded-xl font-semibold shadow-[0px_10px_25px_rgba(131,67,244,0.15)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
      >
        <Calendar className="w-4 h-4" /> Registrar Noite de Sono
      </button>

      {/* Interactive Sleep Logger Modal */}
      {showSleepModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-[28px] p-6 max-w-sm w-full space-y-4 shadow-xl border border-[#c3c6d7]/30">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-on-surface">Registrar Noite</h3>
              <button 
                onClick={() => setShowLogModal(false)}
                className="text-[#737686] font-bold hover:text-on-surface text-xl p-1"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleLogSleep} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#434655] ml-1">Horas Dormidas</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={hoursSlept} 
                  onChange={(e) => setHoursSlept(e.target.value)}
                  required
                  min="1"
                  max="24"
                  className="w-full bg-[#f3f4f6] rounded-xl px-3 py-2 text-sm border-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#434655] ml-1">Pontuação de Qualidade (0 - 100)</label>
                <input 
                  type="number" 
                  value={sleepScore} 
                  onChange={(e) => setSleepScore(e.target.value)}
                  required
                  min="1"
                  max="100"
                  className="w-full bg-[#f3f4f6] rounded-xl px-3 py-2 text-sm border-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-tertiary text-white py-3.5 rounded-xl font-bold hover:opacity-95 active:scale-95 transition-all mt-2 cursor-pointer"
              >
                Salvar Histórico
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
