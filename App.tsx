
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { Note, Block } from './types';
import { v4 as uuidv4 } from 'uuid';
import { Book, FileText, Settings as SettingsIcon, X } from 'lucide-react';

const INITIAL_NOTE: Note = {
  id: uuidv4(),
  title: 'Welcome to Lumina AI',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  tags: ['getting-started'],
  isFavorite: true,
  drawings: [],
  blocks: [
    {
      id: uuidv4(),
      type: 'heading1',
      content: 'Hello there!',
      alignment: 'left',
      fontSize: '3xl',
      color: '#0f172a',
    },
    {
      id: uuidv4(),
      type: 'text',
      content: 'This is your new professional workspace. You can use the "Draw" tab to annotate with a pen, or "AI" for document reviews. Try sketching on this note!',
      alignment: 'left',
      fontSize: 'lg',
      color: '#334155',
    }
  ],
};

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('lumina_notes_v3');
    return saved ? JSON.parse(saved) : [INITIAL_NOTE];
  });
  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('lumina_notes_v3', JSON.stringify(notes));
  }, [notes]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const handleCreateNote = () => {
    const newNote: Note = {
      id: uuidv4(),
      title: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [],
      isFavorite: false,
      drawings: [],
      blocks: [
        {
          id: uuidv4(),
          type: 'text',
          content: '',
          alignment: 'left',
          fontSize: 'base',
          color: '#0f172a',
        }
      ],
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const handleDeleteNote = (id: string) => {
    const filtered = notes.filter(n => n.id !== id);
    if (filtered.length === 0) {
      setNotes([INITIAL_NOTE]);
      setActiveNoteId(INITIAL_NOTE.id);
    } else {
      setNotes(filtered);
      if (activeNoteId === id) {
        setActiveNoteId(filtered[0].id);
      }
    }
  };

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes(notes.map(n => n.id === updatedNote.id ? { ...updatedNote, updatedAt: Date.now() } : n));
  };

  const toggleFavorite = (id: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, isFavorite: !n.isFavorite } : n));
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Sidebar 
        notes={notes} 
        activeNoteId={activeNoteId} 
        onSelectNote={setActiveNoteId} 
        onCreateNote={handleCreateNote} 
        onDeleteNote={handleDeleteNote}
        onToggleFavorite={toggleFavorite}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      
      <main className="flex-1 relative bg-slate-50 overflow-hidden">
        {activeNote ? (
          <Editor 
            note={activeNote} 
            onChange={handleUpdateNote} 
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-300">
            <Book size={64} strokeWidth={1} className="mb-6 opacity-30" />
            <p className="text-xl font-medium">Select a note to start writing</p>
            <button 
              onClick={handleCreateNote}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-bold"
            >
              Or create a new one
            </button>
          </div>
        )}
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <SettingsIcon className="text-indigo-600" />
                Settings
              </h2>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-8">
              <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">AI Configuration</h3>
                <div className="space-y-3">
                   <div className="p-4 border border-slate-200 rounded-2xl flex items-center justify-between">
                      <span className="font-medium">Model</span>
                      <span className="text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-lg text-xs">Gemini 3 Flash</span>
                   </div>
                   <p className="text-xs text-slate-400 px-1">Lumina is integrated with Google Gemini for text analysis, image recognition, and professional summaries.</p>
                </div>
              </section>
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
