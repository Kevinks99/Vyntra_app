import React, { useState } from 'react';
import { 
  Calendar, 
  Search, 
  Plus, 
  Bell, 
  BellOff, 
  MapPin, 
  Clock, 
  ChevronLeft, 
  X,
  Sparkles,
  Info
} from 'lucide-react';
import { AppState, AgendaEvent } from '../types';

interface AgendaViewProps {
  state: AppState;
  onStateChange: (newState: AppState) => void;
}

const getTodayStr = () => {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getDaysOfCurrentWeek = () => {
  const days = [];
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0-6 (Sunday is 0)
  const mondayDiff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayDiff);

  const DAY_NAMES_PT = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dateNum = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${dateNum}`;
    days.push({
      dayName: DAY_NAMES_PT[i],
      dayNum: String(d.getDate()),
      dateStr
    });
  }
  return days;
};

export default function AgendaView({ state, onStateChange }: AgendaViewProps) {
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');

  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());

  const WEEK_DAYS = getDaysOfCurrentWeek();

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Academia');
  const [time, setTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:30');
  const [location, setLocation] = useState('');
  const [alertEnabled, setAlertEnabled] = useState(false);

  const filteredEvents = (state.agendaEvents || []).filter(
    (e) => e.dateString === selectedDate
  ).sort((a, b) => a.time.localeCompare(b.time));

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newEvent: AgendaEvent = {
      id: 'event-' + Date.now(),
      dateString: selectedDate,
      time,
      endTime,
      category,
      title,
      locationOrMode: location || undefined,
      alertEnabled
    };

    onStateChange({
      ...state,
      agendaEvents: [...(state.agendaEvents || []), newEvent]
    });

    // Reset Form
    setTitle('');
    setCategory('Academia');
    setTime('08:00');
    setEndTime('09:30');
    setLocation('');
    setAlertEnabled(false);
    setShowAddModal(false);
  };

  const handleDeleteEvent = (id: string) => {
    onStateChange({
      ...state,
      agendaEvents: (state.agendaEvents || []).filter(e => e.id !== id)
    });
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-24 relative animate-fade-in" id="agenda-root">
      
      {/* Top Header */}
      <header className="flex items-center justify-between py-2">
        <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight flex items-center gap-2">
          Agenda
        </h1>
        <div className="flex items-center gap-3">
          <button className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-all cursor-pointer">
            <Search className="w-4.5 h-4.5" />
          </button>
          <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-blue-600/10">
            <img 
              src={state.profile.avatarUrl} 
              alt={state.profile.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      {/* Week Title & Calendar Icon */}
      <div className="flex items-center justify-between">
        <div>
          {(() => {
            const MONTHS_PT = [
              'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
              'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ];
            return (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                {MONTHS_PT[currentMonth]} {currentYear}
              </span>
            );
          })()}
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5">
            {viewMode === 'weekly' ? 'Esta Semana' : 'Calendário Mensal'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Month switcher for monthly view */}
          {viewMode === 'monthly' && (
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/20">
              <button
                type="button"
                onClick={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear(prev => prev - 1);
                  } else {
                    setCurrentMonth(prev => prev - 1);
                  }
                }}
                className="p-1.5 hover:bg-white text-slate-700 hover:text-blue-600 rounded-lg transition-all cursor-pointer text-xs font-bold"
              >
                &larr;
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear(prev => prev + 1);
                  } else {
                    setCurrentMonth(prev => prev + 1);
                  }
                }}
                className="p-1.5 hover:bg-white text-slate-700 hover:text-blue-600 rounded-lg transition-all cursor-pointer text-xs font-bold"
              >
                &rarr;
              </button>
            </div>
          )}

          {/* Segmented Control for View Mode */}
          <div className="bg-slate-100/80 p-1 rounded-xl flex items-center border border-slate-200/20">
            <button 
              type="button"
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'weekly' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semana
            </button>
            <button 
              type="button"
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'monthly' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Mês Completo
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Weekday Scroller or Complete Monthly Calendar */}
      {viewMode === 'weekly' ? (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          {WEEK_DAYS.map((day, idx) => {
            const isSelected = selectedDate === day.dateStr;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedDate(day.dateStr)}
                className={`flex flex-col items-center justify-center min-w-[58px] h-[78px] rounded-2xl transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-600 text-white font-bold shadow-[0_12px_24px_rgba(37,99,235,0.25)] scale-105' 
                    : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                <span className={`text-[10px] font-bold tracking-wider ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                  {day.dayName}
                </span>
                <span className="text-lg font-black mt-1 leading-none">{day.dayNum}</span>
                {isSelected && <span className="w-1 h-1 bg-white rounded-full mt-1.5" />}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-4">
          {/* Day of week labels */}
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>D</span>
            <span>S</span>
            <span>T</span>
            <span>Q</span>
            <span>Q</span>
            <span>S</span>
            <span>S</span>
          </div>
          
          {/* Calendar Grid with firstDayIndex spacers */}
          <div className="grid grid-cols-7 gap-1.5">
            {(() => {
              const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
              const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday, 6 is Saturday
              
              const cells = [];
              // Render spacers
              for (let i = 0; i < firstDayIndex; i++) {
                cells.push(<div key={`empty-${i}`} className="h-11" />);
              }
              // Render days
              for (let i = 1; i <= daysInMonth; i++) {
                const dayNum = i;
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isSelected = selectedDate === dateStr;
                const hasEvents = (state.agendaEvents || []).some(e => e.dateString === dateStr);
                
                cells.push(
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    onClick={() => setSelectedDate(dateStr)}
                    className={`relative h-11 flex flex-col items-center justify-center rounded-xl font-bold text-sm transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-600/10 scale-105' 
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{dayNum}</span>
                    {hasEvents && (
                      <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
                    )}
                  </button>
                );
              }
              return cells;
            })()}
          </div>

          <div className="text-center text-[11px] font-bold text-slate-400 bg-slate-50 py-2 rounded-xl">
            Dia Selecionado: <span className="text-blue-600 uppercase font-extrabold">
              {(() => {
                const parts = selectedDate.split('-');
                return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : selectedDate;
              })()}
            </span>
          </div>
        </div>
      )}

      {/* Agenda Timeline List */}
      <div className="space-y-0 relative pl-4 border-l-2 border-dashed border-slate-200/80 ml-4 mt-6">
        
        {filteredEvents.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-400">Sem programações para este dia.</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              + Adicionar primeira tarefa
            </button>
          </div>
        ) : (
          filteredEvents.map((event, idx) => {
            const isVynAI = event.category.toLowerCase().includes('vyn');
            const isAcademia = event.category.toLowerCase().includes('academia') || event.category.toLowerCase().includes('treino');
            const isTrabalho = event.category.toLowerCase().includes('trabalho');

            return (
              <div key={event.id} className="relative pb-8 group animate-fade-in">
                
                {/* Connector Node on Timeline */}
                <div className="absolute -left-[23px] top-1.5 flex items-center justify-center">
                  <div className={`w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
                    isVynAI ? 'bg-purple-500 ring-4 ring-purple-100' :
                    isAcademia ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-blue-500 ring-4 ring-blue-100'
                  }`} />
                </div>

                {/* Left Side Hour */}
                <div className="absolute -left-16 top-1 text-right w-11">
                  <span className="text-xs font-bold text-slate-400 font-mono block">
                    {event.time}
                  </span>
                </div>

                {/* Event Card Content */}
                <div className={`ml-4 rounded-3xl p-5 border transition-all hover:shadow-md relative overflow-hidden ${
                  isVynAI 
                    ? 'bg-purple-50/40 border-purple-100/60 text-purple-950' 
                    : isAcademia 
                      ? 'bg-emerald-50/30 border-emerald-100/50 text-emerald-950' 
                      : 'bg-white border-slate-100 text-slate-800'
                }`}>
                  {isVynAI && (
                    <Sparkles className="absolute top-4 right-4 w-4 h-4 text-purple-400" />
                  )}

                  {/* Category Tag */}
                  <span className={`inline-block text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2.5 ${
                    isVynAI ? 'bg-purple-100 text-purple-700' :
                    isAcademia ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {event.category}
                  </span>

                  {/* Event Title */}
                  <h3 className="text-base font-extrabold tracking-tight leading-snug">
                    {event.title}
                  </h3>

                  {/* Footer Time & Location */}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-semibold text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> 
                      {event.time}{event.endTime ? ` - ${event.endTime}` : ''}
                    </span>
                    {event.locationOrMode && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> 
                        {event.locationOrMode}
                      </span>
                    )}
                    {event.alertEnabled && (
                      <span className="flex items-center gap-0.5 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md text-[10px]">
                        <Bell className="w-3 h-3" /> Alerta
                      </span>
                    )}
                  </div>

                  {/* Delete button on hover/click */}
                  <button 
                    onClick={() => handleDeleteEvent(event.id)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white hover:bg-slate-100 text-slate-400 rounded-lg border border-slate-200/40 cursor-pointer"
                    title="Excluir item"
                  >
                    <X className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
              </div>
            );
          })
        )}

      </div>

      {/* Floating Action Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-28 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-[0_12px_30px_rgba(37,99,235,0.4)] transition-all active:scale-95 z-40 cursor-pointer"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Event Registration Drawer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 pb-10 space-y-4 animate-slide-up shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">Registrar Programação</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              
              {/* Event Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 ml-1">Título</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Treino de Futevôlei"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                />
              </div>

              {/* Category Grid Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 ml-1 block mb-1">Categoria</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Academia', 'Trabalho', 'Estudos', 'Vyn AI: Bloco de Foco', 'Lazer', 'Outro'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`py-2 px-1 border rounded-xl text-xs font-bold transition-all truncate cursor-pointer ${
                        category === cat
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-slate-100 hover:border-slate-200 text-slate-500 bg-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 ml-1">Início</label>
                  <input
                    type="text"
                    placeholder="08:00"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white rounded-xl px-4 py-3 text-sm focus:outline-none transition-all font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 ml-1">Fim</label>
                  <input
                    type="text"
                    placeholder="09:30"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white rounded-xl px-4 py-3 text-sm focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {/* Location or Mode */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 ml-1">Local ou Modo</label>
                <input
                  type="text"
                  placeholder="Ex: Praia de Copacabana ou Zoom"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                />
              </div>

              {/* Alert Toggle */}
              <div className="flex items-center justify-between py-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Ativar Alertas</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                      {state.notificationsEnabled 
                        ? "Alertar 15min antes" 
                        : "Ative notificações no Perfil para receber"}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={alertEnabled}
                  onChange={(e) => setAlertEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 dark:text-blue-400 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl active:scale-95 transition-all shadow-md mt-2 cursor-pointer"
              >
                Salvar Programação
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
