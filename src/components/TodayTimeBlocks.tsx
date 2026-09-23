import React, { useState } from 'react';
import { Clock, Plus, Sparkles, CheckCircle2, Calendar as CalendarIcon, Trash2 } from 'lucide-react';

export interface TimeBlock {
  id: string;
  timeRange: string;
  category:
    | 'contenido'
    | 'captacion'
    | 'presupuestos'
    | 'productos'
    | 'produccion'
    | 'organizacion'
    | 'tramites'
    | 'personal';
  title: string;
  confirmed: boolean;
}

const CATEGORY_STYLES: Record<
  TimeBlock['category'],
  { label: string; dot: string; bg: string; border: string; text: string }
> = {
  contenido: {
    label: 'Contenido',
    dot: '🔵',
    bg: 'bg-blue-950/40',
    border: 'border-blue-500/40',
    text: 'text-blue-300',
  },
  captacion: {
    label: 'Captación',
    dot: '🟢',
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-500/40',
    text: 'text-emerald-300',
  },
  presupuestos: {
    label: 'Presupuestos',
    dot: '🟡',
    bg: 'bg-amber-950/40',
    border: 'border-amber-500/40',
    text: 'text-amber-300',
  },
  productos: {
    label: 'Productos',
    dot: '🟣',
    bg: 'bg-purple-950/40',
    border: 'border-purple-500/40',
    text: 'text-purple-300',
  },
  produccion: {
    label: 'Producción',
    dot: '🟠',
    bg: 'bg-orange-950/40',
    border: 'border-orange-500/40',
    text: 'text-orange-300',
  },
  organizacion: {
    label: 'Organización Creko',
    dot: '⚪',
    bg: 'bg-slate-800/60',
    border: 'border-slate-600/40',
    text: 'text-slate-200',
  },
  tramites: {
    label: 'Trámites',
    dot: '🔴',
    bg: 'bg-rose-950/40',
    border: 'border-rose-500/40',
    text: 'text-rose-300',
  },
  personal: {
    label: 'Personal',
    dot: '🏋️',
    bg: 'bg-teal-950/40',
    border: 'border-teal-500/40',
    text: 'text-teal-300',
  },
};

const DEFAULT_BLOCKS: TimeBlock[] = [
  {
    id: 'tb_1',
    timeRange: '10:00 ─ 11:00',
    category: 'captacion',
    title: 'CAPTACIÓN',
    confirmed: true,
  },
  {
    id: 'tb_2',
    timeRange: '11:00 ─ 12:00',
    category: 'presupuestos',
    title: 'PRESUPUESTOS',
    confirmed: true,
  },
  {
    id: 'tb_3',
    timeRange: '12:00 ─ 14:00',
    category: 'captacion',
    title: 'CREKO / VENTA',
    confirmed: true,
  },
  {
    id: 'tb_4',
    timeRange: '16:00 ─ 17:00',
    category: 'contenido',
    title: 'CONTENIDO',
    confirmed: true,
  },
  {
    id: 'tb_5',
    timeRange: '17:00 ─ 17:30',
    category: 'tramites',
    title: 'ROTUPRINT',
    confirmed: true,
  },
  {
    id: 'tb_6',
    timeRange: '18:30',
    category: 'personal',
    title: 'GYM / ENTRENAMIENTO',
    confirmed: true,
  },
];

export const TodayTimeBlocks: React.FC = () => {
  const [blocks, setBlocks] = useState<TimeBlock[]>(DEFAULT_BLOCKS);
  const [isAdding, setIsAdding] = useState(false);
  const [newTime, setNewTime] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCat, setNewCat] = useState<TimeBlock['category']>('captacion');

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTime.trim()) return;
    const newB: TimeBlock = {
      id: `tb_${Date.now()}`,
      timeRange: newTime.trim(),
      category: newCat,
      title: newTitle.trim(),
      confirmed: true,
    };
    setBlocks((prev) => [...prev, newB]);
    setNewTime('');
    setNewTitle('');
    setIsAdding(false);
  };

  const handleRemoveBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSuggestJarvis = () => {
    setBlocks(DEFAULT_BLOCKS);
  };

  return (
    <div className="bg-[#1E293B] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            📅 Bloques de Trabajo de Hoy
            <span className="text-[10px] bg-blue-500/20 text-blue-300 font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">
              Agenda visual
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Organización por bloques de foco: JARVIS sugiere, Fran confirma.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSuggestJarvis}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all"
            title="Recargar bloques sugeridos por JARVIS"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Sugerir con JARVIS
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Bloque
          </button>
        </div>
      </div>

      {/* Add form */}
      {isAdding && (
        <form onSubmit={handleAddBlock} className="p-3.5 bg-slate-900 rounded-2xl border border-blue-500/40 space-y-3 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Horario
              </label>
              <input
                type="text"
                placeholder="Ej. 10:00 ─ 11:00"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Categoría
              </label>
              <select
                value={newCat}
                onChange={(e) => setNewCat(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
              >
                {Object.entries(CATEGORY_STYLES).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.dot} {info.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Actividad
              </label>
              <input
                type="text"
                placeholder="Ej. CREKO / VENTA"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
            >
              Añadir Bloque
            </button>
          </div>
        </form>
      )}

      {/* Timeline items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {blocks.map((b) => {
          const style = CATEGORY_STYLES[b.category] || CATEGORY_STYLES.captacion;
          return (
            <div
              key={b.id}
              className={`p-3 rounded-2xl border ${style.bg} ${style.border} flex items-center justify-between gap-3 group transition-all`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-base shrink-0">{style.dot}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-300">
                      {b.timeRange}
                    </span>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider block truncate ${style.text}`}>
                    {b.title}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded-md bg-slate-900/60 border border-slate-800">
                  {style.label}
                </span>
                <button
                  onClick={() => handleRemoveBlock(b.id)}
                  className="p-1 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                  title="Eliminar bloque"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
