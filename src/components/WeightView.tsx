import React, { useState } from 'react';
import { Scale, ArrowDown, Plus, HelpCircle, Check, Info } from 'lucide-react';
import { AppState, WeightLog } from '../types';

interface WeightViewProps {
  state: AppState;
  onStateChange: (newState: AppState) => void;
}

export default function WeightView({ state, onStateChange }: WeightViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [newWeight, setNewWeight] = useState('74.2');
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');

  const handleRegisterWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(newWeight);
    if (isNaN(weightNum) || weightNum <= 0) return;

    // Append to weight logs
    const currentDay = 'DOM';
    const updatedLogs = state.weightLogs.map(log => 
      log.day === currentDay ? { ...log, weight: weightNum } : log
    );

    onStateChange({
      ...state,
      currentWeight: weightNum,
      weightLogs: updatedLogs,
    });

    setShowModal(false);
  };

  // BMI (IMC) Calculation assuming Kevin is 1.78m tall
  // IMC = weight / height^2
  const heightMeters = 1.78;
  const bmi = (state.currentWeight / (heightMeters * heightMeters)).toFixed(1);
  const bmiNum = parseFloat(bmi);

  let bmiCategory = 'Normal';
  let bmiColor = 'bg-secondary-container/30 text-on-secondary-container';
  let bmiIndicatorPosition = '45%'; // center of green normal zone

  if (bmiNum < 18.5) {
    bmiCategory = 'Baixo Peso';
    bmiColor = 'bg-blue-100 text-blue-800';
    bmiIndicatorPosition = '10%';
  } else if (bmiNum >= 18.5 && bmiNum < 24.9) {
    bmiCategory = 'Peso Normal';
    bmiColor = 'bg-[#6cf8bb]/20 text-[#00714d]';
    bmiIndicatorPosition = '42%';
  } else if (bmiNum >= 25 && bmiNum < 29.9) {
    bmiCategory = 'Sobrepeso';
    bmiColor = 'bg-amber-100 text-amber-800';
    bmiIndicatorPosition = '68%';
  } else {
    bmiCategory = 'Obeso';
    bmiColor = 'bg-red-100 text-red-800';
    bmiIndicatorPosition = '88%';
  }

  // Weight trend coordinates mapping for SVG line
  // We map values between 73kg (bottom) and 76kg (top)
  const mapWeightToY = (w: number) => {
    const minW = 73.0;
    const maxW = 76.0;
    const heightSvg = 150;
    const padding = 20;
    const ratio = (w - minW) / (maxW - minW);
    // Invert because Y is down in SVG
    return heightSvg - padding - ratio * (heightSvg - padding * 2);
  };

  // Build SVG path
  const days = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
  const xSpacing = 380 / 6;

  // Let's create an elegant smooth Bezier path
  let pathD = '';
  state.weightLogs.forEach((log, index) => {
    const x = index * xSpacing + 10;
    const y = mapWeightToY(log.weight);
    if (index === 0) {
      pathD = `M ${x} ${y}`;
    } else {
      // Create a nice curve segment
      const prevX = (index - 1) * xSpacing + 10;
      const prevY = mapWeightToY(state.weightLogs[index - 1].weight);
      const cpX1 = prevX + xSpacing / 2;
      const cpY1 = prevY;
      const cpX2 = prevX + xSpacing / 2;
      const cpY2 = y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
    }
  });

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-24 animate-fade-in">
      {/* Page Header */}
      <section className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight text-on-surface">Saúde</h2>
        <p className="text-xs text-on-surface-variant font-medium">Peso e Medidas</p>
      </section>

      {/* Main Trend Bezier Curve Card */}
      <div className="bg-white rounded-[24px] border border-[#c3c6d7]/30 shadow-[0px_10px_30px_rgba(0,0,0,0.03)] p-5 relative">
        <div className="flex justify-between items-center mb-6">
          <span className="text-[10px] font-bold text-[#737686] uppercase tracking-wider">
            Tendência de Peso
          </span>
          <div className="flex bg-[#ededf9] rounded-full p-1 border border-[#c3c6d7]/20">
            <button 
              onClick={() => setViewMode('weekly')}
              className={`px-4.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'weekly' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'
              }`}
            >
              Semanal
            </button>
            <button 
              onClick={() => setViewMode('monthly')}
              className={`px-4.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'monthly' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'
              }`}
            >
              Mensal
            </button>
          </div>
        </div>

        {/* Dynamic responsive inline SVG graph curve */}
        <div className="h-44 w-full relative mb-4">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 400 150">
            <defs>
              <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* Shaded Area underneath the curve */}
            {pathD && (
              <path 
                d={`${pathD} L 390 150 L 10 150 Z`} 
                fill="url(#chartFill)" 
                className="transition-all duration-700"
              />
            )}

            {/* Main Bezier Line */}
            {pathD && (
              <path 
                d={pathD} 
                fill="none" 
                stroke="#2563EB" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="4" 
                className="transition-all duration-700"
              />
            )}

            {/* Mapped Dots */}
            {state.weightLogs.map((log, index) => {
              const x = index * xSpacing + 10;
              const y = mapWeightToY(log.weight);
              const isLast = index === state.weightLogs.length - 1;

              return (
                <g key={log.day}>
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={isLast ? '6' : '4'} 
                    fill="#2563EB" 
                    className={`transition-all duration-700 ${isLast ? 'animate-pulse' : ''}`}
                  />
                  {isLast && (
                    <circle 
                      cx={x} 
                      cy={y} 
                      r="10" 
                      fill="transparent" 
                      stroke="#2563EB" 
                      strokeWidth="1.5" 
                      className="animate-ping" 
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Days legends */}
        <div className="flex justify-between text-[10px] font-bold text-[#737686] px-1">
          {days.map(d => (
            <span key={d}>{d}</span>
          ))}
        </div>
      </div>

      {/* Grid of current/target weight metrics */}
      <div className="grid grid-cols-2 gap-4">
        {/* Current weight */}
        <div className="bg-white rounded-[24px] border border-[#c3c6d7]/30 shadow-[0px_10px_30px_rgba(0,0,0,0.03)] p-5">
          <span className="text-[10px] font-bold text-[#737686] uppercase block mb-1.5">
            Peso Atual
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-on-surface">
              {state.currentWeight}
            </span>
            <span className="text-xs text-on-surface-variant font-medium">kg</span>
          </div>
          <div className="flex items-center gap-1 text-[#006c49] mt-2.5">
            <ArrowDown className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">-0.8 kg hoje</span>
          </div>
        </div>

        {/* Target Weight */}
        <div className="bg-white rounded-[24px] border border-[#c3c6d7]/30 shadow-[0px_10px_30px_rgba(0,0,0,0.03)] p-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#737686] uppercase block mb-1.5">
              Objetivo
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-on-surface">
                {state.weightGoal}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">kg</span>
            </div>
          </div>
          <div className="mt-4 h-2 w-full bg-[#ededf9] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-tertiary w-[65%] rounded-full" />
          </div>
        </div>
      </div>

      {/* BMI Card Container with slider pointers */}
      <div className="bg-white rounded-[24px] border border-[#c3c6d7]/30 shadow-[0px_10px_30px_rgba(0,0,0,0.03)] p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[9px] font-bold text-[#737686] uppercase mb-1 block">
              Índice de Massa Corporal (IMC)
            </span>
            <span className="text-2xl font-extrabold text-on-surface">
              23.4
            </span>
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-[#6cf8bb]/20 text-[#00714d] font-bold text-[10px] uppercase tracking-wider">
            Peso Normal
          </div>
        </div>

        {/* Sliders matching BMI bounds */}
        <div className="relative pt-6 pb-2">
          {/* Gauge color spectrum strip */}
          <div className="h-2.5 w-full bg-[#ededf9] rounded-full flex overflow-hidden">
            <div className="h-full w-[18%] bg-blue-300" />
            <div className="h-full w-[35%] bg-emerald-500" />
            <div className="h-full w-[25%] bg-orange-300" />
            <div className="h-full w-[22%] bg-rose-400" />
          </div>

          {/* Indicator slider arrow pointing */}
          <div className="absolute top-0.5 left-[45%] -translate-x-1/2 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-primary" />
          </div>
        </div>

        <div className="flex justify-between text-[9px] text-[#737686] font-bold uppercase mt-1.5">
          <span>Baixo</span>
          <span>Normal</span>
          <span>Sobrepeso</span>
          <span>Obeso</span>
        </div>
      </div>

      {/* Register new weight button */}
      <button 
        onClick={() => setShowModal(true)}
        className="w-full bg-[#2563eb] text-white py-4 rounded-full font-bold shadow-[0px_10px_25px_rgba(37,99,235,0.15)] hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-sm"
      >
        <Plus className="w-4 h-4" /> Registrar Peso Atual
      </button>

      {/* Interactive Weight Logger Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-[28px] p-6 max-w-sm w-full space-y-4 shadow-xl border border-[#c3c6d7]/30">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-on-surface">Registrar Peso</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-[#737686] font-bold hover:text-on-surface text-xl p-1 cursor-pointer"
                type="button"
              >
                ×
              </button>
            </div>
            <p className="text-xs text-[#434655]">
              Subiu na balança hoje? Insira sua pesagem atual para manter o seu histórico sincronizado.
            </p>
            <form onSubmit={handleRegisterWeight} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#434655] tracking-wide block ml-1">
                  Novo Peso (kg)
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    step="0.1"
                    required
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    placeholder="74.2"
                    className="w-full bg-[#f3f4f6] border border-transparent focus:border-primary rounded-xl px-4 py-3 text-sm text-on-surface focus:bg-white focus:outline-none transition-all pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#737686]">KG</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-on-surface py-3 rounded-xl font-bold text-sm transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-[#2563eb] text-white py-3 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


function weightNumIsValid(val: number) {
  return !isNaN(val) && val > 0 && val < 500;
}
