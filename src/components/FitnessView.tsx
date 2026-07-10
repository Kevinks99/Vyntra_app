import React, { useState, useEffect } from 'react';
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

  // Active Workout state
  const [showStartModal, setShowStartModal] = useState(false);
  const [estimatedMinutes, setEstimatedMinutes] = useState('45');
  const [liveWorkoutType, setLiveWorkoutType] = useState('Musculação');
  const [liveCustomType, setLiveCustomType] = useState('');
  const [liveIntensity, setLiveIntensity] = useState('Alta');
  const [liveKmMeta, setLiveKmMeta] = useState('5.0');
  
  const [activeWorkout, setActiveWorkout] = useState<{
    startTime: number;
    estimatedMinutes: number;
    type: string;
    intensity: string;
    kmMeta?: number;
  } | null>(() => {
    const saved = localStorage.getItem('vyn_active_workout');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Summary state
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryEstimatedMinutes, setSummaryEstimatedMinutes] = useState(0);
  const [summaryActualSeconds, setSummaryActualSeconds] = useState(0);
  const [summaryType, setSummaryType] = useState('');
  const [summaryIntensity, setSummaryIntensity] = useState('Alta');
  const [forgotToStop, setForgotToStop] = useState(false);
  const [customCalories, setCustomCalories] = useState('');
  const [summaryKmMeta, setSummaryKmMeta] = useState<number | undefined>(undefined);
  const [summaryKmActual, setSummaryKmActual] = useState('5.0');

  // Overtime notification states
  const [overtimeNotified, setOvertimeNotified] = useState(false);
  const [showOvertimeToast, setShowOvertimeToast] = useState(false);

  // Persist active workout
  useEffect(() => {
    if (activeWorkout) {
      localStorage.setItem('vyn_active_workout', JSON.stringify(activeWorkout));
    } else {
      localStorage.removeItem('vyn_active_workout');
    }
  }, [activeWorkout]);

  // Active workout timer tick
  useEffect(() => {
    if (!activeWorkout) {
      setElapsedSeconds(0);
      setOvertimeNotified(false);
      setShowOvertimeToast(false);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.floor((now - activeWorkout.startTime) / 1000);
      setElapsedSeconds(diff > 0 ? diff : 0);

      // Check for overtime and alert once
      const limitSeconds = activeWorkout.estimatedMinutes * 60;
      if (diff > limitSeconds) {
        setOvertimeNotified((prev) => {
          if (!prev) {
            setShowOvertimeToast(true);
          }
          return true;
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeWorkout]);

  const isDistanceActivity = (type: string) => {
    return ['Corrida', 'Ciclismo', 'Natação', 'Futevôlei'].includes(type);
  };

  const getEstimatedCalories = (minutes: number, type: string, intensity: string) => {
    let baseFactor = 7; // standard default
    const normalizedType = type.toLowerCase();
    if (normalizedType.includes('musculação') || normalizedType.includes('academia')) {
      baseFactor = 6;
    } else if (normalizedType.includes('corrida')) {
      baseFactor = 10;
    } else if (normalizedType.includes('futevôlei') || normalizedType.includes('futebol')) {
      baseFactor = 8;
    } else if (normalizedType.includes('natação')) {
      baseFactor = 9;
    } else if (normalizedType.includes('yoga')) {
      baseFactor = 4;
    } else if (normalizedType.includes('crossfit')) {
      baseFactor = 12;
    } else if (normalizedType.includes('ciclismo') || normalizedType.includes('bike')) {
      baseFactor = 8;
    }
    
    let intensityFactor = 1.0;
    if (intensity === 'Baixa') {
      intensityFactor = 0.7;
    } else if (intensity === 'Intensa') {
      intensityFactor = 1.3;
    }

    return Math.round(minutes * baseFactor * intensityFactor);
  };

  const handleStartWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    const estMin = parseInt(estimatedMinutes, 10) || 45;
    const finalType = liveWorkoutType === 'Outro' ? (liveCustomType || 'Esporte Personalizado') : liveWorkoutType;

    const newActive = {
      startTime: Date.now(),
      estimatedMinutes: estMin,
      type: finalType,
      intensity: liveIntensity,
      kmMeta: isDistanceActivity(finalType) ? (parseFloat(liveKmMeta) || 5.0) : undefined
    };

    setActiveWorkout(newActive);
    setOvertimeNotified(false);
    setShowOvertimeToast(false);
    setShowStartModal(false);
    setLiveCustomType('');
  };

  const handleStopWorkout = () => {
    if (!activeWorkout) return;
    
    setSummaryEstimatedMinutes(activeWorkout.estimatedMinutes);
    setSummaryActualSeconds(elapsedSeconds);
    setSummaryType(activeWorkout.type);
    setSummaryIntensity(activeWorkout.intensity);
    setForgotToStop(false);

    if (activeWorkout.kmMeta !== undefined) {
      setSummaryKmMeta(activeWorkout.kmMeta);
      setSummaryKmActual(activeWorkout.kmMeta.toString());
    } else {
      setSummaryKmMeta(undefined);
      setSummaryKmActual('');
    }
    
    // Default dynamic calories estimation
    const actualMinutes = Math.round(elapsedSeconds / 60) || 1;
    const calculatedKcal = getEstimatedCalories(actualMinutes, activeWorkout.type, activeWorkout.intensity);
    setCustomCalories(calculatedKcal.toString());
    
    setShowSummaryModal(true);
    setActiveWorkout(null); // stop active tracking
  };

  const handleConfirmSummary = () => {
    const isForgot = forgotToStop;
    
    // If user forgot to stop, the exceeding time is disregarded, saving only the original estimated minutes!
    const finalMinutes = isForgot 
      ? summaryEstimatedMinutes 
      : Math.floor(summaryActualSeconds / 60) || 1;
      
    const finalCalories = isForgot 
      ? getEstimatedCalories(summaryEstimatedMinutes, summaryType, summaryIntensity)
      : (parseInt(customCalories, 10) || getEstimatedCalories(finalMinutes, summaryType, summaryIntensity));

    const finalKmActual = summaryKmMeta !== undefined ? (parseFloat(summaryKmActual) || 0) : undefined;
    const finalKmMeta = summaryKmMeta;

    const newWorkout: Workout = {
      id: `w-${Date.now()}`,
      type: summaryType,
      timeMinutes: finalMinutes,
      caloriesBurned: finalCalories,
      intensity: summaryIntensity,
      icon: summaryType === 'Corrida' ? 'directions_run' : summaryType === 'Yoga Transcendente' ? 'self_improvement' : 'fitness_center',
      color: summaryType === 'Corrida' ? '#ba1a1a' : summaryType === 'Yoga Transcendente' ? '#006c49' : '#004ac6',
      dateString: new Date().toISOString().split('T')[0],
      kmMeta: finalKmMeta,
      kmActual: finalKmActual
    };

    const updatedCalories = state.ringCalories + finalCalories;
    const updatedMinutes = state.ringMinutes + finalMinutes;
    const updatedStand = state.ringStand + 1;

    onStateChange({
      ...state,
      workouts: [newWorkout, ...state.workouts],
      ringCalories: updatedCalories,
      ringMinutes: updatedMinutes,
      ringStand: updatedStand,
    });

    setShowSummaryModal(false);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const pad = (n: number) => String(n).padStart(2, '0');
    
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

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
      dateString: new Date().toISOString().split('T')[0]
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

  const getWorkoutDateString = (w: Workout) => {
    if (w.dateString) return w.dateString;
    if (w.id && w.id.startsWith('w-')) {
      const ts = parseInt(w.id.substring(2), 10);
      if (!isNaN(ts)) {
        return new Date(ts).toISOString().split('T')[0];
      }
    }
    return '';
  };

  const getWeekDates = () => {
    const today = new Date();
    const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayDiff = day === 0 ? -6 : 1 - day;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayDiff);
    monday.setHours(0, 0, 0, 0);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const current = new Date(monday);
      current.setDate(monday.getDate() + i);
      dates.push(current.toISOString().split('T')[0]);
    }
    return dates;
  };

  const currentWeekDates = getWeekDates();
  const weekDaysLabels = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
  
  const weeklyData = currentWeekDates.map((dateStr, index) => {
    const dayWorkouts = state.workouts.filter(w => getWorkoutDateString(w) === dateStr);
    const hasWorkout = dayWorkouts.length > 0;
    const totalMinutes = dayWorkouts.reduce((sum, w) => sum + w.timeMinutes, 0);
    const goal = state.ringMinutesGoal || 30;
    const heightPercent = Math.min(100, Math.round((totalMinutes / goal) * 100));
    
    return {
      label: weekDaysLabels[index],
      dateStr,
      hasWorkout,
      heightPercent,
      totalMinutes,
    };
  });

  // Ring offset calculations
  const calPercent = state.ringCalories / state.ringCaloriesGoal;
  const minPercent = state.ringMinutes / state.ringMinutesGoal;
  const standPercent = state.ringStand / state.ringStandGoal;

  const calStrokeOffset = 439.8 * (1 - Math.min(1, calPercent));
  const minStrokeOffset = 339.3 * (1 - Math.min(1, minPercent));
  const standStrokeOffset = 238.7 * (1 - Math.min(1, standPercent));

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-24 relative">
      {/* Overtime real-time notification banner */}
      {showOvertimeToast && activeWorkout && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 max-w-sm w-[92%] bg-gradient-to-r from-red-600 to-amber-600 text-white p-4 rounded-2xl shadow-2xl z-[100] flex items-center justify-between gap-3 border border-amber-500/30 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-200 shrink-0 animate-pulse" />
            <div>
              <p className="font-extrabold text-xs uppercase tracking-widest text-amber-200">Alerta de Tempo!</p>
              <p className="text-xs font-bold leading-normal mt-0.5">
                Você estourou a meta de {activeWorkout.estimatedMinutes} minutos no seu treino de {activeWorkout.type}!
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowOvertimeToast(false)}
            className="bg-white/20 hover:bg-white/30 text-white font-black px-3 py-1.5 rounded-xl text-[10px] shrink-0 transition-all cursor-pointer hover:scale-105 active:scale-95 uppercase tracking-wider"
          >
            Ok
          </button>
        </div>
      )}

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

      {/* Active Workout Timer Panel or Start Workout Button */}
      {!activeWorkout ? (
        <div className="space-y-3">
          <button 
            onClick={() => setShowStartModal(true)}
            className="w-full py-4 bg-primary text-white rounded-[20px] font-semibold shadow-[0px_15px_30px_rgba(0,74,198,0.2)] hover:bg-opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" /> Iniciar Treino
          </button>
          
          <button
            onClick={() => setShowLogModal(true)}
            className="w-full text-center text-xs text-primary font-bold hover:underline transition-all cursor-pointer block"
          >
            Registrar treino concluído manualmente
          </button>
        </div>
      ) : (
        /* Active Workout Card Panel */
        <div className={`glass-card rounded-[24px] p-5 border transition-all duration-500 relative overflow-hidden ${
          elapsedSeconds > (activeWorkout.estimatedMinutes * 60)
            ? 'bg-gradient-to-tr from-[#fffbeb] to-[#fff3cd] dark:from-amber-950/20 dark:to-amber-900/10 border-amber-300 dark:border-amber-800/60 shadow-[0_8px_30px_rgba(245,158,11,0.15)] animate-pulse'
            : 'bg-gradient-to-tr from-blue-50/50 to-indigo-50/30 dark:from-slate-900/40 dark:to-blue-950/20 border-blue-100 dark:border-blue-900/30'
        }`}>
          {/* Subtle background decoration */}
          <div className="absolute right-4 -bottom-4 opacity-[0.04] dark:opacity-[0.08] pointer-events-none">
            <Dumbbell className="w-32 h-32 text-on-surface" />
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3.5 w-3.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  elapsedSeconds > (activeWorkout.estimatedMinutes * 60)
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                  elapsedSeconds > (activeWorkout.estimatedMinutes * 60)
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}></span>
              </span>
              <h4 className="text-xs font-black text-on-surface uppercase tracking-widest">
                Treino em Andamento
              </h4>
            </div>

            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
              elapsedSeconds > (activeWorkout.estimatedMinutes * 60)
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
            }`}>
              {activeWorkout.intensity}
            </span>
          </div>

          <div className="text-center py-4 space-y-1">
            <p className="text-xs font-bold text-on-surface-variant flex items-center justify-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-primary" /> {activeWorkout.type}
            </p>
            <div className={`text-4xl font-black font-mono tracking-wider transition-colors duration-300 ${
              elapsedSeconds > (activeWorkout.estimatedMinutes * 60)
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : 'text-primary dark:text-blue-400'
            }`}>
              {formatTime(elapsedSeconds)}
            </div>
            
            {/* Visual limit warning or meta info */}
            {elapsedSeconds > (activeWorkout.estimatedMinutes * 60) ? (
              <div className="text-xs text-amber-700 dark:text-amber-400 font-black flex items-center justify-center gap-1 mt-1">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-bounce" />
                Limite excedido por {formatTime(elapsedSeconds - (activeWorkout.estimatedMinutes * 60))}!
              </div>
            ) : (
              <p className="text-[11px] font-bold text-on-surface-variant">
                Meta: {activeWorkout.estimatedMinutes} min ({formatTime(activeWorkout.estimatedMinutes * 60)})
              </p>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                elapsedSeconds > (activeWorkout.estimatedMinutes * 60)
                  ? 'bg-amber-500'
                  : 'bg-primary'
              }`}
              style={{ width: `${Math.min(100, (elapsedSeconds / (activeWorkout.estimatedMinutes * 60)) * 100)}%` }}
            />
          </div>

          <button 
            type="button"
            onClick={handleStopWorkout}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-md shadow-red-600/10"
          >
            <span className="w-2.5 h-2.5 bg-white rounded-sm shrink-0" /> Parar Treino
          </button>
        </div>
      )}

      {/* Recent Activities Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-base font-bold text-on-surface dark:text-white">Atividades Recentes</h3>
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
                  <h4 className="text-sm font-bold text-on-surface dark:text-white">{w.type}</h4>
                  <div className="flex gap-2.5 text-xs text-on-surface-variant font-medium mt-0.5 items-center">
                    <span>{w.timeMinutes} min</span>
                    <span className="text-[#c3c6d7]">•</span>
                    <span>{w.caloriesBurned} kcal</span>
                    {w.kmActual !== undefined && w.kmActual > 0 && (
                      <>
                        <span className="text-[#c3c6d7]">•</span>
                        <span className="text-primary dark:text-blue-400 font-extrabold flex items-center gap-0.5 bg-primary/10 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg text-[11px]">
                          <Footprints className="w-3.5 h-3.5 shrink-0" /> {w.kmActual} KM
                        </span>
                      </>
                    )}
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
          {/* Real dynamic bar layouts */}
          {weeklyData.map((day, idx) => {
            const isToday = day.dateStr === new Date().toISOString().split('T')[0];
            const barColor = day.hasWorkout
              ? 'bg-gradient-to-t from-primary to-indigo-500'
              : 'bg-[#004ac6]/10 dark:bg-slate-800';
              
            return (
              <div key={idx} className="w-full bg-[#e7e7f3] dark:bg-slate-900 rounded-t-full relative group h-full flex flex-col justify-end">
                {/* Tooltip on hover */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-md">
                  {day.totalMinutes} min
                </div>
                
                <div 
                  className={`w-full rounded-t-full transition-all duration-[800ms] ${barColor}`} 
                  style={{ height: `${day.hasWorkout ? Math.max(15, day.heightPercent) : 0}%` }} 
                />
              </div>
            );
          })}
        </div>
        
        {/* Days labels with circular/pill indicators */}
        <div className="flex justify-between items-center text-[9px] font-bold text-[#737686] px-1 pt-1">
          {weeklyData.map((day, idx) => {
            const isToday = day.dateStr === new Date().toISOString().split('T')[0];
            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 w-full">
                {/* Círculo/indicador do dia da semana */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] transition-all ${
                  day.hasWorkout 
                    ? 'bg-primary text-white shadow-sm shadow-primary/30 font-black' 
                    : isToday
                      ? 'border-2 border-primary text-primary dark:text-blue-400 font-extrabold'
                      : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400'
                }`}>
                  {day.label[0]}
                </div>
                <span className={`text-[8px] tracking-wider font-extrabold ${isToday ? 'text-primary dark:text-blue-400 font-black' : 'text-slate-400'}`}>
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Workout Logger Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 max-w-sm w-full space-y-4 shadow-xl border border-[#c3c6d7]/30 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-on-surface dark:text-white">Registrar Treino Manual</h3>
              <button 
                onClick={() => setShowLogModal(false)}
                className="text-[#737686] font-bold hover:text-on-surface dark:hover:text-white text-xl p-1"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddWorkout} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#434655] dark:text-slate-300 ml-1">Tipo de Treino</label>
                <select 
                  value={workoutType} 
                  onChange={(e) => setWorkoutType(e.target.value)}
                  className="w-full bg-[#f3f4f6] dark:bg-slate-800 rounded-xl px-3 py-2 text-sm border-none focus:ring-1 focus:ring-primary focus:bg-white dark:text-white"
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
                  <label className="text-xs font-bold text-[#434655] dark:text-slate-300 ml-1">Nome do Esporte</label>
                  <input 
                    type="text" 
                    value={customType} 
                    onChange={(e) => setCustomType(e.target.value)}
                    placeholder="Ex: Beach Tennis, Futebol..."
                    required
                    className="w-full bg-[#f3f4f6] dark:bg-slate-800 rounded-xl px-3 py-2 text-sm border-none focus:ring-1 focus:ring-primary focus:bg-white focus:outline-none dark:text-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#434655] dark:text-slate-300 ml-1">Duração (min)</label>
                  <input 
                    type="number" 
                    value={duration} 
                    onChange={(e) => setDuration(e.target.value)}
                    required
                    min="1"
                    className="w-full bg-[#f3f4f6] dark:bg-slate-800 rounded-xl px-3 py-2 text-sm border-none focus:ring-1 focus:ring-primary focus:bg-white dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#434655] dark:text-slate-300 ml-1">Calorias (kcal)</label>
                  <input 
                    type="number" 
                    value={calories} 
                    onChange={(e) => setCalories(e.target.value)}
                    required
                    min="1"
                    className="w-full bg-[#f3f4f6] dark:bg-slate-800 rounded-xl px-3 py-2 text-sm border-none focus:ring-1 focus:ring-primary focus:bg-white dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#434655] dark:text-slate-300 ml-1">Intensidade</label>
                <select 
                  value={intensity} 
                  onChange={(e) => setIntensity(e.target.value)}
                  className="w-full bg-[#f3f4f6] dark:bg-slate-800 rounded-xl px-3 py-2 text-sm border-none focus:ring-1 focus:ring-primary dark:text-white"
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

      {/* Start Workout Modal with Limit Time Definition */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 max-w-sm w-full space-y-4 shadow-2xl border border-[#c3c6d7]/30 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">Iniciar Novo Treino</h3>
              <button 
                onClick={() => setShowStartModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-xl p-1"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleStartWorkout} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#434655] dark:text-slate-300 ml-1">Tipo de Treino</label>
                <select 
                  value={liveWorkoutType} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setLiveWorkoutType(val);
                  }}
                  className="w-full bg-[#f3f4f6] dark:bg-slate-800 rounded-xl px-3 py-2 text-sm border-none focus:ring-1 focus:ring-primary dark:text-white"
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

              {liveWorkoutType === 'Outro' && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-xs font-bold text-[#434655] dark:text-slate-300 ml-1">Nome do Esporte</label>
                  <input 
                    type="text" 
                    value={liveCustomType} 
                    onChange={(e) => setLiveCustomType(e.target.value)}
                    placeholder="Ex: Beach Tennis, Futebol..."
                    required
                    className="w-full bg-[#f3f4f6] dark:bg-slate-800 rounded-xl px-3 py-2 text-sm border-none focus:ring-1 focus:ring-primary focus:outline-none dark:text-white"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#434655] dark:text-slate-300 ml-1">
                  Tempo Limite Estimado (minutos)
                </label>
                <input 
                  type="number" 
                  value={estimatedMinutes} 
                  onChange={(e) => setEstimatedMinutes(e.target.value)}
                  required
                  min="1"
                  max="480"
                  placeholder="Ex: 45"
                  className="w-full bg-[#f3f4f6] dark:bg-slate-800 rounded-xl px-3 py-2 text-sm border-none focus:ring-1 focus:ring-primary dark:text-white"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">
                  O cronômetro mudará de cor com alerta de atraso se passar deste tempo.
                </p>
              </div>

              {/* Conditional KM Meta Field */}
              {isDistanceActivity(liveWorkoutType) && (
                <div className="space-y-1 animate-fade-in bg-primary/5 dark:bg-blue-900/10 p-3 rounded-2xl border border-primary/10">
                  <label className="text-xs font-bold text-primary dark:text-blue-400 ml-1 flex items-center gap-1">
                    <Footprints className="w-4 h-4 shrink-0" /> Meta de Distância (KM)
                  </label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={liveKmMeta} 
                    onChange={(e) => setLiveKmMeta(e.target.value)}
                    required
                    min="0.1"
                    max="99"
                    placeholder="Ex: 5.0"
                    className="w-full bg-white dark:bg-slate-800 rounded-xl px-3 py-2 text-sm border-none focus:ring-1 focus:ring-primary dark:text-white font-extrabold"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">
                    Defina uma meta de distância em quilômetros para essa atividade.
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#434655] dark:text-slate-300 ml-1">Intensidade</label>
                <select 
                  value={liveIntensity} 
                  onChange={(e) => setLiveIntensity(e.target.value)}
                  className="w-full bg-[#f3f4f6] dark:bg-slate-800 rounded-xl px-3 py-2 text-sm border-none focus:ring-1 focus:ring-primary dark:text-white"
                >
                  <option value="Baixa">Baixa (Recuperação)</option>
                  <option value="Alta">Alta (Padrão)</option>
                  <option value="Intensa">Intensa (Esforço Máximo)</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:opacity-95 active:scale-95 transition-all mt-2 cursor-pointer shadow-md shadow-primary/20"
              >
                Confirmar e Iniciar Treino
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Stop Workout Summary and Justification Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 max-w-sm w-full space-y-4 shadow-2xl border border-[#c3c6d7]/30 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">Resumo do Treino</h3>
              <button 
                onClick={() => setShowSummaryModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-xl p-1"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center border border-slate-100/50 dark:border-slate-800/30">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Tempo Estimado
                  </span>
                  <p className="text-base font-extrabold text-slate-800 dark:text-white mt-1">
                    {summaryEstimatedMinutes} min
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center border border-slate-100/50 dark:border-slate-800/30">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Tempo Real
                  </span>
                  <p className="text-base font-extrabold text-slate-800 dark:text-white mt-1">
                    {formatTime(summaryActualSeconds)}
                  </p>
                </div>
              </div>

              {/* Time Exceeded logic & justification check */}
              {(() => {
                const limitSeconds = summaryEstimatedMinutes * 60;
                const exceeded = summaryActualSeconds - limitSeconds;
                
                if (exceeded > 0) {
                  return (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl space-y-3">
                      <div className="flex items-start gap-2.5">
                        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-black text-amber-800 dark:text-amber-300">
                            Tempo Excedente Detectado
                          </p>
                          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold leading-relaxed mt-0.5">
                            Você treinou por {formatTime(exceeded)} a mais do que o estimado.
                          </p>
                        </div>
                      </div>

                      {/* Forgetfulness checkbox */}
                      <label className="flex items-start gap-2.5 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-200/50 dark:border-amber-900/40 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={forgotToStop}
                          onChange={(e) => setForgotToStop(e.target.checked)}
                          className="w-4 h-4 text-amber-600 rounded border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-amber-500 mt-0.5 cursor-pointer"
                        />
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Esqueci de parar o treino
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-medium normal-case leading-normal mt-0.5">
                            O excesso de tempo será desconsiderado, salvando apenas o estimado original ({summaryEstimatedMinutes} min).
                          </span>
                        </div>
                      </label>
                    </div>
                  );
                } else {
                  return (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-center gap-2">
                      <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <p className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                        Dentro do tempo estimado! Foco perfeito!
                      </p>
                    </div>
                  );
                }
              })()}

              {/* Conditional KM Actual Input Field */}
              {summaryKmMeta !== undefined && (
                <div className="space-y-1 bg-blue-50/50 dark:bg-blue-950/10 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-900/30 animate-fade-in">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-extrabold text-primary dark:text-blue-400 ml-1 flex items-center gap-1.5">
                      <Footprints className="w-4 h-4 shrink-0" /> Distância Alcançada (KM)
                    </label>
                    <span className="text-[10px] font-black bg-primary/15 text-primary dark:text-blue-400 px-2 py-0.5 rounded-lg">
                      Meta: {summaryKmMeta} KM
                    </span>
                  </div>
                  <input 
                    type="number"
                    step="0.1"
                    value={summaryKmActual}
                    onChange={(e) => setSummaryKmActual(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 rounded-xl px-3 py-2 text-sm border-none focus:ring-1 focus:ring-primary dark:text-white font-extrabold text-center"
                    placeholder="Ex: 5.2"
                    required
                    min="0.1"
                  />
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center mt-1">
                    Informe o KM total percorrido para salvar no histórico da corrida.
                  </p>
                </div>
              )}

              {/* Calories burned */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#434655] dark:text-slate-300 ml-1">Calorias Queimadas (kcal)</label>
                <input 
                  type="number"
                  value={customCalories}
                  onChange={(e) => setCustomCalories(e.target.value)}
                  className="w-full bg-[#f3f4f6] dark:bg-slate-800 rounded-xl px-3 py-2 text-sm border-none focus:ring-1 focus:ring-primary dark:text-white font-bold"
                  placeholder="Ex: 350"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">
                  Ajuste a estimativa automática, se necessário.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Deseja realmente descartar o registro deste treino?')) {
                      setShowSummaryModal(false);
                    }
                  }}
                  className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold rounded-xl text-xs active:scale-95 transition-all cursor-pointer border border-slate-100 dark:border-slate-700"
                >
                  Descartar
                </button>
                <button 
                  onClick={handleConfirmSummary}
                  className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs active:scale-95 transition-all cursor-pointer shadow-md shadow-emerald-600/10"
                >
                  Confirmar e Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
