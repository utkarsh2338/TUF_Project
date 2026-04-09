import { AnimatePresence, motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { X, BookOpen, Trash2, StickyNote, Calendar, Hash } from 'lucide-react';

interface AllNotesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Record<string, string>;
  onDelete: (key: string) => void;
  onEdit: (key: string) => void;
}

function parseNoteKey(key: string): { label: string; isRange: boolean } {
  if (key.includes('_to_')) {
    const [start, end] = key.split('_to_');
    try {
      const s = format(parseISO(start), 'MMM d, yyyy');
      const e = format(parseISO(end), 'MMM d, yyyy');
      return { label: `${s} – ${e}`, isRange: true };
    } catch {
      return { label: key, isRange: true };
    }
  }
  try {
    return { label: format(parseISO(key), 'EEEE, MMMM d, yyyy'), isRange: false };
  } catch {
    return { label: key, isRange: false };
  }
}

export default function AllNotesPanel({ isOpen, onClose, notes, onDelete, onEdit }: AllNotesPanelProps) {
  const sortedEntries = Object.entries(notes)
    .filter(([, content]) => content.trim())
    .sort(([a], [b]) => a.localeCompare(b));

  const singleNotes = sortedEntries.filter(([k]) => !k.includes('_to_'));
  const rangeNotes = sortedEntries.filter(([k]) => k.includes('_to_'));

  const renderCard = ([key, content]: [string, string]) => {
    const { label, isRange } = parseNoteKey(key);
    return (
      <motion.div
        key={key}
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="group bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 hover:shadow-md rounded-2xl p-4 transition-all duration-200 cursor-pointer"
        onClick={() => { onEdit(key); onClose(); }}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-primary)' }}>
            {label}
          </p>
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-50 text-slate-300 hover:text-red-400 flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); onDelete(key); }}
            title="Delete note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap line-clamp-4">
          {content}
        </p>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-5 border-b border-slate-100"
              style={{ background: 'var(--theme-primary)' }}
            >
              <div className="flex items-center space-x-2 text-white">
                <BookOpen className="w-5 h-5" />
                <span className="font-bold text-lg tracking-tight">All Notes</span>
                {sortedEntries.length > 0 && (
                  <span className="ml-1 bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    {sortedEntries.length}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notes list */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              {sortedEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-3 pt-16">
                  <StickyNote className="w-14 h-14 opacity-30" />
                  <p className="text-sm font-medium text-slate-400">No notes yet.</p>
                  <p className="text-xs text-slate-300 text-center px-6">
                    Select a date or range and tap "Add Note" to get started.
                  </p>
                </div>
              ) : (
                <>
                  {/* Single date notes */}
                  {singleNotes.length > 0 && (
                    <section>
                      <div className="flex items-center gap-1.5 mb-2 px-1">
                        <Hash className="w-3.5 h-3.5 text-slate-400" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Date Notes</h3>
                        <span className="text-xs text-slate-300">({singleNotes.length})</span>
                      </div>
                      <div className="space-y-3">{singleNotes.map(renderCard)}</div>
                    </section>
                  )}

                  {/* Range notes */}
                  {rangeNotes.length > 0 && (
                    <section>
                      <div className="flex items-center gap-1.5 mb-2 px-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Range Notes</h3>
                        <span className="text-xs text-slate-300">({rangeNotes.length})</span>
                      </div>
                      <div className="space-y-3">{rangeNotes.map(renderCard)}</div>
                    </section>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {sortedEntries.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-100 text-xs text-slate-400 text-center">
                Click any note to edit · Hover to delete
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
