import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { ChatView } from './components/ChatView';
import { TransactionsView } from './components/TransactionsView';
import { AccountsView } from './components/AccountsView';
import { ProjectsView } from './components/ProjectsView';
import { GoalsReserveView } from './components/GoalsReserveView';
import { MemorySettingsView } from './components/MemorySettingsView';
import { JarvisBoardView } from './components/JarvisBoardView';
import { TasksView } from './components/TasksView';
import { CalendarView } from './components/CalendarView';
import { TransactionModal } from './components/TransactionModal';
import { TransferModal } from './components/TransferModal';
import { PendingIncomeModal } from './components/PendingIncomeModal';
import { FutureExpenseModal } from './components/FutureExpenseModal';
import { PostItModal } from './components/PostItModal';
import { TaskModal } from './components/TaskModal';
import { CrekoOSView } from './components/CrekoOSView';
import { SpainProcessView } from './components/SpainProcessView';
import { ChangasView } from './components/ChangasView';
import { CustomModulesView } from './components/CustomModulesView';
import { WhatToDoModal } from './components/WhatToDoModal';
import { MakeMoneyModal } from './components/MakeMoneyModal';
import { DailyCheckinModal } from './components/DailyCheckinModal';
import { DesignerSettingsModal } from './components/DesignerSettingsModal';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { DayClosingModal } from './components/DayClosingModal';
import { QuickChangaModal } from './components/QuickChangaModal';
import { HealthView } from './components/HealthView';
import { api } from './services/api';
import {
  FinancialSummary,
  Account,
  Transaction,
  Category,
  Project,
  PendingIncome,
  FutureExpense,
  Reserve,
  FinancialGoal,
  UserMemory,
  ChatMessage,
  PostIt,
  Task,
  CalendarUnifiedItem,
  PostItColorPriority,
  Habit,
  DailyCheckin,
  CrekoLead,
  CrekoQuote,
  GoogleMapsOpportunity,
  CrekoProductionOrder,
  CrekoContentItem,
  SpainProcessDoc,
  Mission,
  JarvisSettings,
  Changa,
  CustomAiModule,
  DayClosing,
} from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('month');

  // Core state
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pendingIncomes, setPendingIncomes] = useState<PendingIncome[]>([]);
  const [futureExpenses, setFutureExpenses] = useState<FutureExpense[]>([]);
  const [reserve, setReserve] = useState<Reserve | null>(null);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [memory, setMemory] = useState<UserMemory[]>([]);

  // JARVIS OS: Post-It, Task & Calendar state
  const [postits, setPostIts] = useState<PostIt[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [calendarItems, setCalendarItems] = useState<CalendarUnifiedItem[]>([]);

  // JARVIS 2.0 State
  const [habits, setHabits] = useState<Habit[]>([]);
  const [crekoLeads, setCrekoLeads] = useState<CrekoLead[]>([]);
  const [crekoQuotes, setCrekoQuotes] = useState<CrekoQuote[]>([]);
  const [crekoOpportunities, setCrekoOpportunities] = useState<GoogleMapsOpportunity[]>([]);
  const [crekoProduction, setCrekoProduction] = useState<CrekoProductionOrder[]>([]);
  const [crekoContent, setCrekoContent] = useState<CrekoContentItem[]>([]);
  const [changas, setChangas] = useState<Changa[]>([]);
  const [customModules, setCustomModules] = useState<CustomAiModule[]>([]);
  const [dayClosings, setDayClosings] = useState<DayClosing[]>([]);
  const [spainDocs, setSpainDocs] = useState<SpainProcessDoc[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [jarvisSettings, setJarvisSettings] = useState<JarvisSettings | null>(null);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [isFutureModalOpen, setIsFutureModalOpen] = useState(false);
  const [isPostItModalOpen, setIsPostItModalOpen] = useState(false);
  const [selectedPostIt, setSelectedPostIt] = useState<PostIt | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // JARVIS 2.0 Modals
  const [isWhatToDoModalOpen, setIsWhatToDoModalOpen] = useState(false);
  const [isMakeMoneyModalOpen, setIsMakeMoneyModalOpen] = useState(false);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [isDesignerModalOpen, setIsDesignerModalOpen] = useState(false);
  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);
  const [isDayClosingOpen, setIsDayClosingOpen] = useState(false);
  const [isQuickChangaModalOpen, setIsQuickChangaModalOpen] = useState(false);

  // Assistant messages state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_msg',
      role: 'assistant',
      content: `👋 **JARVIS en línea. Sistema Operativo Personal & Financiero activado.**

Principios de operación:
1. **Primero Estabilidad** → Construcción y crecimiento con base firme.
2. **Potente por dentro, simple por fuera** → Gestión unificada de finanzas, tareas, proyectos y tablero de post-its.
3. **JARVIS propone, vos confirmás** → Control absoluto de tus decisiones.

¿Qué movimiento, nota en el tablero o tarea coordinamos hoy?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load all app data concurrently
  const loadData = useCallback(async (currentPeriod = period) => {
    setIsRefreshing(true);
    try {
      const [
        summaryRes,
        accountsRes,
        transactionsRes,
        categoriesRes,
        projectsRes,
        pendingRes,
        futureRes,
        reserveRes,
        goalsRes,
        memoryRes,
        postitsRes,
        tasksRes,
        calendarRes,
        habitsRes,
        crekoLeadsRes,
        crekoQuotesRes,
        crekoOppsRes,
        spainDocsRes,
        missionsRes,
        settingsRes,
        changasRes,
        crekoProdRes,
        crekoContentRes,
        customModulesRes,
        dayClosingsRes,
      ] = await Promise.all([
        api.getSummary(currentPeriod),
        api.getAccounts(),
        api.getTransactions(),
        api.getCategories(),
        api.getProjects(),
        api.getPendingIncomes(),
        api.getFutureExpenses(),
        api.getReserve(),
        api.getGoals(),
        api.getMemory(),
        api.getPostIts(),
        api.getTasks(),
        api.getUnifiedCalendar(),
        api.getHabits(),
        api.getCrekoLeads(),
        api.getCrekoQuotes(),
        api.getCrekoOpportunities(),
        api.getSpainDocs(),
        api.getMissions(),
        api.getJarvisSettings(),
        api.getChangas(),
        api.getCrekoProduction(),
        api.getCrekoContent(),
        api.getCustomModules(),
        api.getDayClosings(),
      ]);

      setSummary(summaryRes);
      setAccounts(accountsRes);
      setTransactions(transactionsRes);
      setCategories(categoriesRes);
      setProjects(projectsRes);
      setPendingIncomes(pendingRes);
      setFutureExpenses(futureRes);
      setReserve(reserveRes);
      setGoals(goalsRes);
      setMemory(memoryRes);
      setPostIts(postitsRes);
      setTasks(tasksRes);
      setCalendarItems(calendarRes);
      setHabits(habitsRes);
      setCrekoLeads(crekoLeadsRes);
      setCrekoQuotes(crekoQuotesRes);
      setCrekoOpportunities(crekoOppsRes);
      setSpainDocs(spainDocsRes);
      setMissions(missionsRes);
      setJarvisSettings(settingsRes);
      setChangas(changasRes);
      setCrekoProduction(crekoProdRes);
      setCrekoContent(crekoContentRes);
      setCustomModules(customModulesRes);
      setDayClosings(dayClosingsRes);
    } catch (err) {
      console.error('Error fetching data from JARVIS server:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    loadData(period);
  }, [loadData, period]);

  // Quick Chat trigger
  const handleQuickChat = async (promptText: string) => {
    setCurrentView('chat');
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await api.sendChatMessage(promptText);
      const assistantMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        proposal: response.proposal,
        actionDetails: response.actionDetails,
        learningProposal: response.learningProposal,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      loadData();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: 'Ocurrió un error al procesar la solicitud con JARVIS.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  // Post-It Actions
  const handleSavePostIt = async (data: any) => {
    if (selectedPostIt) {
      await api.updatePostIt(selectedPostIt.id, data);
    } else {
      await api.createPostIt(data);
    }
    loadData();
  };

  const handleDeletePostIt = async (id: string) => {
    await api.deletePostIt(id);
    loadData();
  };

  const handleTrashPostIt = async (id: string, reason: 'completed' | 'discarded' = 'completed') => {
    await api.trashPostIt(id, reason);
    loadData();
  };

  const handleRestorePostIt = async (id: string) => {
    await api.restorePostIt(id);
    loadData();
  };

  const handleEmptyPostItTrash = async () => {
    await api.emptyPostItTrash();
    loadData();
  };

  const handleTogglePostItChecklist = async (postItId: string, itemId: string) => {
    await api.togglePostItChecklist(postItId, itemId);
    loadData();
  };

  const handleConvertPostItToTask = async (id: string) => {
    await api.convertPostItToTask(id);
    loadData();
  };

  const handleQuickCreatePostIt = async (data: {
    title: string;
    colorPriority: PostItColorPriority;
    moneyAmount?: number;
    projectId?: string;
  }) => {
    await api.createPostIt({
      ...data,
      status: 'active',
      date: new Date().toISOString().split('T')[0],
    });
    loadData();
  };

  const handleUpdatePostItInline = async (id: string, updates: Partial<PostIt>) => {
    await api.updatePostIt(id, updates);
    loadData();
  };

  // Task Actions
  const handleSaveTask = async (data: any) => {
    if (selectedTask) {
      await api.updateTask(selectedTask.id, data);
    } else {
      await api.createTask(data);
    }
    loadData();
  };

  const handleDeleteTask = async (id: string) => {
    await api.deleteTask(id);
    loadData();
  };

  const handleToggleTaskStatus = async (id: string) => {
    await api.toggleTaskStatus(id);
    loadData();
  };

  const handleQuickCreateTask = async (data: {
    title: string;
    priority: any;
    dueDate?: string;
    projectId?: string;
  }) => {
    await api.createTask({
      ...data,
      status: 'todo',
    });
    loadData();
  };

  // Habit Actions
  const handleToggleHabit = async (id: string) => {
    await api.toggleHabit(id);
    loadData();
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        summary={summary}
        onRefresh={() => loadData()}
        onOpenNewTransaction={() => setIsTxModalOpen(true)}
        onOpenNewPostIt={() => {
          setSelectedPostIt(null);
          setIsPostItModalOpen(true);
        }}
        onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
        onOpenDayClosing={() => setIsDayClosingOpen(true)}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentView === 'dashboard' && (
          <DashboardView
            summary={summary}
            projects={projects}
            goals={goals}
            postits={postits}
            tasks={tasks}
            habits={habits}
            crekoLeads={crekoLeads}
            crekoQuotes={crekoQuotes}
            spainDocs={spainDocs}
            missions={missions}
            changas={changas}
            activeModules={jarvisSettings?.activeModules}
            period={period}
            setPeriod={(newP) => {
              setPeriod(newP);
              loadData(newP);
            }}
            onNavigate={setCurrentView}
            onQuickChat={handleQuickChat}
            onOpenReceivePending={() => setCurrentView('transactions')}
            onToggleTaskStatus={handleToggleTaskStatus}
            onToggleHabit={handleToggleHabit}
            onOpenWhatToDo={() => setIsWhatToDoModalOpen(true)}
            onOpenMakeMoney={() => setIsMakeMoneyModalOpen(true)}
            onOpenCheckin={() => setIsCheckinModalOpen(true)}
            onOpenDesigner={() => setIsDesignerModalOpen(true)}
            onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
            onOpenDayClosing={() => setIsDayClosingOpen(true)}
            onOpenQuickChanga={() => setIsQuickChangaModalOpen(true)}
            onRefreshData={() => loadData()}
          />
        )}

        {currentView === 'creko' && (
          <CrekoOSView
            leads={crekoLeads}
            quotes={crekoQuotes}
            opportunities={crekoOpportunities}
            productionOrders={crekoProduction}
            contentItems={crekoContent}
            onRefresh={() => loadData()}
            onOpenNewTransaction={() => setIsTxModalOpen(true)}
          />
        )}

        {currentView === 'changas' && (
          <ChangasView
            changas={changas}
            accounts={accounts}
            onRefreshData={() => loadData()}
          />
        )}

        {currentView === 'custom_modules' && (
          <CustomModulesView
            customModules={customModules}
            onRefreshData={() => loadData()}
          />
        )}

        {currentView === 'spain_process' && (
          <SpainProcessView docs={spainDocs} onRefresh={() => loadData()} />
        )}

        {currentView === 'postits' && (
          <JarvisBoardView
            postits={postits}
            projects={projects}
            onOpenNewPostIt={() => {
              setSelectedPostIt(null);
              setIsPostItModalOpen(true);
            }}
            onEditPostIt={(p) => {
              setSelectedPostIt(p);
              setIsPostItModalOpen(true);
            }}
            onDeletePostIt={handleDeletePostIt}
            onToggleChecklist={handleTogglePostItChecklist}
            onConvertToTask={handleConvertPostItToTask}
            onOpenNewTransactionWithPostIt={(p) => {
              setIsTxModalOpen(true);
            }}
            onRefreshData={() => loadData()}
            onQuickCreatePostIt={handleQuickCreatePostIt}
            onUpdatePostItInline={handleUpdatePostItInline}
            onTrashPostIt={handleTrashPostIt}
            onRestorePostIt={handleRestorePostIt}
            onEmptyTrash={handleEmptyPostItTrash}
          />
        )}

        {currentView === 'tasks' && (
          <TasksView
            tasks={tasks}
            projects={projects}
            onOpenNewTask={() => {
              setSelectedTask(null);
              setIsTaskModalOpen(true);
            }}
            onEditTask={(t) => {
              setSelectedTask(t);
              setIsTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onToggleTaskStatus={handleToggleTaskStatus}
            onQuickCreateTask={handleQuickCreateTask}
            onOpenNewTransaction={() => setIsTxModalOpen(true)}
          />
        )}

        {currentView === 'calendar' && (
          <CalendarView
            items={calendarItems}
            onOpenNewTask={() => {
              setSelectedTask(null);
              setIsTaskModalOpen(true);
            }}
            onOpenNewPostIt={() => {
              setSelectedPostIt(null);
              setIsPostItModalOpen(true);
            }}
            onOpenNewTransaction={() => setIsTxModalOpen(true)}
          />
        )}

        {currentView === 'chat' && (
          <ChatView
            messages={messages}
            setMessages={setMessages}
            accounts={accounts}
            categories={categories}
            projects={projects}
            onRefreshData={() => loadData()}
          />
        )}

        {currentView === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            accounts={accounts}
            categories={categories}
            projects={projects}
            pendingIncomes={pendingIncomes}
            futureExpenses={futureExpenses}
            onRefreshData={() => loadData()}
            onOpenNewTransaction={() => setIsTxModalOpen(true)}
            onOpenNewPendingIncome={() => setIsPendingModalOpen(true)}
            onOpenNewFutureExpense={() => setIsFutureModalOpen(true)}
          />
        )}

        {currentView === 'accounts' && (
          <AccountsView
            accounts={accounts}
            onRefreshData={() => loadData()}
            onOpenTransfer={() => setIsTransferModalOpen(true)}
          />
        )}

        {currentView === 'projects' && (
          <ProjectsView
            projects={projects}
            transactions={transactions}
            onRefreshData={() => loadData()}
            onOpenNewTransaction={() => setIsTxModalOpen(true)}
          />
        )}

        {currentView === 'goals' && (
          <GoalsReserveView
            reserve={reserve}
            goals={goals}
            accounts={accounts}
            onRefreshData={() => loadData()}
          />
        )}

        {currentView === 'settings' && (
          <MemorySettingsView
            memory={memory}
            categories={categories}
            accounts={accounts}
            projects={projects}
            onRefreshData={() => loadData()}
          />
        )}

        {currentView === 'health' && (
          <HealthView onOpenCheckin={() => setIsCheckinModalOpen(true)} />
        )}
      </main>

      {/* Mobile-first bottom navigation bar */}
      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        accounts={accounts}
        categories={categories}
        projects={projects}
        onSuccess={() => loadData()}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        accounts={accounts}
        onSuccess={() => loadData()}
      />

      <PendingIncomeModal
        isOpen={isPendingModalOpen}
        onClose={() => setIsPendingModalOpen(false)}
        projects={projects}
        onSuccess={() => loadData()}
      />

      <FutureExpenseModal
        isOpen={isFutureModalOpen}
        onClose={() => setIsFutureModalOpen(false)}
        categories={categories}
        projects={projects}
        onSuccess={() => loadData()}
      />

      <PostItModal
        isOpen={isPostItModalOpen}
        onClose={() => setIsPostItModalOpen(false)}
        postIt={selectedPostIt}
        projects={projects}
        onSave={handleSavePostIt}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        projects={projects}
        onSave={handleSaveTask}
      />

      {/* JARVIS 2.0 Strategic Modals */}
      <WhatToDoModal
        isOpen={isWhatToDoModalOpen}
        onClose={() => setIsWhatToDoModalOpen(false)}
        onSelectAction={(action) => {
          setIsWhatToDoModalOpen(false);
          handleQuickChat(`JARVIS, organicemos la siguiente acción prioritaria del día: ${action}`);
        }}
      />

      <MakeMoneyModal
        isOpen={isMakeMoneyModalOpen}
        onClose={() => setIsMakeMoneyModalOpen(false)}
        onSelectOpportunity={(opp) => {
          setIsMakeMoneyModalOpen(false);
          handleQuickChat(`JARVIS, activemos esta vía para generar ingresos hoy: ${opp}`);
        }}
      />

      <DailyCheckinModal
        isOpen={isCheckinModalOpen}
        onClose={() => setIsCheckinModalOpen(false)}
        habits={habits}
        onSuccess={() => loadData()}
      />

      {jarvisSettings && (
        <DesignerSettingsModal
          isOpen={isDesignerModalOpen}
          onClose={() => setIsDesignerModalOpen(false)}
          settings={jarvisSettings}
          onSettingsUpdated={async () => {
            loadData();
          }}
        />
      )}

      {/* JARVIS 2.0 Ticket OCR & Day Closing Modals */}
      <ReceiptScannerModal
        isOpen={isReceiptScannerOpen}
        onClose={() => setIsReceiptScannerOpen(false)}
        accounts={accounts}
        categories={categories}
        onSuccess={() => loadData()}
      />

      <DayClosingModal
        isOpen={isDayClosingOpen}
        onClose={() => setIsDayClosingOpen(false)}
        tasks={tasks}
        onSuccess={() => loadData()}
      />

      <QuickChangaModal
        isOpen={isQuickChangaModalOpen}
        onClose={() => setIsQuickChangaModalOpen(false)}
        accounts={accounts}
        onSuccess={() => loadData()}
      />
    </div>
  );
}
