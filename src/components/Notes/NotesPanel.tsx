import React, { useState, useEffect } from 'react';
import { X, Save, Edit3, Calendar } from 'lucide-react';

interface NotesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  displayLabel: string;
  noteKey: string | null;
  initialNote: string;
  isRange: boolean;
  onSave: (key: string, note: string) => void;
}

export default function NotesPanel({
  isOpen, onClose, displayLabel, noteKey, initialNote, isRange, onSave
}: NotesPanelProps) {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (isOpen) setContent(initialNote);
  }, [initialNote, isOpen]);

  if (!noteKey || !isOpen) return null;

  const handleSave = () => {
    onSave(noteKey, content);
    onClose();
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
        <div className="flex items-center space-x-2">
          {isRange ? <Calendar className="w-4 h-4 flex-shrink-0 text-[var(--theme-primary)]" /> : <Edit3 className="w-4 h-4 flex-shrink-0 text-[var(--theme-primary)]" />}
          <div className="min-w-0">
            <span className="font-semibold text-sm text-slate-700 block">
              {isRange ? 'Range Note' : 'Date Note'}
            </span>
            <p className="text-xs text-slate-400 truncate">{displayLabel}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors flex-shrink-0 ml-2"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Textarea */}
      <div className="p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isRange ? 'Add a note for this date range…' : 'Write your thoughts, reminders, or events…'}
          className="w-full h-28 resize-none outline-none text-slate-700 text-sm placeholder:text-slate-300 leading-relaxed"
          autoFocus
        />
      </div>

      {/* Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end rounded-b-2xl">
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-4 py-2 bg-[var(--theme-primary)] text-white text-sm font-medium rounded-full shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Save Note</span>
        </button>
      </div>
    </div>
  );
}
