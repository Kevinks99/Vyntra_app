import React, { useState } from 'react';
import { Dumbbell, Play, Plus, Clock, Flame, ShieldAlert, Award, Footprints } from 'lucide-react';
import { AppState, Workout } from '../types';

interface FitnessViewProps {
  state: AppState;
  onStateChange: (newState: AppState) => void;
}

export default function FitnessView({ state, onStateChange }: FitnessViewProps) {
  const [showLogModal, setShowLogModal] = useState(false);
  const [workoutType, setWorkoutType] = useState('Musculação');
  const [customType, setCustomType] = useState('');
  const [duration, setDuration] = useState('30');
  const [calories, setCalories] = useState('250');
  const [intensity, setIntensity] = useState('Alta');

  const handleAddWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    const durNum = parseInt(duration, 10) || 30;
    const calNum = parseInt(calories, 10) || 250;

    const finalType = workoutType === 'Outro' ? (customType || 'Esporte Personalizado') : workoutType;

    const newWorkout: Workout = {
      id: `w-${Date.now()}`,
      type: finalType,
      timeMinutes: durNum,
      caloriesBurned: calNum,
      intensity: intensity,
      icon: finalType === 'Corrida' ? 'directions_run' : finalType === 'Yoga Transcendente' ? 'self_improvement' : 'fitness_center',
      color: finalType === 'Corrida' ? '#ba1a1a' : finalType === 'Yoga Transcendente' ? '#006c49' : '#004ac6',
    };

    // Calculate updated layered ring metrics
    const updatedCalories = state.ringCalories + calNum;
    const updatedMinutes = state.ringMinutes + durNum;
    const updatedStand = state.ringStand + 1;

    onStateChange({
      ...state,
      workouts: [newWorkout, ...state.workouts],
      ringCalories: updatedCalories,
      ringMinutes: updatedMinutes,
      ringStand: updatedStand,
    });

    setCustomType('');
    setWorkoutType('Musculação');
    setShowLogModal(false);
  };

  // Ring offset calculations
  const calPercent = state.ringCalories / state.ringCaloriesGoal;
  const minPercent = state.ringMinutes / state.ringMinutesGoal;
  const standPercent = state.ringStand / state.ringStandGoal;

  const calStrokeOffset = 439.8 * (1 - Math.min(1, calPercent));
  const minStrokeOffset = 339.3 * (1 - Math.min(1, minPercent));
  const standStrokeOffset = 238.7 * (1 - Math.min(1, standPercent));

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-24">
      {/* Page Header */}
      <section>
        <p className="text-xs font-bold text-[#ff3b30] uppercase tracking-widest mb-1">
          Atividade Física
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-on-surface">Módulo Exercícios</h2>
        <p className="text-xs text-on-surface-variant">Sua jornada de alta performance hoje.</p>
      </section>

      {/* Layered Concentric Rings card */}
      <div className="glass-card rounded-[24px] p-6 flex flex-col items-center gap-6 relative overflow-hidden">
        {/* Glow behind rings */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#ff3b30]/5 via-[#4edea3]/5 to-[#004ac6]/5 blur-2xl pointer-events-none" />

        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Layered Apple style SVG Concentric Circles */}
          <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 180 180">
            {/* Calories Ring (Outer, Red) */}
            <circle 
              cx="90" cy="90" r="70" 
              fill="transparent" 
              stroke="#ff3b30" 
              strokeWidth="11" 
              strokeLinecap="round"
              className="opacity-15"
            />
            <circle 
              cx="90" cy="90" r="70" 
              fill="transparent" 
              stroke="#ff3b30" 
              strokeWidth="11" 
              strokeLinecap="round"
              strokeDasharray="439.8"
              strokeDashoffset={calStrokeOffset}
              className="transition-all duration-[1000ms] ease-out"
            />

            {/* Exercise Ring (Middle, Green) */}
            <circle 
              cx="90" cy="90" r="54" 
              fill="transparent" 
              stroke="#4edea3" 
              strokeWidth="11" 
              strokeLinecap="round"
              className="opacity-15"
            />
            <circle 
              cx="90" cy="90" r="54" 
              fill="transparent" 
              stroke="#4edea3" 
              strokeWidth="11" 
              strokeLinecap="round"
              strokeDasharray="339.3"
              strokeDashoffset={minStrokeOffset}
              className="transition-all duration-[1000ms] ease-out"
            />

            {/* Stand Ring (Inner, Blue) */}
            <circle 
              cx="90" cy="90" r="38" 
              fill="transparent" 
              stroke="#004ac6" 
              strokeWidth="11" 
              strokeLinecap="round"
              className="opacity-15"
            />
            <circle 
              cx="90" cy="90" r="38" 
              fill="transparent" 
              stroke="#004ac6" 
              strokeWidth="11" 
              strokeLinecap="round"
              strokeDasharray="238.7"
              strokeDashoffset={standStrokeOffset}
              className="transition-all duration-[1000ms] ease-out"
            />
          </svg>

          {/* Central status icon representing power */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <Flame className="w-6 h-6 text-[#ff3b30] animate-bounce" />
          </div>
        </div>

        {/* Legend of concentric rings */}
        <div className="w-full grid grid-cols-3 gap-2 text-center pt-2">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#ff3b30] uppercase tracking-wider block">Movimento</span>
            <p className="text-sm font-extrabold text-on-surface">
              {state.ringCalories} <span className="text-[10px] font-medium text-on-surface-variant">/ {state.ringCaloriesGoal} kcal</span>
            </p>
          </div>
          <div className="space-y-1 border-x border-[#c3c6d7]/20">
            <span className="text-[10px] font-bold text-[#006c49] uppercase tracking-wider block">Exercício</span>
            <p className="text-sm font-extrabold text-on-surface">
              {state.ringMinutes} <span className="text-[10px] font-medium text-on-surface-variant">/ {state.ringMinutesGoal} min</span>
            </p>
          </div>
          <div className="space-y-1 flex flex-col items-center justify-between">
            <span className="text-[10px] font-bold text-[#004ac6] uppercase tracking-wider block">Levantar</span>
            <div className="flex items-center gap-1.5 justify-center">
              <p className="text-sm font-extrabold text-on-surface">
                {state.ringStand} <span className="text-[10px] font-medium text-on-surface-variant">/ {state.ringStandGoal} h</span>
              </p>
              <button
                type="button"
                onClick={() => {
                  onStateChange({
                    ...state,
                    ringStand: state.ringStand + 1
                  });
                }}
                className="px-1.5 py-0.5 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-[#004ac6] dark:text-[#5390f5] transition-all text-[9px] font-black cursor-pointer leading-none"
                title="Adicionar 1 hora de pé"
              >
                +1h
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Button CTA to launch workout timer */}
      <button 
        onClick={() => setShowLogModal(true)}
        className="w-full py-4 bg-primary text-white rounded-[20px] font-semibold shadow-[0px_15px_30px_rgba(0,74,198,0.2)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <Play className="w-4 h-4 fill-current" /> Iniciar Treino
      </button>

      {/* Recent Activities Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-base font-bold text-on-surface">Atividades Recentes</h3>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Ver Tudo</span>
        </div>

        {/* List of mapped workouts */}
        <div className="space-y-3">
          {state.workouts.map((w) => {
            const isRun = w.type === 'Corrida';
            const isYoga = w.type === 'Yoga Transcendente';
            const itemColor = isRun ? 'text-[#ba1a1a]' : isYoga ? 'text-[#006c49]' : 'text-primary';
            const badgeBg = isRun ? 'bg-[#ffdad6] text-[#93000a]' : isYoga ? 'bg-[#6cf8bb]/20 text-[#00714d]' : 'bg-[#dbe1ff] text-[#003ea8]';

            return (
              <div 
                key={w.id}
                className="glass-card rounded-[20px] p-4 flex items-center gap-4 hover:scale-[1.01] transition-transform"
              >
                <div className={`w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center ${itemColor}`}>
                  <Dumbbell className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-on-surface">{w.type}</h4>
                  <div className="flex gap-2.5 text-xs text-on-surface-variant font-medium mt-0.5">
                    <span>{w.timeMinutes} min</span>
                    <span className="text-[#c3c6d7]">•</span>
                    <span>{w.caloriesBurned} kcal</span>
                  </div>
                </div>

                <div>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${badgeBg}`}>
                    {w.intensity}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Weekly Progress consistency visual graph */}
      <section className="glass-card rounded-[24px] p-5 space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#737686]">
          Consistência Semanal
        </h3>
        
        <div className="flex items-end justify-between h-20 px-2 gap-2">
          {/* Visual bar layouts */}
          <div className="w-full bg-[#e7e7f3] rounded-t-full relative group h-full">
            <div className="absolute bottom-0 w-full bg-[#004ac6]/30 rounded-t-full" style={{ height: '40%' }} />
          </div>
          <div className="w-full bg-[#e7e7f3] rounded-t-full relative group h-full">
            <div className="absolute bottom-0 w-full bg-[#004ac6]/50 rounded-t-full" style={{ height: '65%' }} />
          </div>
          <div className="w-full bg-[#e7e7f3] rounded-t-full relative group h-full">
            <div className="absolute bottom-0 w-full bg-[#004ac6]/70 rounded-t-full" style={{ height: '85%' }} />
          </div>
          <div className="w-full bg-[#e7e7f3] rounded-t-full relative group h-full">
            <div className="absolute bottom-0 w-full bg-[#004ac6]/40 rounded-t-full" style={{ height: '50%' }} />
          </div>
          <div className="w-full bg-[#e7e7f3] rounded-t-full relative group h-full">
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#2563eb] to-[#8343f4] rounded-t-full" style={{ height: '100%' }} />
          </div>
          <div className="w-full bg-[#e7e7f3] rounded-t-full relative group h-full">
            <div className="absolute bottom-0 w-full bg-slate-300 rounded-t-full" style={{ height: '15%' }} />
          </div>
          <div className="w-full bg-[#e7e7f3] rounded-t-full relative group h-full">
            <div className="absolute bottom-0 w-full bg-slate-300 rounded-t-full" style={{ height: '10%' }} />
          </div>
        </div>
        <div className="flex justify-between text-[9px] font-bold text-[#737686] px-1">
          <span>SEG</span>
          <span>TER</span>
          <span>QUA</span>
          <span>QUI</span>
          <span>SEX</span>
          <span>SÁB</span>
          <span>DOM</span>
        </div>
      </section>

      {/* Interactive Workout Logger Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-[28px] p-6 max-w-sm w-full space-y-4 shadow-xl border border-[#c3c6d7]/30">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-on-surface">Iniciar Novo Treino</h3>
              <button 
                onClick={() => setShowLogModal(false)}
                className="text-[#737686] font-bold hover:text-on-surface text-xl p-1"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddWorkout} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#434655] ml-1">Tipo de Treino</label>
                <select 
                  value={workoutType} 
                  onChange={(e) => setWorkoutType(e.target.value)}
                  className="w-full bg-[#f3f4f6] rounded-xl px-3 py-2 text-sm border-none focus:ring-1 focus:ring-primary focus:bg-white"
                >
                  <option value="Musculação">Musculação (Academia)</option>
                  <option value="Corrida">Corrida de Rua</option>
                  <option value="Futevôlei">Futevôlei</option>
                  <option value="Natação">Natação</option>
                  <option value="Yoga Transcendente">Yoga Transcendente</option>
                  <option value="Crossfit">Crossfit</option>
                  <option value="Ciclismo">Ciclismo</option>
                  <option value="Outro">Outro Esporte...</option>
                </select>
              </div>

              {workoutType === 'Outro' && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-xs font-bold text-[#434655] ml-1">Nome do Esporte</label>
                  <input 
                    type="text" 
                    value={customType} 
                    onChange={(e) => setCustomType(e.target.value)}
                    placeholder="Ex: Beach Tennis, Futebol..."
                    required
                    className="w-full bg-[#f3f4f6] rounded-xl px-3 py-2 text-sm border-none focus:ring-1 focus:ring-primary focus:bg-white focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#434655] ml-1">Duração (min)</label>
                  <input 
                    type="number" 
                    value={duration} 
                    onChange={(e) => setDuration(e.target.value)}
                    required
                    min="1"
                    className="w-full bg-[#f3f4f6] rounded-xl px-3 py-2 text-sm border-none focus:ring-1 focus:ring-primary focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#434655] ml-1">Calorias (kcal)</label>
                  <input 
                    type="number" 
                    value={calories} 
                    onChange={(e) => setCalories(e.target.value)}
                    required
                    min="1"
                    className="w-full bg-[#f3f4f6] rounded-xl px-3 py-2 text-sm border-none focus:ring-1 focus:ring-primary focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#434655] ml-1">Intensidade</label>
                <select 
                  value={intensity} 
                  onChange={(e) => setIntensity(e.target.value)}
                  className="w-full bg-[#f3f4f6] rounded-xl px-3 py-2 text-sm border-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Baixa">Baixa (Recuperação)</option>
                  <option value="Alta">Alta (Padrão)</option>
                  <option value="Intensa">Intensa (Esforço Máximo)</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:opacity-95 active:scale-95 transition-all mt-2 cursor-pointer"
              >
                Concluir e Registrar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
