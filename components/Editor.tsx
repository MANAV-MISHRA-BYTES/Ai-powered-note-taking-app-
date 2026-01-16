
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Note, Block, BlockType, DrawingPath } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { 
  Sparkles, ImageIcon, FileIcon, AlignLeft, AlignCenter, AlignRight, Bold, Italic, 
  X, RefreshCw, Trash2, Pencil, Highlighter, Eraser, Type, ChevronDown, 
  Save, Download, History, Share2, Undo2, Redo2, Printer, Palette, 
  Search, List, ListOrdered, CheckSquare, AlignJustify, Link, MessageSquare,
  Smile, MoreHorizontal, PenTool, Layout
} from 'lucide-react';
import * as gemini from '../services/gemini';

interface EditorProps {
  note: Note;
  onChange: (note: Note) => void;
}

export const Editor: React.FC<EditorProps> = ({ note, onChange }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<'pen' | 'highlighter' | 'eraser' | null>(null);
  const [penColor, setPenColor] = useState('#4285f4'); // Google Blue
  const [penWidth, setPenWidth] = useState(3);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Tab 1');
  const [showColorWheel, setShowColorWheel] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // --- Drawing Logic (Fixed for Pen/Touch/Cursor) ---
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!drawMode || drawMode === 'eraser') return;
    (e.target as Element).setPointerCapture(e.pointerId);
    setIsDrawing(true);
    
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newPath: DrawingPath = {
      id: uuidv4(),
      points: [{ x, y }],
      color: penColor,
      width: drawMode === 'highlighter' ? 20 : penWidth,
      opacity: drawMode === 'highlighter' ? 0.35 : 1,
    };
    
    onChange({ ...note, drawings: [...note.drawings, newPath] });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || !drawMode || drawMode === 'eraser') return;
    
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const updatedPaths = [...note.drawings];
    const lastPath = updatedPaths[updatedPaths.length - 1];
    if (lastPath) {
      updatedPaths[updatedPaths.length - 1] = {
        ...lastPath,
        points: [...lastPath.points, { x, y }]
      };
      onChange({ ...note, drawings: updatedPaths });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDrawing(false);
  };

  const handleEraser = (pathId: string) => {
    if (drawMode !== 'eraser') return;
    onChange({ ...note, drawings: note.drawings.filter(p => p.id !== pathId) });
  };

  // --- Block Management ---
  const addBlock = (type: BlockType = 'text', content: string = '') => {
    const newBlock: Block = {
      id: uuidv4(),
      type,
      content,
      alignment: 'left',
      fontSize: 'base',
      color: '#3c4043',
    };
    onChange({ ...note, blocks: [...note.blocks, newBlock], updatedAt: Date.now() });
  };

  const updateBlock = (blockId: string, updates: Partial<Block>) => {
    const updatedBlocks = note.blocks.map(b => b.id === blockId ? { ...b, ...updates } : b);
    onChange({ ...note, blocks: updatedBlocks, updatedAt: Date.now() });
  };

  const handleAiAction = async (prompt: string) => {
    setAiLoading(true);
    try {
      const context = note.blocks.map(b => b.content).join('\n');
      const response = await gemini.suggestNextContent(`Context: ${context}\nAction: ${prompt}`);
      if (response) addBlock('text', response);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const colors = ['#000000', '#4285f4', '#ea4335', '#fbbc05', '#34a853', '#ff6d00', '#46bdc6', '#7030a0'];

  return (
    <div className="h-full flex flex-col bg-[#f8f9fa] font-sans overflow-hidden">
      {/* GOOGLE DOCS HEADER */}
      <header className="bg-white px-4 pt-2 pb-1 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-10 bg-blue-600 rounded-sm flex items-center justify-center text-white mr-1 shadow-sm">
            <FileTextIcon />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <input 
                className="text-lg font-normal text-gray-700 hover:bg-gray-50 px-2 py-0.5 rounded outline-none border border-transparent focus:border-blue-500 transition-all"
                value={note.title || 'Untitled document'}
                onChange={(e) => onChange({...note, title: e.target.value})}
              />
              <StarIcon />
            </div>
            <nav className="flex items-center gap-4 text-sm text-gray-600 px-2">
              <span className="cursor-pointer hover:bg-gray-100 px-2 py-0.5 rounded">File</span>
              <span className="cursor-pointer hover:bg-gray-100 px-2 py-0.5 rounded">Edit</span>
              <span className="cursor-pointer hover:bg-gray-100 px-2 py-0.5 rounded">View</span>
              <span className="cursor-pointer hover:bg-gray-100 px-2 py-0.5 rounded">Insert</span>
              <span className="cursor-pointer hover:bg-gray-100 px-2 py-0.5 rounded">Format</span>
              <span className="cursor-pointer hover:bg-gray-100 px-2 py-0.5 rounded">Tools</span>
              <span className="cursor-pointer hover:bg-gray-100 px-2 py-0.5 rounded">Extensions</span>
              <span className="cursor-pointer hover:bg-gray-100 px-2 py-0.5 rounded">Help</span>
            </nav>
          </div>
        </div>
      </header>

      {/* COMPREHENSIVE TOOLBAR */}
      <div className="bg-[#edf2fa] mx-4 my-2 rounded-full px-4 py-1 flex items-center gap-1 shadow-sm overflow-x-auto no-scrollbar whitespace-nowrap border border-gray-100">
        <div className="flex items-center gap-0.5 px-2 border-r border-gray-300">
          <ToolbarButton icon={<Search size={16} />} tooltip="Search" />
          <ToolbarButton icon={<Undo2 size={16} />} tooltip="Undo" />
          <ToolbarButton icon={<Redo2 size={16} />} tooltip="Redo" />
          <ToolbarButton icon={<Printer size={16} />} tooltip="Print" />
        </div>
        
        <div className="flex items-center gap-1 px-2 border-r border-gray-300">
          <div className="flex items-center gap-1 px-2 py-1 hover:bg-gray-200 rounded cursor-pointer text-sm font-medium">
            Normal text <ChevronDown size={14} />
          </div>
          <div className="flex items-center gap-1 px-2 py-1 hover:bg-gray-200 rounded cursor-pointer text-sm font-medium border-l border-gray-300">
            Arial <ChevronDown size={14} />
          </div>
        </div>

        <div className="flex items-center gap-0.5 px-2 border-r border-gray-300">
          <ToolbarButton icon={<Bold size={16} />} tooltip="Bold" />
          <ToolbarButton icon={<Italic size={16} />} tooltip="Italic" />
          <div className="relative group">
            <ToolbarButton 
              icon={<Palette size={16} style={{color: penColor}} />} 
              tooltip="Text color" 
              active={drawMode === 'pen'}
              onClick={() => setDrawMode(drawMode === 'pen' ? null : 'pen')}
            />
          </div>
          <ToolbarButton 
            icon={<Highlighter size={16} />} 
            tooltip="Highlight" 
            active={drawMode === 'highlighter'}
            onClick={() => setDrawMode(drawMode === 'highlighter' ? null : 'highlighter')}
          />
          <ToolbarButton 
            icon={<Eraser size={16} />} 
            tooltip="Eraser" 
            active={drawMode === 'eraser'}
            onClick={() => setDrawMode(drawMode === 'eraser' ? null : 'eraser')}
          />
        </div>

        {/* PEN COLOR PICKER */}
        <div className="flex items-center gap-1 px-2 border-r border-gray-300">
           {colors.map(c => (
             <button 
               key={c}
               className={`w-5 h-5 rounded-full border border-gray-300 transition-all ${penColor === c ? 'scale-125 ring-2 ring-blue-400' : 'hover:scale-110'}`}
               style={{backgroundColor: c}}
               onClick={() => {
                 setPenColor(c);
                 if (!drawMode) setDrawMode('pen');
               }}
             />
           ))}
           <div className="relative">
             <button 
               onClick={() => setShowColorWheel(!showColorWheel)}
               className="w-5 h-5 rounded-full bg-gradient-to-tr from-red-500 via-green-500 to-blue-500 border border-gray-300"
             />
             {showColorWheel && (
               <div className="absolute top-8 left-0 z-[100] bg-white p-3 shadow-xl rounded-xl border border-gray-200">
                 <input 
                   type="color" 
                   value={penColor} 
                   onChange={(e) => setPenColor(e.target.value)} 
                   className="w-32 h-32 cursor-pointer border-none bg-transparent"
                 />
                 <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Custom Wheel</div>
               </div>
             )}
           </div>
        </div>

        <div className="flex items-center gap-0.5 px-2">
          <ToolbarButton icon={<AlignLeft size={16} />} />
          <ToolbarButton icon={<AlignCenter size={16} />} />
          <ToolbarButton icon={<AlignRight size={16} />} />
          <ToolbarButton icon={<AlignJustify size={16} />} />
          <ToolbarButton icon={<List size={16} />} />
          <ToolbarButton icon={<ListOrdered size={16} />} />
          <ToolbarButton icon={<CheckSquare size={16} />} />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* DOCUMENT TABS SIDEBAR */}
        <div className="w-64 border-r border-gray-200 bg-white p-4 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-700">Document tabs</h2>
            <button className="text-gray-400 hover:text-gray-600"><PlusIcon size={16} /></button>
          </div>
          
          <div className="space-y-1">
            <div className={`flex items-center justify-between p-2 rounded-md cursor-pointer text-sm font-medium ${activeTab === 'Tab 1' ? 'bg-[#e8f0fe] text-[#1967d2]' : 'hover:bg-gray-100 text-gray-600'}`}>
              <div className="flex items-center gap-2">
                <FileTextIcon size={16} className={activeTab === 'Tab 1' ? 'text-blue-600' : 'text-gray-400'} />
                Tab 1
              </div>
              <MoreHorizontal size={14} className="text-gray-400" />
            </div>
          </div>

          <p className="text-xs text-gray-400 italic px-2">
            Headings you add to the document will appear here.
          </p>
        </div>

        {/* MAIN EDITOR VIEW */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative flex flex-col items-center">
          
          <div className="w-[816px] min-h-[1056px] bg-white shadow-[0_1px_3px_1px_rgba(60,64,67,0.15),0_1px_2px_0_rgba(60,64,67,0.3)] p-16 relative">
            
            {/* SVG FREE DRAWING LAYER */}
            <svg 
              ref={svgRef}
              className={`absolute inset-0 z-50 touch-none pointer-events-auto ${drawMode ? (drawMode === 'eraser' ? 'cursor-not-allowed' : 'cursor-crosshair') : 'pointer-events-none'}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              style={{ width: '100%', height: '100%' }}
            >
              <rect width="100%" height="100%" fill="transparent" />
              {note.drawings.map(path => (
                <polyline
                  key={path.id}
                  points={path.points.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={path.color}
                  strokeWidth={path.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ 
                    opacity: path.opacity, 
                    cursor: drawMode === 'eraser' ? 'pointer' : 'default',
                    pointerEvents: drawMode === 'eraser' ? 'auto' : 'none' 
                  }}
                  onClick={(e) => {
                    if (drawMode === 'eraser') {
                      e.stopPropagation();
                      handleEraser(path.id);
                    }
                  }}
                />
              ))}
            </svg>

            {/* HELP ME WRITE CHIPS (Initial View) */}
            {note.blocks.length === 1 && note.blocks[0].content === '' && (
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-10 flex flex-wrap justify-center gap-3 w-full max-w-lg">
                <AiChip 
                  icon={<Sparkles size={16} className="text-blue-600 fill-blue-600" />} 
                  label="Generate document" 
                  onClick={() => handleAiAction("Generate a professional project plan document")}
                />
                <AiChip 
                  icon={<PenTool size={16} className="text-blue-600" />} 
                  label="Help me write" 
                  onClick={() => handleAiAction("Help me write an introductory letter")}
                />
                <AiChip 
                  icon={<Layout size={16} className="text-gray-600" />} 
                  label="Templates" 
                  onClick={() => {}} 
                />
                <AiChip 
                  icon={<MoreHorizontal size={16} className="text-gray-600" />} 
                  label="More" 
                  onClick={() => {}} 
                />
              </div>
            )}

            {/* TEXT LAYER */}
            <div className="relative z-0">
              {note.blocks.map((block, idx) => (
                <BlockElement 
                  key={block.id}
                  block={block}
                  onChange={(updates) => updateBlock(block.id, updates)}
                  onFocus={() => {
                    if (drawMode) setDrawMode(null);
                  }}
                  onAddBelow={() => {
                    const newBlock: Block = { id: uuidv4(), type: 'text', content: '', alignment: 'left', fontSize: 'base', color: '#3c4043' };
                    const newBlocks = [...note.blocks];
                    newBlocks.splice(idx + 1, 0, newBlock);
                    onChange({...note, blocks: newBlocks});
                  }}
                  onRemove={() => {
                    if (note.blocks.length > 1) {
                      onChange({...note, blocks: note.blocks.filter(b => b.id !== block.id)});
                    }
                  }}
                />
              ))}
              
              <div className="h-64" onClick={() => addBlock()} />
            </div>
          </div>

          {/* RIGHT FLOATING ACTION BAR */}
          <div className="fixed right-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 bg-white shadow-lg rounded-full py-4 px-2 border border-gray-100 animate-in fade-in duration-500">
            <button 
              onClick={() => handleAiAction("Review my document for tone and clarity")}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-blue-50 text-blue-600 transition-all group relative"
            >
              <Sparkles size={20} />
              <span className="absolute right-12 scale-0 group-hover:scale-100 bg-gray-800 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap transition-all">AI Review</span>
            </button>
            <button 
              onClick={() => addBlock('image')}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-all group relative"
            >
              <ImageIcon size={20} />
              <span className="absolute right-12 scale-0 group-hover:scale-100 bg-gray-800 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap transition-all">Add Image</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ToolbarButton = ({ icon, tooltip, active, onClick }: { icon: any, tooltip?: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`p-2 rounded hover:bg-gray-200 transition-colors group relative ${active ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
  >
    {icon}
    {tooltip && (
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 scale-0 group-hover:scale-100 bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap transition-all z-[100]">
        {tooltip}
      </span>
    )}
  </button>
);

const AiChip = ({ icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1967d2] rounded-full text-sm font-medium transition-all shadow-sm border border-transparent hover:border-blue-200"
  >
    {icon}
    {label}
  </button>
);

const BlockElement = ({ block, onChange, onFocus, onAddBelow, onRemove }: any) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerText !== block.content) {
      contentRef.current.innerText = block.content;
    }
  }, [block.id]);

  const handleInput = () => {
    if (contentRef.current) {
      onChange({ content: contentRef.current.innerText });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onAddBelow();
    }
    if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      onRemove();
    }
  };

  if (block.type === 'image') return (
    <div className="group relative my-4 flex justify-center">
      <img src={block.content} className="max-w-full rounded border border-gray-200 shadow-sm" />
      <button onClick={onRemove} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
    </div>
  );

  return (
    <div 
      ref={contentRef}
      contentEditable
      onInput={handleInput}
      onFocus={onFocus}
      onKeyDown={handleKeyDown}
      suppressContentEditableWarning
      className="outline-none w-full min-h-[1.5em] leading-[1.6] transition-all whitespace-pre-wrap selection:bg-[#c2dbff] text-[#3c4043] font-normal text-base mb-1"
      style={{ textAlign: block.alignment }}
    />
  );
};

// Icons not found in lucide-react standard
const FileTextIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
);

const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer hover:stroke-yellow-500">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const PlusIcon = ({size = 18}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
