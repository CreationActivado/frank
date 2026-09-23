import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Euro,
  CheckSquare,
  FileText,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Plus,
  Filter,
} from 'lucide-react';
import { CalendarUnifiedItem } from '../types';

interface CalendarViewProps {
  items: CalendarUnifiedItem[];
  onOpenNewTask?: () => void;
  onOpenNewPostIt?: () => void;
  onOpenNewTransaction?: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  items,
  onOpenNewTask,
  onOpenNewPostIt,
  onOpenNewTransaction,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Calendar grid calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  // Convert to Monday = 0
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filterType !== 'all' && item.type !== filterType) return false;
      return true;
    });
  }, [items, filterType]);

  // Group items by date string (YYYY-MM-DD)
  const itemsByDate = useMemo(() => {
    const map: Record<string, CalendarUnifiedItem[]> = {};
    filteredItems.forEach((item) => {
      if (!map[item.date]) map[item.date] = [];
      map[item.date].push(item);
    });
    return map;
  }, [filteredItems]);

  // Selected date items
  const selectedDayItems = useMemo(() => {
    return itemsByDate[selectedDateStr] || [];
  }, [itemsByDate, selectedDateStr]);

  // Month financial projections
  const monthStats = useMemo(() => {
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    let expectedInflow = 0;
    let expectedOutflow = 0;
    let pendingTasksCount = 0;

    items.forEach((item) => {
      if (item.date.startsWith(monthPrefix)) {
        if (item.type === 'income' && item.amount) {
          expectedInflow += item.amount;
        } else if (item.type === 'expense' && item.amount) {
          expectedOutflow += item.amount;
        } else if (item.type === 'task' && !item.isCompleted) {
          pendingTasksCount++;
        }
      }
    });

    return { expectedInflow, expectedOutflow, pendingTasksCount };
  }, [items, year, month]);

  const typeConfig: Record<
    CalendarUnifiedItem['type'],
    { label: string; badge: string; dot: string; color: string; bg: string }
  > = {
    pending_income: {
      label: 'Cobro Esperado',
      badge: '💰',
      dot: 'bg-emerald-400',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/15 border-emerald-500/30',
    },
    future_expense: {
      label: 'Gasto / Vencimiento',
      badge: '🛡️',
      dot: 'bg-rose-400',
      color: 'text-rose-400',
      bg: 'bg-rose-500/15 border-rose-500/30',
    },
    task: {
      label: 'Tarea',
      badge: '📋',
      dot: 'bg-blue-400',
      color: 'text-blue-400',
      bg: 'bg-blue-500/15 border-blue-500/30',
    },
    postit: {
      label: 'Post-It',
      badge: '📝',
      dot: 'bg-yellow-400',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/15 border-yellow-500/30',
    },
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#1E293B] to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">📅</span>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Agenda Unificada & Calendario
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Visión temporal cruzada: cobros previstos, gastos futuros, tareas y recordatorios.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'calendar' ? 'timeline' : 'calendar')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
            >
              {viewMode === 'calendar' ? 'Ver como Línea Temporal' : 'Ver como Calendario'}
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl text-xs font-semibold border border-blue-500/30 transition-all"
            >
              Hoy
            </button>
          </div>
        </div>

        {/* Month Financial Balance Header Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-slate-400 text-[11px]">Cobros Esperados ({monthNames[month]})</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                +{monthStats.expectedInflow.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
              </div>
            </div>
            <ArrowDownLeft className="w-5 h-5 text-emerald-400/70" />
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-slate-400 text-[11px]">Compromisos / Fijos ({monthNames[month]})</div>
              <div className="text-base font-bold text-rose-400 mt-0.5">
                -{monthStats.expectedOutflow.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-rose-400/70" />
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-slate-400 text-[11px]">Tareas del Mes</div>
              <div className="text-base font-bold text-blue-400 mt-0.5">
                {monthStats.pendingTasksCount} pendientes
              </div>
            </div>
            <CheckSquare className="w-5 h-5 text-blue-400/70" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-thin text-xs">
        <div className="flex items-center gap-1">
          {[
            { id: 'all', label: 'Todo el Sistema' },
            { id: 'income', label: '💰 Cobros' },
            { id: 'expense', label: '🛡️ Gastos Fijos' },
            { id: 'task', label: '📋 Tareas' },
            { id: 'postit', label: '📝 Post-Its' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar View Mode */}
      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid (2 cols) */}
          <div className="lg:col-span-2 bg-[#1E293B]/70 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            {/* Month Header Navigation */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white capitalize">
                {monthNames[month]} {year}
              </h2>

              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                  title="Mes anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                  title="Mes siguiente"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider py-1 border-b border-slate-800">
              <div>Lun</div>
              <div>Mar</div>
              <div>Mié</div>
              <div>Jue</div>
              <div>Vie</div>
              <div>Sáb</div>
              <div>Dom</div>
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Empty placeholder cells before the 1st */}
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-16 sm:h-20 rounded-xl bg-slate-900/20 opacity-30" />
              ))}

              {/* Real month days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNumber = i + 1;
                const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
                  dayNumber
                ).padStart(2, '0')}`;
                const isToday = dayStr === new Date().toISOString().split('T')[0];
                const isSelected = dayStr === selectedDateStr;
                const dayItems = itemsByDate[dayStr] || [];

                return (
                  <button
                    key={dayStr}
                    type="button"
                    onClick={() => setSelectedDateStr(dayStr)}
                    className={`h-16 sm:h-20 rounded-xl p-1.5 flex flex-col justify-between border transition-all text-left group ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/30'
                        : isToday
                        ? 'bg-slate-800/80 border-slate-600'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs font-semibold rounded-md px-1 ${
                          isToday
                            ? 'bg-blue-600 text-white'
                            : isSelected
                            ? 'text-blue-300 font-bold'
                            : 'text-slate-300'
                        }`}
                      >
                        {dayNumber}
                      </span>
                      {dayItems.length > 0 && (
                        <span className="text-[10px] font-bold text-slate-400">
                          {dayItems.length}
                        </span>
                      )}
                    </div>

                    {/* Dot badges */}
                    <div className="flex items-center gap-1 flex-wrap overflow-hidden max-h-6">
                      {dayItems.slice(0, 3).map((it) => (
                        <span
                          key={it.id}
                          className={`w-1.5 h-1.5 rounded-full ${typeConfig[it.type].dot}`}
                          title={`${typeConfig[it.type].label}: ${it.title}`}
                        />
                      ))}
                      {dayItems.length > 3 && (
                        <span className="text-[9px] text-slate-500 font-bold">+</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Detail Sidebar (1 col) */}
          <div className="bg-[#1E293B]/70 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">Eventos del Día</h3>
                  <p className="text-xs text-slate-400">{selectedDateStr}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedDayItems.length} registros
                </span>
              </div>

              {selectedDayItems.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <div className="text-2xl">🌱</div>
                  <p className="text-xs text-slate-400">
                    No hay compromisos ni tareas registradas para esta fecha.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 mt-4 max-h-[360px] overflow-y-auto pr-1">
                  {selectedDayItems.map((it) => {
                    const cfg = typeConfig[it.type];
                    return (
                      <div
                        key={it.id}
                        className={`p-3 rounded-xl border ${cfg.bg} flex items-start justify-between gap-2`}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs">{cfg.badge}</span>
                            <span className="text-xs font-bold text-white tracking-tight">
                              {it.title}
                            </span>
                          </div>
                          {it.notes && (
                            <p className="text-[11px] text-slate-300 line-clamp-1">{it.notes}</p>
                          )}
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span>{cfg.label}</span>
                            {it.time && (
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3" />
                                {it.time}
                              </span>
                            )}
                          </div>
                        </div>

                        {it.amount !== undefined && (
                          <span
                            className={`text-xs font-bold ${
                              it.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {it.type === 'income' ? '+' : '-'}
                            {it.amount} €
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
              {onOpenNewTask && (
                <button
                  onClick={onOpenNewTask}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all text-center"
                >
                  + Tarea
                </button>
              )}
              {onOpenNewPostIt && (
                <button
                  onClick={onOpenNewPostIt}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all text-center"
                >
                  + Post-It
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Timeline View Mode */
        <div className="bg-[#1E293B]/70 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white">Línea Temporal de Compromisos</h2>
          <div className="space-y-3">
            {filteredItems
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((it) => {
                const cfg = typeConfig[it.type];
                return (
                  <div
                    key={it.id}
                    className={`p-3.5 rounded-2xl border ${cfg.bg} flex items-center justify-between gap-3`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-center px-2 py-1 bg-slate-900/60 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-400">{it.date.slice(5, 7)}</div>
                        <div className="text-sm font-bold text-white">{it.date.slice(8, 10)}</div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{cfg.badge}</span>
                          <span className="text-sm font-bold text-white">{it.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            {cfg.label}
                          </span>
                        </div>
                        {it.notes && (
                          <p className="text-xs text-slate-400 mt-0.5">{it.notes}</p>
                        )}
                      </div>
                    </div>

                    {it.amount !== undefined && (
                      <span
                        className={`text-sm font-bold ${
                          it.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {it.type === 'income' ? '+' : '-'}
                        {it.amount} €
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
