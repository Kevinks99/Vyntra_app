import React, { useState } from 'react';
import { 
  BookOpen, 
  Bookmark, 
  Plus, 
  History, 
  Check, 
  X, 
  Trophy, 
  PlusCircle, 
  ChevronRight,
  TrendingUp,
  FileText,
  Link as LinkIcon,
  Trash2
} from 'lucide-react';
import { AppState, Book, RecentActivity } from '../types';

interface BibliotecaViewProps {
  state: AppState;
  onStateChange: (newState: AppState) => void;
}

export default function BibliotecaView({ state, onStateChange }: BibliotecaViewProps) {
  const [showAddBook, setShowAddBook] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState<Book | null>(null);
  
  // New book states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [format, setFormat] = useState<'Físico' | 'Digital'>('Físico');
  const [bookUrl, setBookUrl] = useState('');
  const [totalPages, setTotalPages] = useState('300');
  const [currentPage, setCurrentPage] = useState('0');

  // Reading progress states
  const [inputPage, setInputPage] = useState('');

  const books = state.books || [];
  const currentReadingBook = books[0] || null;
  const listBooks = books.slice(1);
  const recentActivities = state.recentActivities || [];

  const handleDeleteBook = (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedBooks = books.filter(b => b.id !== bookId);
    onStateChange({
      ...state,
      books: updatedBooks
    });
  };

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) return;

    let progressPercent = 0;
    let pagesCount = 0;
    let startPage = 0;

    if (format === 'Físico') {
      pagesCount = parseInt(totalPages, 10) || 300;
      startPage = parseInt(currentPage, 10) || 0;
      const validatedStart = Math.min(Math.max(startPage, 0), pagesCount);
      progressPercent = Math.round((validatedStart / pagesCount) * 100);
    } else {
      progressPercent = 0; // Digital starts at 0%
    }

    const newBook: Book = {
      id: 'book-' + Date.now(),
      title,
      author,
      format,
      bookUrl: format === 'Digital' ? bookUrl : undefined,
      currentPage: format === 'Físico' ? parseInt(currentPage, 10) || 0 : 0,
      totalPages: format === 'Físico' ? pagesCount : 1,
      progressPercent,
      coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200&h=280'
    };

    // Add activity log
    const newLog: RecentActivity = {
      id: 'ra-' + Date.now(),
      text: `Adicionou "${title}" (${format}) à biblioteca`,
      time: 'Hoje, ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      iconType: 'add'
    };

    onStateChange({
      ...state,
      books: [...books, newBook],
      recentActivities: [newLog, ...recentActivities]
    });

    setTitle('');
    setAuthor('');
    setFormat('Físico');
    setBookUrl('');
    setTotalPages('300');
    setCurrentPage('0');
    setShowAddBook(false);
  };

  const handleUpdateProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showProgressModal) return;

    const targetBook = showProgressModal;
    const newPageVal = parseInt(inputPage, 10) || 0;
    const validatedPage = Math.min(Math.max(newPageVal, 0), targetBook.totalPages);
    const progressPercent = Math.round((validatedPage / targetBook.totalPages) * 100);

    const updatedBooks = books.map((b) => {
      if (b.id === targetBook.id) {
        return {
          ...b,
          currentPage: validatedPage,
          progressPercent
        };
      }
      return b;
    });

    // Add activity log
    const pagesRead = validatedPage - targetBook.currentPage;
    let text = `Atualizou "${targetBook.title}" para a página ${validatedPage}`;
    if (pagesRead > 0) {
      text = `Leu ${pagesRead} páginas de "${targetBook.title}"`;
    }

    const newLog: RecentActivity = {
      id: 'ra-' + Date.now(),
      text,
      time: 'Hoje, ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      iconType: 'book'
    };

    onStateChange({
      ...state,
      books: updatedBooks,
      recentActivities: [newLog, ...recentActivities]
    });

    setInputPage('');
    setShowProgressModal(null);
  };

  const handleToggleDigitalProgress = (book: Book, completed: boolean) => {
    const progressPercent = completed ? 100 : 0;
    
    const updatedBooks = books.map((b) => {
      if (b.id === book.id) {
        return {
          ...b,
          progressPercent
        };
      }
      return b;
    });

    const newLog: RecentActivity = {
      id: 'ra-' + Date.now(),
      text: completed ? `Concluiu a leitura digital de "${book.title}"` : `Marcou "${book.title}" como não lido`,
      time: 'Hoje, ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      iconType: 'book'
    };

    onStateChange({
      ...state,
      books: updatedBooks,
      recentActivities: [newLog, ...recentActivities]
    });
  };

  const completedBooksCount = books.filter(b => b.progressPercent === 100).length;

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-24 animate-fade-in" id="biblioteca-root">
      
      {/* Page Header */}
      <header className="flex items-center justify-between py-2">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight flex items-center gap-2">
            Biblioteca
          </h1>
          <p className="text-xs text-slate-400 font-semibold font-sans">Leitura & Expansão Mental</p>
        </div>
        <button
          onClick={() => setShowAddBook(true)}
          className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-2xl transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      {/* READING NOW SECTION */}
      {currentReadingBook && (
        <section className="bg-white rounded-[32px] p-6 border border-slate-100 space-y-5 shadow-sm relative">
          <button 
            onClick={(e) => handleDeleteBook(currentReadingBook.id, e)}
            className="absolute top-4 left-4 p-1.5 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/60 rounded-full text-red-500 cursor-pointer transition-colors"
            title="Remover livro"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <div className="absolute top-4 right-4 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Lendo Agora
          </div>

          <div className="flex gap-5">
            {/* Cover photo */}
            <div className="w-20 h-28 rounded-xl overflow-hidden shadow-md bg-slate-100 flex-shrink-0 border border-slate-100">
              <img 
                src={currentReadingBook.coverUrl} 
                alt={currentReadingBook.title} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="space-y-2 flex-1 justify-center flex flex-col">
              <div>
                <h3 className="text-base font-black text-slate-800 leading-tight">
                  {currentReadingBook.title}
                </h3>
                <span className="text-xs text-slate-400 font-bold mt-0.5 block">
                  {currentReadingBook.author}
                </span>
                <span className="text-[10px] bg-blue-50 text-blue-600 font-extrabold px-2 py-0.5 rounded-md mt-1.5 inline-block">
                  {currentReadingBook.format || 'Físico'}
                </span>
              </div>
              
              {currentReadingBook.format === 'Digital' ? (
                currentReadingBook.bookUrl && (
                  <a 
                    href={currentReadingBook.bookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                  >
                    <LinkIcon className="w-3.5 h-3.5" /> Acessar Link do Livro
                  </a>
                )
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <Bookmark className="w-3.5 h-3.5 text-blue-600" />
                  <span>Pág. {currentReadingBook.currentPage} de {currentReadingBook.totalPages}</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress indicators */}
          <div className="space-y-2 pt-2 border-t border-slate-50">
            <div className="flex justify-between text-xs font-black text-slate-500">
              <span>Progresso de Leitura</span>
              <span className="text-slate-800">{currentReadingBook.progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${currentReadingBook.progressPercent}%` }} />
            </div>
          </div>

          {/* Actions */}
          {currentReadingBook.format === 'Digital' ? (
            <div className="flex gap-2">
              <button
                onClick={() => handleToggleDigitalProgress(currentReadingBook, currentReadingBook.progressPercent !== 100)}
                className={`w-full py-3 font-bold rounded-2xl text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                  currentReadingBook.progressPercent === 100 
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                <Check className="w-4 h-4" /> 
                {currentReadingBook.progressPercent === 100 ? 'Marcar como Em Leitura' : 'Concluir Leitura Digital'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setShowProgressModal(currentReadingBook);
                setInputPage(currentReadingBook.currentPage.toString());
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <FileText className="w-4 h-4" /> Registrar Leitura
            </button>
          )}
        </section>
      )}

      {/* Meta dynamic indicator */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-3xl p-5 flex items-center justify-between shadow-md">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest block">Minha Meta Anual</span>
          <h4 className="text-lg font-black tracking-tight">Leitura Consistente 2024</h4>
          <p className="text-[11px] text-blue-100 font-semibold">Meta de ler e concluir pelo menos 12 livros este ano</p>
        </div>
        <div className="text-center bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10">
          <span className="text-2xl font-black block leading-none">{completedBooksCount}/12</span>
          <span className="text-[9px] font-bold text-blue-100 block mt-1 uppercase">LIVROS</span>
        </div>
      </section>

      {/* MY READING LIST / OTHER BOOKS */}
      <section className="space-y-3">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest block ml-1">
          Minha Lista de Desejos & Leituras
        </h3>

        {listBooks.length === 0 ? (
          <p className="text-xs text-slate-400 font-semibold text-center py-6 bg-white rounded-3xl border border-slate-100">Sua lista de desejos está vazia. Adicione livros clicando no botão + acima.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {listBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-between text-center transition-all hover:border-slate-200 relative shadow-xs"
              >
                <button
                  type="button"
                  onClick={(e) => handleDeleteBook(book.id, e)}
                  className="absolute top-1 right-1 p-1 bg-red-50 dark:bg-red-950/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/60 rounded-full transition-colors z-10 shadow-xs cursor-pointer"
                  title="Remover livro"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>

                <button
                  onClick={() => {
                    if (book.format === 'Digital') {
                      handleToggleDigitalProgress(book, book.progressPercent !== 100);
                    } else {
                      setShowProgressModal(book);
                      setInputPage(book.currentPage.toString());
                    }
                  }}
                  className="w-full h-full flex flex-col items-center justify-between text-center cursor-pointer"
                >
                  <div className="w-16 h-24 rounded-lg overflow-hidden shadow-sm bg-slate-50 border border-slate-100">
                    <img 
                      src={book.coverUrl} 
                      alt={book.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-3 w-full">
                    <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-100 truncate leading-tight">
                      {book.title}
                    </h4>
                    <span className="text-[9px] text-slate-400 font-bold block truncate mt-0.5">
                      {book.author}
                    </span>
                    <span className="text-[8px] font-bold text-blue-500 bg-blue-50 px-1 py-0.2 rounded mt-1 inline-block">
                      {book.format || 'Físico'}
                    </span>
                  </div>
                  {book.progressPercent > 0 ? (
                    <div className="w-full mt-2 space-y-1">
                      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${book.progressPercent}%` }} />
                      </div>
                      <span className="text-[8px] font-black text-slate-500 block">{book.progressPercent}%</span>
                    </div>
                  ) : (
                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-2 inline-block">
                      {book.format === 'Digital' ? 'Concluir' : 'Começar'}
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* RECENT READING TIMELINE */}
      <section className="space-y-3.5">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest block ml-1 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5" /> Atividade Recente
        </h3>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 space-y-4">
          {recentActivities.length === 0 ? (
            <p className="text-xs text-slate-400 font-semibold text-center py-4">Sem atividades registradas recentemente.</p>
          ) : (
            recentActivities.map((act) => (
              <div key={act.id} className="flex gap-3 text-xs leading-relaxed border-b border-slate-50/50 pb-3 last:border-0 last:pb-0">
                <div className="w-6.5 h-6.5 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  {act.iconType === 'add' ? '+' : '📖'}
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-700">{act.text}</p>
                  <span className="text-[9px] text-slate-400 font-extrabold block">{act.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ADD BOOK DRAWER MODAL */}
      {showAddBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 space-y-4 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">Registrar Livro</h3>
              <button 
                onClick={() => setShowAddBook(false)}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBook} className="space-y-4">
              {/* Título */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 ml-1">Título do Livro</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Essencialismo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                />
              </div>

              {/* Autor */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 ml-1">Autor</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Greg McKeown"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                />
              </div>

              {/* Formato: Físico vs Digital */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 ml-1 block mb-1">Formato do Livro</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Físico', 'Digital'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setFormat(fmt)}
                      className={`py-2.5 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        format === fmt
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-slate-100 hover:border-slate-200 text-slate-500 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condicionais por Formato */}
              {format === 'Físico' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 ml-1">Páginas Totais</label>
                    <input
                      type="number"
                      required
                      placeholder="300"
                      value={totalPages}
                      onChange={(e) => setTotalPages(e.target.value)}
                      className="w-full bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 ml-1">Página Atual</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={currentPage}
                      onChange={(e) => setCurrentPage(e.target.value)}
                      className="w-full bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 ml-1">Link do Livro / PDF (Opcional)</label>
                  <input
                    type="url"
                    placeholder="https://exemplo.com/livro.pdf"
                    value={bookUrl}
                    onChange={(e) => setBookUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-transparent focus:border-blue-600 focus:bg-white rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl active:scale-95 transition-all shadow-md mt-2 cursor-pointer"
              >
                Salvar Livro na Lista
              </button>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE READING PROGRESS MODAL */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Registrar página lida</h3>
              <button 
                onClick={() => setShowProgressModal(null)}
                className="p-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400 dark:text-slate-300 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1 text-center">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Lendo Agora</span>
              <h4 className="text-base font-black text-slate-800 dark:text-slate-100 leading-tight">{showProgressModal.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">De 0 a {showProgressModal.totalPages} páginas</p>
            </div>

            <form onSubmit={handleUpdateProgress} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 ml-1">Página Atual</label>
                <input
                  type="number"
                  min="0"
                  max={showProgressModal.totalPages}
                  placeholder={`Estou na página... (Ex: ${showProgressModal.currentPage})`}
                  value={inputPage}
                  onChange={(e) => setInputPage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 rounded-xl px-4 py-3.5 text-center font-bold focus:outline-none transition-all text-base text-slate-800 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl active:scale-95 transition-all shadow-md cursor-pointer text-xs"
              >
                Atualizar Progresso de Leitura
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
