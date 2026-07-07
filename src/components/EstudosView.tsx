import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Play, 
  Pause, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  Clock, 
  TrendingUp, 
  X, 
  Plus 
} from 'lucide-react';
import { AppState, Course } from '../types';

interface EstudosViewProps {
  state: AppState;
  onStateChange: (newState: AppState) => void;
}

export default function EstudosView({ state, onStateChange }: EstudosViewProps) {
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newInstructor, setNewInstructor] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'cursos' | 'agenda'>('cursos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const courses = state.courses || [];

  const handleAdvanceProgress = (courseId: string) => {
    const updatedCourses = courses.map((course) => {
      if (course.id === courseId) {
        const nextProgress = Math.min(course.progress + 5, 100);
        const status = nextProgress === 100 ? 'CONCLUÍDO' : course.status;
        return { ...course, progress: nextProgress, status };
      }
      return course;
    });

    onStateChange({
      ...state,
      courses: updatedCourses
    });
  };

  const handleCompleteCourse = (courseId: string) => {
    const targetCourse = courses.find((c) => c.id === courseId);
    if (!targetCourse) return;

    const updatedCourses = courses.map((course) => {
      if (course.id === courseId) {
        return { ...course, progress: 100, status: 'CONCLUÍDO' as const };
      }
      return course;
    });

    const newActivity = {
      id: 'activity-' + Date.now(),
      text: `Concluiu o curso de ${targetCourse.title}`,
      time: 'Agora mesmo',
      iconType: 'book' as const
    };

    onStateChange({
      ...state,
      courses: updatedCourses,
      recentActivities: [newActivity, ...(state.recentActivities || [])]
    });
  };

  const handleToggleStatus = (courseId: string) => {
    const updatedCourses = courses.map((course) => {
      if (course.id === courseId) {
        const nextStatus = course.status === 'EM PROGRESSO' ? 'PAUSADO' : 'EM PROGRESSO';
        return { ...course, status: nextStatus as any };
      }
      return course;
    });

    onStateChange({
      ...state,
      courses: updatedCourses
    });
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newInstructor) return;

    const newCourse: Course = {
      id: 'course-' + Date.now(),
      title: newTitle,
      instructor: newInstructor,
      progress: 0,
      status: 'EM PROGRESSO',
      bannerUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400&h=200',
      nextClass: 'Introdução ao Módulo 1',
      icon: 'graduation-cap',
      linkUrl: newLinkUrl || undefined
    };

    onStateChange({
      ...state,
      courses: [...courses, newCourse]
    });

    setNewTitle('');
    setNewInstructor('');
    setNewLinkUrl('');
    setShowAddCourse(false);
  };

  const totalCourses = courses.length;
  const completedCourses = courses.filter(c => c.status === 'CONCLUÍDO').length;
  const avgProgress = totalCourses > 0 
    ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / totalCourses) 
    : 0;

  // Filter study events from state.agendaEvents
  const studyEvents = (state.agendaEvents || []).filter(e => {
    const cat = (e.category || '').toLowerCase();
    const title = (e.title || '').toLowerCase();
    return cat.includes('estud') || cat.includes('curs') || title.includes('estud') || title.includes('curs') || title.includes('aula') || title.includes('workshop');
  });

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-24 animate-fade-in relative" id="estudos-root">
      
      {/* Sleek floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-xs bg-slate-900 text-white text-xs font-bold px-4 py-3.5 rounded-2xl shadow-xl z-50 flex items-center justify-between gap-3 animate-fade-in border border-slate-800">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-white/60 hover:text-white transition-colors cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      
      {/* Page Header */}
      <header className="flex items-center justify-between py-2">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight flex items-center gap-2">
            Estudos
          </h1>
          <p className="text-xs text-slate-400 font-semibold font-sans">Desenvolvimento Intelectual</p>
        </div>
        <button
          onClick={() => setShowAddCourse(true)}
          className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-2xl transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      {/* GENERAL PROGRESS CARD */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8 blur-2xl" />
        
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest block">
            Progresso Geral
          </span>
          <Award className="w-5 h-5 text-amber-300" />
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-4xl font-black">{avgProgress}%</span>
          <span className="text-xs text-blue-100 font-semibold">concluído</span>
        </div>

        <div className="mt-4 space-y-1.5">
          <div className="w-full h-2.5 bg-blue-900/50 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${avgProgress}%` }} />
          </div>
          <div className="flex justify-between text-[11px] font-bold text-blue-100">
            <span>{completedCourses} de {totalCourses} cursos concluídos</span>
            <span>Média geral: {avgProgress}%</span>
          </div>
        </div>

        {/* Quick stats mini grid */}
        <div className="grid grid-cols-2 gap-4 mt-6 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-200" />
            <div>
              <span className="text-[10px] text-blue-200 block">Status de Cursos</span>
              <span className="text-xs font-bold text-white block">{totalCourses - completedCourses} em progresso</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-200" />
            <div>
              <span className="text-[10px] text-blue-200 block">Consistência</span>
              <span className="text-xs font-bold text-white block">{state.profile.streakDays || 0} dias ativos</span>
            </div>
          </div>
        </div>
      </section>

      {/* STUDY CALENDAR MINIS */}
      <section className="bg-white rounded-3xl p-5 border border-slate-100 space-y-3">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest block ml-1">
          Calendário de Estudos
        </h3>

        {studyEvents.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs font-semibold text-slate-400 border border-slate-100/50">
            Nenhuma aula de estudos agendada na sua Agenda.
          </div>
        ) : (
          <div className="space-y-3">
            {studyEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100/50">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-blue-600 uppercase">
                    {event.dateString} às {event.time} {event.endTime ? ` - ${event.endTime}` : ''}
                  </span>
                  <h4 className="text-sm font-black text-slate-800">{event.title}</h4>
                </div>
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tab select for courses vs scheduled */}
      <div className="flex justify-between items-center ml-1">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Meus Cursos ({courses.length})
        </h3>
      </div>

      {/* Course List Card */}
      <section className="space-y-6">
        {courses.filter(c => c.status !== 'CONCLUÍDO').length === 0 ? (
          <div className="py-8 text-center text-slate-400 font-semibold bg-white rounded-3xl border border-slate-100 p-6">
            Não há cursos em andamento no momento. Adicione um novo curso acima!
          </div>
        ) : (
          courses.filter(c => c.status !== 'CONCLUÍDO').map((course) => {
            const isInProgress = course.status === 'EM PROGRESSO';
            return (
              <div key={course.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                
                {/* Banner */}
                <div className="h-32 w-full relative">
                  <img 
                    src={course.bannerUrl} 
                    alt={course.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[9px] font-bold tracking-widest text-blue-300 uppercase block">
                      {course.instructor}
                    </span>
                    <h4 className="text-base font-black tracking-tight mt-0.5">
                      {course.title}
                    </h4>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      course.status === 'EM PROGRESSO' 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-500 text-white'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                </div>

                {/* Progress and Actions */}
                <div className="p-5 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>Módulos Concluídos</span>
                      <span className="text-slate-800 font-extrabold">{course.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 font-bold border-t border-slate-50 pt-3">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      <span>Próxima aula: <span className="text-slate-700">{course.nextClass}</span></span>
                    </div>
                  </div>

                  {/* Course Action Buttons */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleToggleStatus(course.id)}
                        className={`h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                          isInProgress 
                            ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' 
                            : 'bg-slate-100 border-transparent text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isInProgress ? (
                          <>
                            <Pause className="w-3.5 h-3.5" /> Pausar
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" /> Retomar
                          </>
                        )}
                      </button>

                      {course.linkUrl ? (
                        <a
                          href={course.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="h-11 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-emerald-100"
                        >
                          <GraduationCap className="w-4 h-4" /> Estudar (Link)
                        </a>
                      ) : (
                        <button
                          onClick={() => triggerToast('Insira um link de curso válido editando ou criando um curso.')}
                          className="h-11 bg-slate-50 hover:bg-slate-100 text-slate-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200/50"
                          title="Sem link de curso cadastrado"
                        >
                          <GraduationCap className="w-4 h-4" /> Estudar (Sem Link)
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleAdvanceProgress(course.id)}
                        className="h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-transparent font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Avançar +5%
                      </button>

                      <button
                        onClick={() => handleCompleteCourse(course.id)}
                        className="h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm hover:shadow"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Terminar Curso
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </section>

      {/* COMPLETED COURSES (HISTÓRICO) */}
      {courses.filter(c => c.status === 'CONCLUÍDO').length > 0 && (
        <section className="space-y-4 pt-2">
          <div className="flex justify-between items-center ml-1">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Histórico de Cursos Concluídos ({courses.filter(c => c.status === 'CONCLUÍDO').length})
            </h3>
          </div>

          <div className="space-y-3">
            {courses.filter(c => c.status === 'CONCLUÍDO').map((course) => (
              <div 
                key={course.id} 
                className="bg-slate-50 border border-slate-100/80 rounded-3xl p-4 flex items-center justify-between gap-4 animate-fade-in hover:bg-slate-100/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden grayscale opacity-70 shrink-0">
                    <img src={course.bannerUrl} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-700 line-clamp-1">{course.title}</h4>
                    <span className="text-[10px] text-slate-400 font-bold block">{course.instructor}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] font-extrabold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Award className="w-3 h-3 text-blue-600" /> CONCLUÍDO
                  </span>
                  {course.linkUrl && (
                    <a 
                      href={course.linkUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-2 bg-white text-slate-500 hover:text-slate-700 rounded-xl border border-slate-200"
                      title="Abrir Link do Curso"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* INSIGHT CARD */}
      <section className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-blue-100 rounded-3xl p-5 flex gap-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white flex-shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block">Insight de Foco</span>
          <p className="text-xs font-semibold text-slate-600 leading-relaxed">
            Seu rendimento nos estudos e cursos cadastrados no Vyntra aumentará significativamente à medida que mantém a constância semanal. Complete seus cursos para acumular conquistas no seu histórico de evolução!
          </p>
        </div>
      </section>

      {/* CREATE COURSE DRAWER MODAL */}
      {showAddCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 space-y-5 animate-slide-up shadow-xl max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">Registrar Novo Curso</h3>
              <button 
                onClick={() => setShowAddCourse(false)}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 ml-1">Título do Curso</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Economia Comportamental"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 ml-1">Instrutor / Professor</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Prof. Richard Thaler"
                  value={newInstructor}
                  onChange={(e) => setNewInstructor(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 ml-1">Link do Curso (URL)</label>
                <input
                  type="url"
                  placeholder="Ex: https://www.coursera.org/..."
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all text-slate-800 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl active:scale-95 transition-all shadow-md mt-2 cursor-pointer"
              >
                Salvar e Começar Curso
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
