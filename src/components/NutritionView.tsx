import React, { useState } from 'react';
import { 
  Droplet, 
  Plus, 
  Check, 
  Calendar, 
  Utensils, 
  Coffee, 
  Camera, 
  Heart, 
  CheckCircle 
} from 'lucide-react';
import { AppState, Meal } from '../types';

interface NutritionViewProps {
  state: AppState;
  onStateChange: (newState: AppState) => void;
  onNavigate?: (screen: any) => void;
}

export default function NutritionView({ state, onStateChange, onNavigate }: NutritionViewProps) {
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState<'Café da Manhã' | 'Almoço' | 'Lanche' | 'Jantar'>('Café da Manhã');
  const [mealCalories, setMealCalories] = useState('350');
  const [mealProtein, setMealProtein] = useState('20');
  const [mealCarbs, setMealCarbs] = useState('40');
  const [mealFat, setMealFat] = useState('10');
  const [mealTime, setMealTime] = useState('14:00');

  const [weightGoal, setWeightGoal] = useState((state.weightGoal || 70).toString());
  const [height, setHeight] = useState((state.profile.height || 175).toString());
  const [waterGoal, setWaterGoal] = useState((state.waterIntakeGoalCups || 8).toString());

  const handleUpdateHealthGoals = () => {
    onStateChange({
      ...state,
      weightGoal: parseFloat(weightGoal) || 70,
      waterIntakeGoalCups: parseInt(waterGoal, 10) || 8,
      profile: {
        ...state.profile,
        height: parseInt(height, 10) || 175
      }
    });
  };

  // Toggle meal completion and recalculate calories consumed
  const handleToggleMeal = (id: string) => {
    const updatedMeals = state.meals.map(m => 
      m.id === id ? { ...m, completed: !m.completed } : m
    );

    // Calculate updated progress
    const activeMeals = updatedMeals.filter(m => m.completed).length;
    const progress = Math.round(((activeMeals / updatedMeals.length) + (state.waterIntakeCups / state.waterIntakeGoalCups)) / 2 * 100);

    onStateChange({
      ...state,
      meals: updatedMeals,
      dailyProgressPercentage: progress
    });
  };

  const handleAddCustomMeal = (e: React.FormEvent) => {
    e.preventDefault();
    const cals = parseInt(mealCalories, 10) || 300;
    const prot = parseInt(mealProtein, 10) || 15;
    const carbs = parseInt(mealCarbs, 10) || 35;
    const fat = parseInt(mealFat, 10) || 8;

    // Use default high-fidelity food images based on type
    let img = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnMo1_ditdcg4kraeamFWihjeJneozLpycbDtUcl3g-PBQLxed2U1ht--GNkMmbhEOKc4oL_v1Y1aXGoykyH3G0mH7qy8pv8fAF8rzq_6b-Hn8lf0djmPsNjIQyre_Xx_ZI-Ml6fxWhP12BhTa7RGWgL6Q5EeO6p8-m7yTmfZhmWP_Avq7eiyY8scuq-V26NOwxaXaQLHUI0bK4e63XBK8qyQs4w9gnxBrgR-V_TX9MmMIkHZqNfM4a0CjmB43IiXYeqfcZpjophXr';
    if (mealType === 'Almoço') {
      img = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUqVG3nI5In6p0rd5WT9aXcDAMg8RId1IwSyclVDQL39V2LbcL_9Mi6sX7M8g-cSzhPoFiYZyhEHjS14oSo26aT2IECHaelrOFu5RDMOWVAI5K4OSbtCNoYulOWYXx8zVR3kHVmjhCN_HsA8jajgk1n3TNDrfwiUbUOr6DQ5OC596xUyWeVQqhAfAxPJp71R4pLD8ONM9tdQSfc382zeJhMzJWb5DkPTO5ZsFtjwHyS_lLs3IhIpCm_l4Sst4cQ_yiSRgTx0xxEVns';
    } else if (mealType === 'Lanche') {
      img = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUFD_miZa9uYhd3bWTI_F_vmaC5fEL5_u0kmRONCe41WY8iQk6COXuu3az_yotv87ygyE1JB8610nUqNzZ95HTIR8NsRO-zHpi_x-x6pOn2S6enwe52ulGlWm3E3NpiA5wM_t38Cwy2QyGq_VN_nPoEmLudVQkuj51PHaSwcO23hpTtUkTt1syrLmQWNNtKI9stMrk1eKDZRuaNkHv7JjKhSB2xBCK5a1Z_EUh0sNgFtM6qkdOuH8E7DOiK0z-Rta7__yuzswCsV6H';
    } else if (mealType === 'Jantar') {
      img = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDB-yRV2hBUQ-MqIyPt5Gj_eSa9xceNElPY654z0_CxifSEyl8Iv5AwIFfL28GxPFQSFD8F8LU_99e3PRtn4HuuVt63plyt-SD5h6bO22d3zsoyITgeugpPXHae7vjtpZ62rNuM2vtNuos0zRJCGmD3Zcu_NXFA-IuFTsYJZyayLTiJrEvgJl1GUsdJT880nrR4A-4V2QQjbHUzrxTD90ua6rWYC9-RPDRgDfp6IxfKM3RDHCKWpvhWPNW0kGUZMaEBerJtOFz64ndw';
    }

    const newMeal: Meal = {
      id: `meal-${Date.now()}`,
      type: mealType,
      time: mealTime,
      name: mealName || 'Refeição Personalizada',
      calories: cals,
      protein: prot,
      carbs: carbs,
      fat: fat,
      imageUrl: img,
      completed: true
    };

    onStateChange({
      ...state,
      meals: [...state.meals, newMeal]
    });

    setShowAddMealModal(false);
    setMealName('');
  };

  // Calculate consumed macros from completed meals
  const consumedCalories = state.meals.filter(m => m.completed).reduce((sum, m) => sum + m.calories, 0);
  const consumedProtein = state.meals.filter(m => m.completed).reduce((sum, m) => sum + m.protein, 0);
  const consumedCarbs = state.meals.filter(m => m.completed).reduce((sum, m) => sum + m.carbs, 0);
  const consumedFat = state.meals.filter(m => m.completed).reduce((sum, m) => sum + m.fat, 0);

  const calGoal = 2200;
  const progressRatio = consumedCalories / calGoal;
  const strokeOffset = 301.59 * (1 - Math.min(1, progressRatio));

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-24 animate-fade-in">
      {/* Header */}
      <section className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight text-on-surface">Saúde - Alimentação</h2>
        <p className="text-xs text-on-surface-variant">Terça-feira, 24 de Outubro</p>
      </section>

      {/* Health Goals Form */}
      <section className="glass-card p-6 rounded-[28px] space-y-4">
        <h4 className="text-xs font-bold text-[#737686] uppercase tracking-widest border-b border-[#c3c6d7]/20 pb-2 mb-2">
          Suas Metas de Saúde
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#434655] ml-1 flex items-center gap-1">Meta Peso (kg)</label>
            <input type="number" step="0.1" value={weightGoal} onChange={(e) => setWeightGoal(e.target.value)} className="w-full bg-[#f3f4f6] rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-1 focus:ring-primary focus:outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#434655] ml-1 flex items-center gap-1">Hidratação (copos)</label>
            <input type="number" value={waterGoal} onChange={(e) => setWaterGoal(e.target.value)} className="w-full bg-[#f3f4f6] rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-1 focus:ring-primary focus:outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#434655] ml-1 flex items-center gap-1">Altura (cm)</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full bg-[#f3f4f6] rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-1 focus:ring-primary focus:outline-none transition-all" />
          </div>
        </div>
        <button onClick={handleUpdateHealthGoals} className="w-full bg-[#2563eb] text-white py-3 rounded-xl font-bold hover:opacity-95 active:scale-95 transition-all cursor-pointer text-sm">
          Atualizar Metas
        </button>
      </section>

      {/* Summary Dashboard Card */}
      <section className="glass-card p-6 rounded-[24px] flex items-center justify-between shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
        
        <div className="flex-1 relative z-10">
          <h3 className="text-[10px] font-bold text-primary mb-1 uppercase tracking-widest">
            Resumo Diário
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-on-surface">
              {consumedCalories.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-[#737686] font-medium">/ {calGoal.toLocaleString('pt-BR')} kcal</span>
          </div>

          <div className="mt-4 flex gap-4">
            <div>
              <p className="text-[9px] font-bold text-[#737686] uppercase tracking-wider">Proteína</p>
              <p className="text-sm font-extrabold text-on-surface">{consumedProtein}g</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-[#737686] uppercase tracking-wider">Carbos</p>
              <p className="text-sm font-extrabold text-on-surface">{consumedCarbs}g</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-[#737686] uppercase tracking-wider">Gordura</p>
              <p className="text-sm font-extrabold text-[#737686]">{consumedFat}g</p>
            </div>
          </div>
        </div>

        {/* Circular Progress Ring matching mockup */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle 
              className="text-[#ededf9]" 
              cx="48" 
              cy="48" 
              fill="transparent" 
              r="40" 
              stroke="currentColor" 
              strokeWidth="6" 
            />
            <circle 
              className="text-primary transition-all duration-[1000ms] ease-out" 
              cx="48" 
              cy="48" 
              fill="transparent" 
              r="40" 
              stroke="currentColor" 
              strokeDasharray="251.2" 
              strokeDashoffset={251.2 * (1 - Math.min(1, progressRatio))} 
              strokeLinecap="round" 
              strokeWidth="8" 
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-sm font-extrabold text-on-surface">
              {Math.round(progressRatio * 100)}%
            </span>
          </div>
        </div>
      </section>

      {/* Hydration tracker glass-card with rising water animation */}
      <section className="glass-card p-5 rounded-[24px] border-l-4 border-l-blue-500 shadow-sm relative overflow-hidden" id="hydration-block">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-800">Hidratação Diária</h3>
            <p className="text-xs text-slate-500 font-bold">Meta: 3.0L • Restam {Math.max(0, 3.0 - (state.waterIntakeCups * 0.25)).toFixed(2)}L</p>
          </div>
          <Droplet className="w-5.5 h-5.5 text-blue-500 animate-pulse" />
        </div>

        <div className="flex gap-6 items-center">
          {/* Stunning Interactive Rising Liquid Glass Cup */}
          <div className="relative w-20 h-32 bg-blue-100/40 rounded-2xl border-2 border-blue-200/50 overflow-hidden shadow-inner flex flex-col justify-end shrink-0">
            {/* Liquid wave representation */}
            <div 
              className="bg-gradient-to-t from-blue-600 to-blue-400 w-full rounded-b-xl transition-all duration-700 ease-out relative" 
              style={{ height: `${Math.min(100, (state.waterIntakeCups / state.waterIntakeGoalCups) * 100)}%` }}
            >
              {/* Liquid shine glare */}
              <div className="absolute inset-y-0 left-2 w-1.5 bg-white/20 blur-xs rounded-full" />
              {/* Liquid surface indicator */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-300/60 blur-xs" />
            </div>
            {/* Absolute indicator */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none z-10 mix-blend-difference">
              <span className="text-sm font-black text-white">{(state.waterIntakeCups * 0.25).toFixed(2)}L</span>
              <span className="text-[8px] font-bold text-blue-100 uppercase tracking-widest">{state.waterIntakeCups} / {state.waterIntakeGoalCups} copos</span>
            </div>
          </div>

          {/* Quick Adjustment Action Panel */}
          <div className="flex-1 space-y-3.5">
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Toque nos botões para ajustar o consumo em copos de <span className="font-bold text-slate-800">250ml</span>. Acompanhe o copo subir em tempo real.
            </p>
            <div className="flex gap-2.5">
              <button 
                onClick={() => {
                  const nextWater = Math.max(0, state.waterIntakeCups - 1);
                  onStateChange({
                    ...state,
                    waterIntakeCups: nextWater
                  });
                }}
                disabled={state.waterIntakeCups === 0}
                className="flex-1 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-black hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer text-xs"
              >
                - Copo
              </button>
              <button 
                onClick={() => {
                  const nextWater = Math.min(state.waterIntakeGoalCups, state.waterIntakeCups + 1);
                  onStateChange({
                    ...state,
                    waterIntakeCups: nextWater
                  });
                }}
                className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black transition-all cursor-pointer text-xs shadow-sm shadow-blue-600/10"
              >
                + Copo
              </button>
            </div>
          </div>
        </div>

        {/* Small subtle track bar */}
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-4">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(100, (state.waterIntakeCups / state.waterIntakeGoalCups) * 100)}%` }}
          />
        </div>
      </section>

      {/* Meal Plan Checklist Header */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-on-surface">Plano de Refeições</h3>
          <button 
            type="button" 
            onClick={() => onNavigate && onNavigate('agenda')}
            className="text-xs font-bold text-blue-600 uppercase tracking-widest cursor-pointer hover:text-blue-700 font-sans"
          >
            Ver Calendário
          </button>
        </div>

        {/* Dynamic completed / uncompleted meal cards */}
        <div className="space-y-4">
          {state.meals.map((meal) => {
            return (
              <div 
                key={meal.id} 
                className={`glass-card rounded-[24px] overflow-hidden transition-all duration-300 ${
                  meal.completed ? 'opacity-100 border-[#6cf8bb]/40' : 'opacity-65'
                }`}
              >
                {/* Food Image Box */}
                <div className="relative h-32 w-full">
                  <img 
                    src={meal.imageUrl} 
                    alt={meal.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  <div className="absolute bottom-3 left-4 text-white">
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-80">{meal.time}</p>
                    <h4 className="text-sm font-bold">{meal.type}</h4>
                  </div>

                  {/* Absolute positioning checkmark button */}
                  <button 
                    onClick={() => handleToggleMeal(meal.id)}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer ${
                      meal.completed 
                        ? 'bg-[#10b981] text-white' 
                        : 'bg-white/20 text-white hover:bg-white/40'
                    }`}
                  >
                    {meal.completed ? <Check className="w-4 h-4 stroke-[3px]" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>

                {/* Macro detail specs footer */}
                <div className="p-4 flex justify-between items-center bg-white/45">
                  <div>
                    <p className="text-xs text-on-surface font-semibold">{meal.name}</p>
                    <p className="text-[10px] font-bold text-primary mt-0.5">{meal.calories} kcal</p>
                  </div>

                  <div className="flex gap-4 text-right">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-[#737686] uppercase">P</span>
                      <span className="text-xs text-on-surface font-medium">{meal.protein}g</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-[#737686] uppercase">C</span>
                      <span className="text-xs text-on-surface font-medium">{meal.carbs}g</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-[#737686] uppercase">G</span>
                      <span className="text-xs text-on-surface font-medium">{meal.fat}g</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Plus CTA to log foods */}
      <button 
        onClick={() => setShowAddMealModal(true)}
        className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-[0px_10px_25px_rgba(0,74,198,0.2)] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-sm"
      >
        <Plus className="w-4 h-4" /> Registrar Nova Refeição
      </button>

      {/* Modal interface popup to add custom foods */}
      {showAddMealModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-[28px] p-6 max-w-sm w-full space-y-4 shadow-xl border border-[#c3c6d7]/30">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-on-surface">Nova Refeição</h3>
              <button 
                onClick={() => setShowAddMealModal(false)}
                className="text-[#737686] font-bold hover:text-on-surface text-xl p-1"
                type="button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddCustomMeal} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#434655] ml-1">Nome do Alimento</label>
                <input 
                  type="text" 
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="Ex: Tapioca com Frango"
                  required
                  className="w-full bg-[#f3f4f6] rounded-xl px-3 py-2 text-sm border-none focus:ring-1 focus:ring-primary focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#434655] ml-1">Categoria</label>
                <select 
                  value={mealType} 
                  onChange={(e: any) => setMealType(e.target.value)}
                  className="w-full bg-[#f3f4f6] rounded-xl px-3 py-2 text-sm border-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Café da Manhã">Café da Manhã</option>
                  <option value="Almoço">Almoço</option>
                  <option value="Lanche">Lanche</option>
                  <option value="Jantar">Jantar</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#434655] ml-1">Calorias (kcal)</label>
                  <input 
                    type="number" 
                    value={mealCalories} 
                    onChange={(e) => setMealCalories(e.target.value)}
                    required
                    className="w-full bg-[#f3f4f6] rounded-xl px-3 py-2 text-sm border-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#434655] ml-1">Proteínas (g)</label>
                  <input 
                    type="number" 
                    value={mealProtein} 
                    onChange={(e) => setMealProtein(e.target.value)}
                    required
                    className="w-full bg-[#f3f4f6] rounded-xl px-3 py-2 text-sm border-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#434655] ml-1">Carbos (g)</label>
                  <input 
                    type="number" 
                    value={mealCarbs} 
                    onChange={(e) => setMealCarbs(e.target.value)}
                    required
                    className="w-full bg-[#f3f4f6] rounded-xl px-3 py-2 text-sm border-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#434655] ml-1">Gorduras (g)</label>
                  <input 
                    type="number" 
                    value={mealFat} 
                    onChange={(e) => setMealFat(e.target.value)}
                    required
                    className="w-full bg-[#f3f4f6] rounded-xl px-3 py-2 text-sm border-none"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:opacity-95 active:scale-95 transition-all mt-2 cursor-pointer"
              >
                Adicionar ao Plano
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
