import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CalendarDays,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  FolderGit2,
  Target,
  Send,
  StickyNote,
  CheckSquare,
  Square,
  Pin,
  Euro,
  Zap,
  DollarSign,
  Smile,
  Sliders,
  Rocket,
  Building,
  Flame,
  Brain,
  Plus,
  Scan,
  Moon,
} from 'lucide-react';
import {
  FinancialSummary,
  Project,
  FinancialGoal,
  PostIt,
  Task,
  Habit,
  CrekoLead,
  CrekoQuote,
  SpainProcessDoc,
  Mission,
  Changa,
} from '../types';
import { HomeHeroMVP } from './HomeHeroMVP';
import { WelcomeOutfitBriefing } from './WelcomeOutfitBriefing';
import { WhatToDoNowCard } from './WhatToDoNowCard';
import { MisPendientesSection } from './MisPendientesSection';
import { TodayTimeBlocks } from './TodayTimeBlocks';
import { api } from '../services/api';

interface DashboardViewProps {
  summary: FinancialSummary | null;
  projects: Project[];
  goals: FinancialGoal[];
  postits?: PostIt[];
  tasks?: Task[];
  habits?: Habit[];
  crekoLeads?: CrekoLead[];
  crekoQuotes?: CrekoQuote[];
  spainDocs?: SpainProcessDoc[];
  missions?: Mission[];
  changas?: Changa[];
  activeModules?: string[];
  period: 'today' | 'week' | 'month';
  setPeriod: (period: 'today' | 'week' | 'month') => void;
  onNavigate: (view: string) => void;
  onQuickChat: (text: string) => void;
  onOpenReceivePending: (pendingId: string) => void;
  onToggleTaskStatus?: (id: string) => Promise<void>;
  onToggleHabit?: (id: string) => Promise<void>;
  onOpenWhatToDo: () => void;
  onOpenMakeMoney: () => void;
  onOpenCheckin: () => void;
  onOpenDesigner: () => void;
  onOpenReceiptScanner?: () => void;
  onOpenDayClosing?: () => void;
  onOpenQuickChanga?: () => void;
  onRefreshData?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  projects,
  goals,
  postits = [],
  tasks = [],
  habits = [],
  crekoLeads = [],
  crekoQuotes = [],
  spainDocs = [],
  missions = [],
  changas = [],
  activeModules = [
    'finances',
    'postits',
    'tasks',
    'creko',
    'spain_process',
    'habits',
    'missions',
    'agenda',
  ],
  period,
  setPeriod,
  onNavigate,
  onQuickChat,
  onOpenReceivePending,
  onToggleTaskStatus,
  onToggleHabit,
  onOpenWhatToDo,
  onOpenMakeMoney,
  onOpenCheckin,
  onOpenDesigner,
  onOpenReceiptScanner,
  onOpenDayClosing,
  onOpenQuickChanga,
  onRefreshData,
}) => {
  const [quickInput, setQuickInput] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onQuickChat(quickInput);
    setQuickInput('');
  };

  if (!summary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">Cargando centro de control...</p>
        </div>
      </div>
    );
  }

  const {
    realBalance,
    pendingIncomeTotal,
    futureExpensesTotal,
    projectedPosition,
    reserveTarget,
    reserveCurrent,
    reservePercentage,
    periodStats,
    alerts,
  } = summary;

  return (
    <div className="space-y-6 pb-24 text-slate-200">
      {/* 1. HOME "HOLA FRAN" (PRIORIDAD 1 MVP - <30 SEGUNDOS) */}
      <HomeHeroMVP
        onOpenExpense={() => {
          if (onOpenReceiptScanner) onOpenReceiptScanner();
          else onOpenMakeMoney();
        }}
        onOpenCheckin={onOpenCheckin}
        onOpenChanga={() => {
          if (onOpenQuickChanga) onOpenQuickChanga();
          else onNavigate('changas');
        }}
        onOpenTasks={() => {
          const el = document.getElementById('section-mis-pendientes');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          else onNavigate('tasks');
        }}
        onOpenCalendar={() => onNavigate('calendar')}
        onOpenJarvis={onOpenWhatToDo}
        onOpenHealth={() => onNavigate('health')}
        latestMood={8}
        latestEnergy={8}
      />

      {/* APERTURA OPERATIVA: SPOTIFY + VESTIMENTA RECOMENDADA + REPORTE PENDIENTES */}
      <WelcomeOutfitBriefing
        onOpenTasks={() => {
          const el = document.getElementById('section-mis-pendientes');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          else onNavigate('tasks');
        }}
        onOpenCheckin={onOpenCheckin}
        onOpenQuickChanga={onOpenQuickChanga}
      />

      {/* 2. "¿QUÉ HAGO AHORA?" (PRIORIDAD 8 MVP) */}
      <WhatToDoNowCard
        tasks={tasks}
        quotes={crekoQuotes}
        leads={crekoLeads}
        summary={summary}
        onNavigate={onNavigate}
        onToggleTask={onToggleTaskStatus}
      />

      {/* 3. MIS PENDIENTES (PRIORIDAD 5 MVP - HOY / SEMANA / FUTURO) */}
      <div id="section-mis-pendientes">
        <MisPendientesSection
          tasks={tasks}
          projects={projects}
          onToggleTask={onToggleTaskStatus || (async () => {})}
          onCreateTask={async (newTask) => {
            await api.createTask({
              title: newTask.title,
              priority: newTask.priority,
              dueDate: newTask.dueDate || new Date().toISOString().split('T')[0],
              projectId: newTask.projectId,
              status: 'todo',
            });
            if (onRefreshData) onRefreshData();
          }}
        />
      </div>

      {/* 4. BLOQUES HORARIOS DE HOY (PRIORIDAD 7 MVP) */}
      <TodayTimeBlocks />

      {/* JARVIS 2.0 STRATEGIC COMMAND BAR */}
      <div className="bg-[#1E293B] rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              Acciones Estratégicas de Franco
              <span className="text-[10px] text-blue-400 font-normal">· Proteger → Crecer</span>
            </h2>
            <p className="text-[11px] text-slate-400">JARVIS propone, vos confirmás.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          <button
            onClick={onOpenWhatToDo}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
            id="btn-what-to-do"
          >
            <Zap className="w-4 h-4 fill-white/30" /> ¿Qué hago hoy?
          </button>

          <button
            onClick={onOpenMakeMoney}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
            id="btn-make-money"
          >
            <DollarSign className="w-4 h-4" /> Generar Dinero
          </button>

          <button
            onClick={onOpenCheckin}
            className="px-3 py-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            id="btn-daily-checkin"
          >
            <Smile className="w-4 h-4 text-purple-400" /> ¿Cómo estás?
          </button>

          {onOpenReceiptScanner && (
            <button
              onClick={onOpenReceiptScanner}
              className="px-3 py-2 rounded-xl bg-blue-950/50 hover:bg-blue-900/60 border border-blue-500/40 text-blue-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              id="btn-dashboard-scan-receipt"
              title="Subir o sacar foto a un ticket o factura"
            >
              <Scan className="w-4 h-4 text-blue-400" /> Ticket OCR
            </button>
          )}

          {onOpenDayClosing && (
            <button
              onClick={onOpenDayClosing}
              className="px-3 py-2 rounded-xl bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              id="btn-dashboard-day-closing"
              title="Cierre nocturno de cuentas y balance"
            >
              <Moon className="w-4 h-4 text-indigo-400" /> Cierre
            </button>
          )}

          <button
            onClick={onOpenDesigner}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            id="btn-designer-mode"
          >
            <Sliders className="w-4 h-4 text-blue-400" /> Editar
          </button>
        </div>
      </div>

      {/* Mobile-First Fast Input Bar ("El corazón de la app") */}
      <div className="bg-[#1E293B] rounded-2xl p-4 sm:p-6 text-white shadow-xl border border-slate-800">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-500/15 rounded-lg border border-blue-500/30 text-blue-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Registro Rápido en Lenguaje Natural
            </span>
          </div>
          <button
            onClick={() => onNavigate('chat')}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
          >
            Abrir Chat <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleQuickSubmit} className="relative flex items-center">
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Ej: Gasté 12 euros en comida con efectivo..."
            className="w-full bg-slate-900/90 text-white placeholder:text-slate-500 rounded-full px-5 py-3 pr-12 text-sm sm:text-base border border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
            id="input-dashboard-quick-chat"
          />
          <button
            type="submit"
            disabled={!quickInput.trim()}
            className="absolute right-2 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all"
            id="btn-dashboard-quick-submit"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Example prompts */}
        <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
          {[
            'Gasté 12 € en comida con efectivo',
            'Cobré los 180 del electricista',
            'Gasté 35 € en nafta con la Naranja',
            'Gasté 80 € en materiales para Rotuprint con Galicia',
            '¿Cómo estoy económicamente?',
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onQuickChat(prompt)}
              className="text-xs bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-slate-600 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg transition-all text-left"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>

      {/* Smart Alerts Banner */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs sm:text-sm ${
                alert.type === 'critical'
                  ? 'bg-rose-950/30 border-rose-800/50 text-rose-300'
                  : alert.type === 'warning'
                  ? 'bg-amber-950/30 border-amber-800/50 text-amber-300'
                  : 'bg-blue-950/30 border-blue-800/50 text-blue-300'
              }`}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">{alert.title}</p>
                <p className="opacity-90">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stability Metric & Personal Context Banner */}
      {summary.stability && (
        <div className="bg-[#1E293B] rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/15 rounded-xl border border-blue-500/30 text-blue-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">Diagnóstico Real de Estabilidad</h2>
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      summary.stability.status === 'stable'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : summary.stability.status === 'tight'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {summary.stability.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Contexto: España · Etapa: Construcción de Estabilidad · Ingresos Variables
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Autonomía</span>
                <span className="text-sm font-bold text-white">~{summary.stability.runwayWeeks} sem</span>
              </div>
              <div className="h-6 w-px bg-slate-700"></div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Ritmo Egreso</span>
                <span className="text-sm font-bold text-slate-300">~{summary.stability.weeklyBurnRate} €/sem</span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Lectura Objetiva de Situación
              </span>
              <p className="text-slate-300 leading-relaxed">{summary.stability.reason}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/40">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-300 block mb-1">
                Criterio Firme & Recomendación
              </span>
              <p className="text-blue-200/90 leading-relaxed">{summary.stability.advice}</p>
            </div>
          </div>

          {/* Quick Decision Trigger Buttons */}
          <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Consultas directas de decisión:</span>
            {[
              '¿Puedo gastar 60 € en CTC?',
              '¿Puedo gastar 30 € en ocio?',
              '¿Cómo está mi estabilidad?',
              '¿Cuánto tengo para vivir este mes?',
            ].map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onQuickChat(q)}
                className="text-xs bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Segregación de Capital (Buckets) */}
      {summary.capitalBuckets && (
        <div className="bg-[#1E293B] rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-400" />
                Segregación de Capital (Distribución de Fondos)
              </h2>
              <p className="text-xs text-slate-400">
                Separación entre dinero para vivir, fondo de reserva intocable y capital de proyectos
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Dinero para Vivir
              </span>
              <div className="text-lg sm:text-xl font-bold text-white">
                {summary.capitalBuckets.livingMoney.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Supervivencia y gastos fijos</span>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/40">
              <span className="text-[10px] uppercase font-semibold text-blue-400 block mb-1">
                Reserva de Seguridad
              </span>
              <div className="text-lg sm:text-xl font-bold text-blue-400">
                {summary.capitalBuckets.reserveMoney.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
              </div>
              <span className="text-[10px] text-blue-300 mt-1 block">Fondo intocable ({summary.reservePercentage}%)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/40">
              <span className="text-[10px] uppercase font-semibold text-purple-400 block mb-1">
                Asignado a Proyectos
              </span>
              <div className="text-lg sm:text-xl font-bold text-purple-400">
                {summary.capitalBuckets.projectsMoney.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
              </div>
              <span className="text-[10px] text-purple-300 mt-1 block">Gastos acumulados proyectos</span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
              <span className="text-[10px] uppercase font-semibold text-emerald-400 block mb-1">
                Disponible Real
              </span>
              <div className="text-lg sm:text-xl font-bold text-emerald-400">
                {summary.capitalBuckets.availableMoney.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
              </div>
              <span className="text-[10px] text-emerald-300 mt-1 block">Margen libre tras reserva</span>
            </div>
          </div>
        </div>
      )}

      {/* Primary Financial Position Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. DINERO DISPONIBLE (Saldo Real) - Hero Card in Sleek Gradient */}
        <div
          onClick={() => onNavigate('accounts')}
          className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-2xl shadow-xl shadow-blue-500/15 cursor-pointer group relative overflow-hidden transition-all hover:scale-[1.01]"
          id="card-real-balance"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">
              Dinero Disponible
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {realBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-blue-200">
            <span className="bg-white/20 px-2 py-0.5 rounded text-white text-[11px] font-medium">Confirmado en cuentas</span>
            <span className="font-medium group-hover:underline flex items-center text-white">
              Ver cuentas <ChevronRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* 2. PENDIENTE DE COBRAR */}
        <div
          onClick={() => onNavigate('transactions')}
          className="bg-[#1E293B] p-5 rounded-2xl border border-slate-800 hover:border-slate-700 shadow-sm transition-all cursor-pointer group"
          id="card-pending-income"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pendiente de Cobrar
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-400">
            +{pendingIncomeTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>No suma al disponible</span>
            <span className="text-blue-400 font-medium group-hover:underline flex items-center">
              Gestionar <ChevronRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* 3. PRÓXIMOS GASTOS */}
        <div
          onClick={() => onNavigate('transactions')}
          className="bg-[#1E293B] p-5 rounded-2xl border border-slate-800 hover:border-slate-700 shadow-sm transition-all cursor-pointer group"
          id="card-future-expenses"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Próximos Gastos
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-400">
            -{futureExpensesTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Gastos previstos</span>
            <span className="text-amber-400 font-medium group-hover:underline flex items-center">
              Ver calendario <ChevronRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* 4. RESERVA DE SEGURIDAD */}
        <div
          onClick={() => onNavigate('goals')}
          className="bg-[#1E293B] p-5 rounded-2xl border border-slate-800 hover:border-slate-700 shadow-sm transition-all cursor-pointer group"
          id="card-reserve"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Reserva de Seguridad
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white">
              {reserveCurrent.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €
            </span>
            <span className="text-xs text-slate-400 font-medium">
              / {reserveTarget.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €
            </span>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-700/80 rounded-full h-2 overflow-hidden flex">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, reservePercentage)}%` }}
              ></div>
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-slate-400">
              <span>{reservePercentage}% completado</span>
              <span className="text-blue-400 font-medium group-hover:underline">Ajustar</span>
            </div>
          </div>
        </div>
      </div>

      {/* POSICIÓN PROYECTADA: REAL vs ESTIMADO Breakdown */}
      <div className="bg-[#1E293B] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Planificación y Posición Proyectada
            </h2>
            <p className="text-xs text-slate-400">
              Distinción transparente entre tu dinero real y el flujo financiero estimado
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-300 font-medium">Posición proyectada:</span>
            <span className="text-base font-bold text-emerald-400">
              {projectedPosition.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Saldo Real Actual
            </span>
            <span className="text-lg font-bold text-white">
              {realBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
            </span>
            <span className="block text-[11px] text-emerald-400 font-medium mt-0.5">
              Confirmado en cuentas
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              + Cobros Pendientes
            </span>
            <span className="text-lg font-bold text-blue-400">
              +{pendingIncomeTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
            </span>
            <span className="block text-[11px] text-slate-400 mt-0.5">
              Estimado (ej. Electricista 180 €)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              - Gastos Previstos
            </span>
            <span className="text-lg font-bold text-amber-400">
              -{futureExpensesTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
            </span>
            <span className="block text-[11px] text-slate-400 mt-0.5">
              Estimado (ej. Servicios 95 €)
            </span>
          </div>
        </div>
      </div>

      {/* Período: Hoy / Semana / Mes + Estadísticas */}
      <div className="bg-[#1E293B] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-400" />
              Flujo del Período
            </h2>
            <p className="text-xs text-slate-400">
              Transferencias entre cuentas propias no alteran ingresos ni gastos
            </p>
          </div>

          {/* Period selector */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl w-fit border border-slate-800">
            {(['today', 'week', 'month'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  period === p
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                id={`btn-period-${p}`}
              >
                {p === 'today' ? 'Hoy' : p === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-300">Ingresos del período</span>
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
              +{periodStats.income.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
            </div>
          </div>

          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-rose-300">Gastos del período</span>
              <ArrowUpRight className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-rose-400 mt-1">
              -{periodStats.expenses.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-300">Balance neto</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div
              className={`text-xl sm:text-2xl font-bold mt-1 ${
                periodStats.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {periodStats.netBalance >= 0 ? '+' : ''}
              {periodStats.netBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
            </div>
          </div>
        </div>
      </div>

      {/* JARVIS OS: Centro de Acción y Tablero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Post-Its Inteligentes */}
        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-yellow-400" />
                <h3 className="font-bold text-white text-sm">Tablero de Post-Its</h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-300 font-semibold">
                  {postits.filter((p) => p.status === 'active').length} notas
                </span>
              </div>
              <button
                onClick={() => onNavigate('postits')}
                className="text-xs text-yellow-400 font-medium hover:underline flex items-center gap-0.5"
              >
                Abrir Tablero <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {postits.filter((p) => p.status === 'active').length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No hay post-its activos. Anotá algo en el botón superior o desde el chat.
              </div>
            ) : (
              <div className="space-y-2.5">
                {postits
                  .filter((p) => p.status === 'active')
                  .slice(0, 3)
                  .map((p) => {
                    const isRed = p.colorPriority === 'red';
                    const isPurple = p.colorPriority === 'purple';
                    const isOrange = p.colorPriority === 'orange';
                    const isBlue = p.colorPriority === 'blue';
                    const isGreen = p.colorPriority === 'green';
                    const emoji = isPurple ? '🟣' : isOrange ? '🟠' : isBlue ? '🔵' : isRed ? '🔴' : isGreen ? '🟢' : '🟡';
                    return (
                      <div
                        key={p.id}
                        onClick={() => onNavigate('postits')}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                          isRed
                            ? 'bg-rose-950/25 border-rose-800/50 hover:bg-rose-950/40'
                            : isPurple
                            ? 'bg-purple-950/25 border-purple-800/50 hover:bg-purple-950/40'
                            : isOrange
                            ? 'bg-amber-950/25 border-amber-800/50 hover:bg-amber-950/40'
                            : isBlue
                            ? 'bg-sky-950/25 border-sky-800/50 hover:bg-sky-950/40'
                            : isGreen
                            ? 'bg-emerald-950/25 border-emerald-800/50 hover:bg-emerald-950/40'
                            : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900/90'
                        }`}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{emoji}</span>
                            <span className="text-xs font-bold text-white tracking-tight line-clamp-1">
                              {p.title}
                            </span>
                            {p.isPinned && <Pin className="w-3 h-3 text-amber-400 fill-amber-400 rotate-45" />}
                          </div>
                          {p.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-1">{p.description}</p>
                          )}
                        </div>

                        {p.moneyAmount !== undefined && (
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/30 shrink-0">
                            {p.moneyAmount} €
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Tareas Prioritarias */}
        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-sm">Tareas & Acciones</h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 font-semibold">
                  {tasks.filter((t) => t.status !== 'done').length} pendientes
                </span>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs text-blue-400 font-medium hover:underline flex items-center gap-0.5"
              >
                Ver Todas <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {tasks.filter((t) => t.status !== 'done').length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                🎉 No hay tareas pendientes en este momento.
              </div>
            ) : (
              <div className="space-y-2.5">
                {tasks
                  .filter((t) => t.status !== 'done')
                  .slice(0, 3)
                  .map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {onToggleTaskStatus && (
                          <button
                            type="button"
                            onClick={() => onToggleTaskStatus(t.id)}
                            className="text-slate-400 hover:text-blue-400 transition-all shrink-0"
                          >
                            <Square className="w-4 h-4" />
                          </button>
                        )}
                        <span className="text-xs font-semibold text-white truncate">{t.title}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {t.financialImpact?.type === 'income_driver' && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                            💰 +{t.financialImpact.expectedAmount || 0} €
                          </span>
                        )}
                        <span className="text-[10px] font-medium text-slate-400">
                          {t.priority === 'urgent' ? '🔴' : t.priority === 'high' ? '🟠' : '🟡'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Proyectos & Metas Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proyectos */}
        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-white text-sm">Proyectos en curso</h3>
            </div>
            <button
              onClick={() => onNavigate('projects')}
              className="text-xs text-blue-400 font-medium hover:underline flex items-center"
            >
              Ver todos ({projects.length}) <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="space-y-3">
            {projects.slice(0, 3).map((proj) => (
              <div
                key={proj.id}
                onClick={() => onNavigate('projects')}
                className="p-3.5 rounded-xl border border-slate-800/90 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900/80 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white text-xs sm:text-sm">{proj.name}</span>
                  <span className="text-xs text-slate-400 font-medium">
                    Gastos: {proj.accumulatedExpenses} €
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">{proj.description}</p>
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden flex">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: `${proj.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{proj.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Objetivos */}
        <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-white text-sm">Objetivos Financieros</h3>
            </div>
            <button
              onClick={() => onNavigate('goals')}
              className="text-xs text-blue-400 font-medium hover:underline flex items-center"
            >
              Ver metas ({goals.length}) <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="space-y-3">
            {goals.slice(0, 3).map((goal) => {
              const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
              return (
                <div
                  key={goal.id}
                  onClick={() => onNavigate('goals')}
                  className="p-3.5 rounded-xl border border-slate-800/90 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900/80 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white text-xs sm:text-sm">{goal.name}</span>
                    <span className="text-xs text-slate-300 font-semibold">
                      {goal.currentAmount} € / {goal.targetAmount} €
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODULAR SECTION: CREKO OS & TRÁMITES ESPAÑA */}
      {(activeModules.includes('creko') || activeModules.includes('spain_process')) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Creko OS Card */}
          {activeModules.includes('creko') && (
            <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-blue-400" />
                    <h3 className="font-bold text-white text-sm">Creko OS · CRM & Motor Comercial</h3>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 font-semibold">
                      {crekoLeads.length} leads
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigate('creko')}
                    className="text-xs text-blue-400 font-medium hover:underline flex items-center gap-0.5"
                  >
                    Abrir Creko <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5 mb-3">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                      Pipeline Potencial
                    </span>
                    <span className="text-base font-bold text-emerald-400">
                      {crekoLeads
                        .filter((l) => l.status !== 'closed')
                        .reduce((sum, l) => sum + (l.potentialValue || 0), 0)}{' '}
                      €
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                      Presupuestos Calientes
                    </span>
                    <span className="text-base font-bold text-amber-400">
                      {crekoQuotes.filter((q) => q.status === 'waiting').length} pendientes
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {crekoLeads.slice(0, 2).map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => onNavigate('creko')}
                      className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div className="truncate">
                        <span className="font-bold text-white block truncate">{lead.name}</span>
                        <span className="text-[10px] text-slate-400">{lead.company || lead.source}</span>
                      </div>
                      <span className="font-black text-emerald-400 shrink-0">
                        {lead.potentialValue} €
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Trámites España Card */}
          {activeModules.includes('spain_process') && (
            <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-white text-sm">Trámites España · Rotuprint</h3>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-semibold">
                      {spainDocs.filter((d) => d.status === 'ready').length}/{spainDocs.length} listos
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigate('spain_process')}
                    className="text-xs text-amber-400 font-medium hover:underline flex items-center gap-0.5"
                  >
                    Ver Trámites <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200 mb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-300 block">
                      Hito Activo
                    </span>
                    <span className="font-bold text-white">Contrato Rotuprint & Documentación</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-500/20 border border-amber-500/30">
                    En curso
                  </span>
                </div>

                <div className="space-y-2">
                  {spainDocs.slice(0, 2).map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => onNavigate('spain_process')}
                      className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between text-xs cursor-pointer"
                    >
                      <span className="font-medium text-slate-200 truncate">{doc.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          doc.status === 'ready'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {doc.status === 'ready' ? 'Listo' : 'Pendiente'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CHANGAS & TRABAJOS RÁPIDOS WIDGET */}
      <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                Changas & Ingresos Rápidos
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {changas.filter((c) => c.status === 'pending').length} por cobrar
                </span>
              </h3>
            </div>
          </div>
          <button
            onClick={() => onNavigate('changas')}
            className="text-xs text-amber-400 font-medium hover:underline flex items-center gap-0.5"
          >
            Ver Todas <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {changas.slice(0, 3).map((changa) => (
            <div
              key={changa.id}
              onClick={() => onNavigate('changas')}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white truncate">{changa.title}</span>
                  <span className="font-bold text-emerald-400 shrink-0 ml-1">{changa.amount} €</span>
                </div>
                {changa.client && (
                  <p className="text-[11px] text-slate-400 truncate">Cliente: {changa.client}</p>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px]">
                <span className="text-slate-500">{changa.category}</span>
                <span
                  className={`px-1.5 py-0.5 rounded font-bold ${
                    changa.status === 'paid'
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-amber-500/15 text-amber-300'
                  }`}
                >
                  {changa.status === 'paid' ? 'Cobrado' : 'Por Cobrar'}
                </span>
              </div>
            </div>
          ))}
          {changas.length === 0 && (
            <div className="col-span-3 text-center py-4 text-xs text-slate-400">
              No tenés changas registradas aún. Hacé clic en "Ver Todas" para añadir una.
            </div>
          )}
        </div>
      </div>

      {/* MODULAR SECTION: HÁBITOS & BIENESTAR + MISIONES */}
      {(activeModules.includes('habits') || activeModules.includes('missions')) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hábitos & Bienestar */}
          {activeModules.includes('habits') && (
            <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-400" />
                    <h3 className="font-bold text-white text-sm">Hábitos & Disciplina de Hoy</h3>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 font-semibold">
                      {habits.filter((h) => h.completedToday).length}/{habits.length}
                    </span>
                  </div>
                  <button
                    onClick={onOpenCheckin}
                    className="text-xs text-orange-400 font-medium hover:underline flex items-center gap-0.5"
                  >
                    Check-in <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {habits.map((habit) => (
                    <div
                      key={habit.id}
                      onClick={() => onToggleHabit && onToggleHabit(habit.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        habit.completedToday
                          ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                          : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="truncate flex items-center gap-2">
                        <span className="text-sm">
                          {habit.completedToday ? '✅' : '⚪'}
                        </span>
                        <span className="font-semibold truncate">{habit.title}</span>
                      </div>
                      <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">
                        🔥 {habit.streak}d
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Misiones Estratégicas */}
          {activeModules.includes('missions') && (
            <div className="bg-[#1E293B] p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-white text-sm">Misiones del Mes</h3>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-semibold">
                      {missions.length} activas
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {missions.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{m.title}</span>
                        <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded">
                          {m.progress}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{m.description}</p>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${m.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BOTTOM MODULAR BUILDER CALLOUT */}
      <div className="pt-2 text-center">
        <button
          onClick={onOpenDesigner}
          className="px-5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-bold transition-all inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-blue-400" /> + AGREGAR O PERSONALIZAR MÓDULOS
        </button>
      </div>
    </div>
  );
};
