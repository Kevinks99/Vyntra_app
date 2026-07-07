import React, { useState, useEffect } from 'react';
import { Scale, ArrowDown, Plus, HelpCircle, Check, Info, Ruler } from 'lucide-react';
import { AppState, WeightLog } from '../types';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

interface WeightViewProps {
  state: AppState;
  onStateChange: (newState: AppState) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  heightMeters: number;
}

const CustomTooltip = ({ active, payload, label, heightMeters }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const weightVal = payload[0]?.value;
    const bmiVal = payload[1]?.value || (weightVal / (heightMeters * heightMeters)).toFixed(1);
    
    let category = 'Normal';
    let catColor = 'text-emerald-500';
    const bmiNum = parseFloat(bmiVal);
    if (bmiNum < 18.5) {
      category = 'Baixo Peso';
      catColor = 'text-blue-500';
    } else if (bmiNum >= 18.5 && bmiNum < 24.9) {
      category = 'Peso Normal';
      catColor = 'text-emerald-500';
    } else if (bmiNum >= 25 && bmiNum < 29.9) {
      category = 'Sobrepeso';
      catColor = 'text-amber-500';
    } else {
      category = 'Obeso';
      catColor = 'text-red-500';
    }

    return (
      <div className="bg-white/95 dark:bg-[#121421]/95 backdrop-blur-md p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl space-y-1">
        <p className="font-bold text-[10px] uppercase text-slate-400 tracking-wider">{label}</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Peso: <span className="font-bold text-slate-900 dark:text-white">{weightVal} kg</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            IMC: <span className="font-bold text-slate-900 dark:text-white">{bmiVal}</span> 
            <span className={`ml-1.5 text-[10px] font-bold ${catColor}`}>({category})</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function WeightView({ state, onStateChange }: WeightViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [newWeight, setNewWeight] = useState('74.2');
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const [showHeightModal, setShowHeightModal] = useState(false);
  const [tempHeightOnly, setTempHeightOnly] = useState((state.profile.height || 175).toString());
  const [newHeightInput, setNewHeightInput] = useState((state.profile.height || 175).toString());

  // Synchronize state heights when profile changes
  useEffect(() => {
    if (state.profile.height) {
      setTempHeightOnly(state.profile.height.toString());
      setNewHeightInput(state.profile.height.toString());
    }
  }, [state.profile.height]);

  const handleRegisterWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(newWeight);
    if (isNaN(weightNum) || weightNum <= 0) return;

    // Use existing weight logs or initialize with default weekly logs
    const baseLogs = state.weightLogs && state.weightLogs.length > 0 
      ? state.weightLogs 
      : [
          { day: 'SEG', weight: 75.8 },
          { day: 'TER', weight: 75.5 },
          { day: 'QUA', weight: 75.2 },
          { day: 'QUI', weight: 75.0 },
          { day: 'SEX', weight: 74.6 },
          { day: 'SÁB', weight: 74.8 },
          { day: 'DOM', weight: 75.0 }
        ];

    const currentDay = 'DOM';
    const updatedLogs = baseLogs.map(log => 
      log.day === currentDay ? { ...log, weight: weightNum } : log
    );

    const heightNum = parseInt(newHeightInput, 10);

    onStateChange({
      ...state,
      currentWeight: weightNum,
      weightLogs: updatedLogs,
      profile: {
        ...state.profile,
        height: isNaN(heightNum) ? state.profile.height : heightNum
      }
    });

    setShowModal(false);
  };

  const handleSaveHeightOnly = (e: React.FormEvent) => {
    e.preventDefault();
    const heightNum = parseInt(tempHeightOnly, 10);
    if (isNaN(heightNum) || heightNum <= 0) return;

    onStateChange({
      ...state,
      profile: {
        ...state.profile,
        height: heightNum
      }
    });
    setShowHeightModal(false);
  };

  // BMI (IMC) Calculation using registered height (defaulting to 175cm if not specified)
  // IMC = weight / height^2
  const heightCentimeters = state.profile.height || 175;
  const heightMeters = heightCentimeters / 100;
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

  // Weight logs fallback if empty
  const logs = state.weightLogs && state.weightLogs.length > 0 
    ? state.weightLogs 
    : [
        { day: 'SEG', weight: 75.8 },
        { day: 'TER', weight: 75.5 },
        { day: 'QUA', weight: 75.2 },
        { day: 'QUI', weight: 75.0 },
        { day: 'SEX', weight: 74.6 },
        { day: 'SÁB', weight: 74.8 },
        { day: 'DOM', weight: state.currentWeight || 75.0 }
      ];

  // Prepare chart data based on viewMode
  const chartData = (viewMode === 'weekly' ? logs : [
    { day: 'Semana 1', weight: (logs[0]?.weight || 75.8) + 1.2 },
    { day: 'Semana 2', weight: (logs[0]?.weight || 75.8) + 0.6 },
    { day: 'Semana 3', weight: (logs[0]?.weight || 75.8) - 0.2 },
    { day: 'Semana 4', weight: state.currentWeight || 75.0 }
  ]).map(log => {
    const logBmi = (log.weight / (heightMeters * heightMeters)).toFixed(1);
    return {
      day: log.day,
      weight: parseFloat(log.weight.toFixed(1)),
      bmi: parseFloat(logBmi)
    };
  });

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-24 animate-fade-in">
      {/* Page Header */}
      <section className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight text-on-surface">Saúde</h2>
        <p className="text-xs text-on-surface-variant font-medium">Peso e Medidas</p>
      </section>

      {/* Main Trend Recharts Card */}
      <div className="bg-white rounded-[24px] border border-[#c3c6d7]/30 shadow-[0px_10px_30px_rgba(0,0,0,0.03)] p-5 relative">
        <div className="flex justify-between items-center mb-6">
          <span className="text-[10px] font-bold text-[#737686] uppercase tracking-wider">
            Evolução de Peso e IMC
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

        {/* Recharts Chart Container */}
        <div className="h-56 w-full relative mb-1 text-xs select-none">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: -5, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBmi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#737686', fontSize: 10, fontWeight: 700 }}
              />
              <YAxis 
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                domain={['dataMin - 1', 'dataMax + 1']}
                tick={{ fill: '#2563eb', fontSize: 9, fontWeight: 600 }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                tick={{ fill: '#10b981', fontSize: 9, fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip heightMeters={heightMeters} />} />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="weight" 
                stroke="#2563eb" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorWeight)" 
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="Peso"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="bmi" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 0, fill: '#10b981' }}
                activeDot={{ r: 5, strokeWidth: 0 }}
                name="IMC"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex justify-center items-center gap-6 mt-2 text-[11px] font-bold">
          <div className="flex items-center gap-1.5 text-blue-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Peso Corporal (kg)</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-500">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Índice de Massa Corporal (IMC)</span>
          </div>
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
              {bmi}
            </span>
          </div>
          <div className={`px-3.5 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${bmiColor}`}>
            {bmiCategory}
          </div>
        </div>

        {/* Sliders matching BMI bounds */}
        <div className="relative pt-6 pb-2">
          {/* Gauge color spectrum strip */}
          <div className="h-2.5 w-full bg-[#ededf9] rounded-full flex overflow-hidden">
            <div className="h-full w-[18%] bg-blue-300" />
            <div className="h-full w-[35%] bg-[#6cf8bb]/50" />
            <div className="h-full w-[25%] bg-orange-300" />
            <div className="h-full w-[22%] bg-rose-400" />
          </div>

          {/* Indicator slider arrow pointing */}
          <div 
            className="absolute top-0.5 flex flex-col items-center transition-all duration-500" 
            style={{ left: bmiIndicatorPosition }}
          >
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-blue-600" />
          </div>
        </div>

        <div className="flex justify-between text-[9px] text-[#737686] font-bold uppercase mt-1.5">
          <span>Baixo</span>
          <span>Normal</span>
          <span>Sobrepeso</span>
          <span>Obeso</span>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/30 flex justify-between items-center text-xs">
          <span className="text-[#737686] font-medium flex items-center gap-1">
            <Ruler className="w-3.5 h-3.5 text-blue-500" /> Sua Altura Cadastrada:
          </span>
          <button 
            onClick={() => {
              setTempHeightOnly(heightCentimeters.toString());
              setShowHeightModal(true);
            }} 
            className="text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer bg-blue-50 dark:bg-blue-950/20 px-2.5 py-1 rounded-lg"
          >
            {state.profile.height ? `${(state.profile.height / 100).toFixed(2)} m` : "Não cadastrada"} 
            <span className="text-[10px] text-slate-400 font-normal hover:text-blue-600">(Alterar)</span>
          </button>
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

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#434655] tracking-wide block ml-1">
                  Sua Altura (cm)
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    required
                    value={newHeightInput}
                    onChange={(e) => setNewHeightInput(e.target.value)}
                    placeholder="175"
                    className="w-full bg-[#f3f4f6] border border-transparent focus:border-primary rounded-xl px-4 py-3 text-sm text-on-surface focus:bg-white focus:outline-none transition-all pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#737686]">CM</span>
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

      {/* Interactive Height Only Logger Modal */}
      {showHeightModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-[28px] p-6 max-w-sm w-full space-y-4 shadow-xl border border-[#c3c6d7]/30">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-on-surface">Atualizar Altura</h3>
              <button 
                onClick={() => setShowHeightModal(false)}
                className="text-[#737686] font-bold hover:text-on-surface text-xl p-1 cursor-pointer"
                type="button"
              >
                ×
              </button>
            </div>
            <p className="text-xs text-[#434655]">
              Insira sua altura em centímetros para calcularmos o seu Índice de Massa Corporal (IMC) com a precisão ideal.
            </p>
            <form onSubmit={handleSaveHeightOnly} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#434655] tracking-wide block ml-1">
                  Altura (cm)
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    required
                    value={tempHeightOnly}
                    onChange={(e) => setTempHeightOnly(e.target.value)}
                    placeholder="175"
                    className="w-full bg-[#f3f4f6] border border-transparent focus:border-primary rounded-xl px-4 py-3 text-sm text-on-surface focus:bg-white focus:outline-none transition-all pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#737686]">CM</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowHeightModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-on-surface py-3 rounded-xl font-bold text-sm transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-[#2563eb] text-white py-3 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  Salvar
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
