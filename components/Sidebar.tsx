
import React, { useState } from 'react';
import { Note } from '../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Settings,
  Star,
  Hash,
  Clock
} from 'lucide-react';

interface SidebarProps {
  notes: Note[];
  activeNoteId: string;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  notes, 
  activeNoteId, 
  onSelectNote, 
  onCreateNote, 
  onDeleteNote,
  onToggleFavorite,
  isOpen,
  setIsOpen,
  onOpenSettings
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.blocks.some(b => b.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const favorites = filteredNotes.filter(n => n.isFavorite);
  const recent = filteredNotes.filter(n => !n.isFavorite);

  return (
    <div 
      className={`bg-white border-r border-slate-100 transition-all duration-500 h-full flex flex-col relative z-40 ${
        isOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full overflow-hidden border-none'
      }`}
    >
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <h1 className="font-black text-2xl text-slate-900 flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 rotate-3">
            <FileText size={20} strokeWidth={3} />
          </div>
          Lumina
        </h1>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="p-6 space-y-6 flex-1 flex flex-col overflow-hidden">
        <button 
          onClick={onCreateNote}
          className="w-full py-4 px-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-100"
        >
          <Plus size={20} strokeWidth={3} />
          CREATE NOTE
        </button>

        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Quick search..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 space-y-8">
          {/* Favorites Section */}
          {favorites.length > 0 && (
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Star size={12} className="fill-indigo-500 text-indigo-500" />
                Favorites
              </h3>
              <div className="space-y-1">
                {favorites.map(note => (
                  <NoteItem 
                    key={note.id} 
                    note={note} 
                    active={activeNoteId === note.id}
                    onClick={() => onSelectNote(note.id)}
                    onDelete={() => onDeleteNote(note.id)}
                    onToggleFavorite={() => onToggleFavorite(note.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent Section */}
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Clock size={12} />
              Recent Notes
            </h3>
            <div className="space-y-1">
              {recent.length === 0 && favorites.length === 0 ? (
                <p className="text-slate-300 text-sm py-4 italic">No notes found...</p>
              ) : (
                recent.map(note => (
                  <NoteItem 
                    key={note.id} 
                    note={note} 
                    active={activeNoteId === note.id}
                    onClick={() => onSelectNote(note.id)}
                    onDelete={() => onDeleteNote(note.id)}
                    onToggleFavorite={() => onToggleFavorite(note.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-slate-50 flex items-center gap-4 bg-slate-50/50">
        <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm shadow-sm border border-indigo-200">
          U
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-black text-slate-800 truncate">Lumina User</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Personal Plan</p>
        </div>
        <button 
          onClick={onOpenSettings}
          className="p-2.5 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"
        >
          <Settings size={20} />
        </button>
      </div>

      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed left-6 bottom-6 z-50 p-4 bg-slate-900 text-white shadow-2xl rounded-2xl hover:bg-indigo-600 transition-all animate-in fade-in zoom-in"
        >
          <ChevronRight size={24} strokeWidth={3} />
        </button>
      )}
    </div>
  );
};

const NoteItem = ({ note, active, onClick, onDelete, onToggleFavorite }: any) => (
  <div 
    onClick={onClick}
    className={`group relative flex flex-col p-4 rounded-2xl cursor-pointer transition-all ${
      active 
      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 -translate-y-0.5' 
      : 'hover:bg-slate-50 text-slate-600'
    }`}
  >
    <div className="flex items-start justify-between gap-2">
      <span className={`font-black text-sm leading-tight truncate ${active ? 'text-white' : 'text-slate-800'}`}>
        {note.title || 'Untitled'}
      </span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className={`p-1 rounded-md ${active ? 'hover:bg-indigo-500' : 'hover:bg-slate-200'}`}
        >
          <Star size={12} className={note.isFavorite ? 'fill-current text-yellow-400' : ''} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className={`p-1 rounded-md ${active ? 'hover:bg-indigo-500' : 'hover:bg-red-50 text-red-500'}`}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
    <div className="flex items-center justify-between mt-2">
      <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-indigo-200' : 'text-slate-400'}`}>
        {new Date(note.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
      </span>
      {note.tags.length > 0 && (
        <Hash size={10} className={active ? 'text-indigo-300' : 'text-slate-300'} />
      )}
    </div>
  </div>
);
