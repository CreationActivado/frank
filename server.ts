import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { extractReceiptFromImage, generateCustomAiModule, processAssistantMessage, generateDailyVoiceBriefing } from './server/ai';
import { db } from './server/db';

const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '25mb' }));

  // --- API Routes ---

  // Server health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // --- JARVIS Health & Life (Apple HealthKit) ---
  app.get('/api/health/status', (_req, res) => {
    res.json(db.getHealthStatus());
  });

  app.get('/api/health/today', (req, res) => {
    const date = req.query.date as string | undefined;
    const summary = db.getTodayHealth(date);
    res.json({
      summary,
      status: db.getHealthStatus(),
    });
  });

  app.get('/api/health/history', (req, res) => {
    const days = parseInt(req.query.days as string) || 7;
    res.json(db.getHealthHistory(days));
  });

  app.post('/api/healthkit/sync', (req, res) => {
    try {
      const { userId, date, steps, walkingRunningDistanceKm, activeEnergyKcal, workouts, source, syncedAt } = req.body;
      const result = db.syncHealthKitData({
        userId,
        date,
        steps: steps !== undefined ? Number(steps) : undefined,
        walkingRunningDistanceKm: walkingRunningDistanceKm !== undefined ? Number(walkingRunningDistanceKm) : undefined,
        activeEnergyKcal: activeEnergyKcal !== undefined ? Number(activeEnergyKcal) : undefined,
        workouts,
        source: source || 'apple_health',
        syncedAt,
      });
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Error sincronizando HealthKit' });
    }
  });

  app.post('/api/health/target', (req, res) => {
    try {
      const { dailyStepTarget, weeklyWorkoutTarget } = req.body;
      const updated = db.updateHealthStatus({
        dailyStepTarget: dailyStepTarget ? Number(dailyStepTarget) : 8000,
        weeklyWorkoutTarget: weeklyWorkoutTarget ? Number(weeklyWorkoutTarget) : 4,
      });
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/health/disconnect', (_req, res) => {
    res.json(db.disconnectHealth());
  });

  // Financial Summary / Dashboard
  app.get('/api/summary', (req, res) => {
    const period = (req.query.period as 'today' | 'week' | 'month') || 'month';
    const summary = db.getFinancialSummary(period);
    res.json(summary);
  });

  // Accounts / Payment Methods
  app.get('/api/accounts', (_req, res) => {
    res.json(db.getAccounts());
  });

  app.post('/api/accounts', (req, res) => {
    try {
      const account = db.createAccount(req.body);
      res.status(201).json(account);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/accounts/:id', (req, res) => {
    const updated = db.updateAccount(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Cuenta no encontrada' });
    res.json(updated);
  });

  // Transactions
  app.get('/api/transactions', (req, res) => {
    let txs = db.getTransactions();
    const { type, accountId, projectId, categoryId, search, period } = req.query;

    if (type) txs = txs.filter((t) => t.type === type);
    if (accountId) txs = txs.filter((t) => t.paymentMethodId === accountId || t.toPaymentMethodId === accountId);
    if (projectId) txs = txs.filter((t) => t.projectId === projectId);
    if (categoryId) txs = txs.filter((t) => t.categoryId === categoryId);
    if (search) {
      const q = (search as string).toLowerCase();
      txs = txs.filter((t) => t.description.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q)));
    }
    if (period) {
      const now = new Date();
      const start = new Date();
      if (period === 'today') start.setHours(0, 0, 0, 0);
      else if (period === 'week') {
        const day = now.getDay() || 7;
        start.setDate(now.getDate() - day + 1);
        start.setHours(0, 0, 0, 0);
      } else if (period === 'month') {
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
      }
      txs = txs.filter((t) => new Date(t.date) >= start);
    }

    res.json(txs);
  });

  app.post('/api/transactions', (req, res) => {
    try {
      const { transaction, undoAction } = db.createTransaction(req.body);
      res.status(201).json({ transaction, undoAction });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/transactions/:id', (req, res) => {
    const result = db.updateTransaction(req.params.id, req.body);
    if (!result) return res.status(404).json({ error: 'Transacción no encontrada' });
    res.json(result);
  });

  app.delete('/api/transactions/:id', (req, res) => {
    const ok = db.deleteTransaction(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Transacción no encontrada' });
    res.json({ success: true });
  });

  // Undo last action
  app.post('/api/undo', (_req, res) => {
    const result = db.undoLastAction();
    res.json(result);
  });

  // Categories
  app.get('/api/categories', (_req, res) => {
    res.json(db.getCategories());
  });

  app.post('/api/categories', (req, res) => {
    const { name, subcategories } = req.body;
    if (!name) return res.status(400).json({ error: 'Nombre requerido' });
    const cat = db.createCategory(name, subcategories || []);
    res.status(201).json(cat);
  });

  app.post('/api/categories/:id/subcategories', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Nombre requerido' });
    const ok = db.addSubcategory(req.params.id, name);
    if (!ok) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json({ success: true });
  });

  // Projects
  app.get('/api/projects', (_req, res) => {
    res.json(db.getProjects());
  });

  app.post('/api/projects', (req, res) => {
    try {
      const proj = db.createProject(req.body);
      res.status(201).json(proj);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/projects/:id', (req, res) => {
    const updated = db.updateProject(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json(updated);
  });

  // Pending Incomes
  app.get('/api/pending-incomes', (_req, res) => {
    res.json(db.getPendingIncomes());
  });

  app.post('/api/pending-incomes', (req, res) => {
    try {
      const item = db.createPendingIncome(req.body);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/pending-incomes/:id/receive', (req, res) => {
    const { paymentMethodId } = req.body;
    const result = db.markIncomeReceived(req.params.id, paymentMethodId);
    if (!result) return res.status(404).json({ error: 'Cobro pendiente no encontrado' });
    res.json(result);
  });

  app.delete('/api/pending-incomes/:id', (req, res) => {
    const ok = db.deletePendingIncome(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Cobro pendiente no encontrado' });
    res.json({ success: true });
  });

  // Future Expenses
  app.get('/api/future-expenses', (_req, res) => {
    res.json(db.getFutureExpenses());
  });

  app.post('/api/future-expenses', (req, res) => {
    try {
      const item = db.createFutureExpense(req.body);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/future-expenses/:id/pay', (req, res) => {
    const { paymentMethodId } = req.body;
    const ok = db.markFutureExpensePaid(req.params.id, paymentMethodId);
    if (!ok) return res.status(404).json({ error: 'Gasto futuro no encontrado' });
    res.json({ success: true });
  });

  app.delete('/api/future-expenses/:id', (req, res) => {
    const ok = db.deleteFutureExpense(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Gasto futuro no encontrado' });
    res.json({ success: true });
  });

  // Reserve & Goals
  app.get('/api/reserve', (_req, res) => {
    res.json(db.getReserve());
  });

  app.put('/api/reserve', (req, res) => {
    const updated = db.updateReserve(req.body);
    res.json(updated);
  });

  app.get('/api/goals', (_req, res) => {
    res.json(db.getGoals());
  });

  app.post('/api/goals', (req, res) => {
    try {
      const goal = db.createGoal(req.body);
      res.status(201).json(goal);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/goals/:id', (req, res) => {
    const updated = db.updateGoal(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Meta no encontrada' });
    res.json(updated);
  });

  // User Memory ("Mi Cerebro")
  app.get('/api/memory', (_req, res) => {
    res.json(db.getMemory());
  });

  app.post('/api/memory', (req, res) => {
    try {
      const mem = db.createMemory(req.body);
      res.status(201).json(mem);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/memory/:id', (req, res) => {
    const updated = db.updateMemory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Regla de memoria no encontrada' });
    res.json(updated);
  });

  app.delete('/api/memory/:id', (req, res) => {
    const ok = db.deleteMemory(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Regla de memoria no encontrada' });
    res.json({ success: true });
  });

  // User Profile & Personal Context
  app.get('/api/profile', (_req, res) => {
    res.json(db.getUserProfile());
  });

  app.put('/api/profile', (req, res) => {
    try {
      const updated = db.updateUserProfile(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Post-It Intelligence System
  app.get('/api/postits', (_req, res) => {
    res.json(db.getPostIts());
  });

  app.post('/api/postits', (req, res) => {
    try {
      const postIt = db.createPostIt(req.body);
      res.status(201).json(postIt);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/postits/:id', (req, res) => {
    const updated = db.updatePostIt(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Post-it no encontrado' });
    res.json(updated);
  });

  app.delete('/api/postits/:id', (req, res) => {
    const ok = db.deletePostIt(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Post-it no encontrado' });
    res.json({ success: true });
  });

  app.post('/api/postits/:id/trash', (req, res) => {
    const { reason } = req.body || {};
    const trashed = db.trashPostIt(req.params.id, reason || 'completed');
    if (!trashed) return res.status(404).json({ error: 'Post-it no encontrado' });
    res.json(trashed);
  });

  app.post('/api/postits/:id/restore', (req, res) => {
    const restored = db.restorePostIt(req.params.id);
    if (!restored) return res.status(404).json({ error: 'Post-it no encontrado' });
    res.json(restored);
  });

  app.post('/api/postits/empty-trash', (_req, res) => {
    const result = db.emptyPostItTrash();
    res.json(result);
  });

  app.post('/api/postits/:id/toggle-checklist', (req, res) => {
    const { itemId } = req.body;
    const updated = db.togglePostItChecklist(req.params.id, itemId);
    if (!updated) return res.status(404).json({ error: 'Post-it o ítem no encontrado' });
    res.json(updated);
  });

  app.post('/api/postits/:id/convert-to-task', (req, res) => {
    const result = db.convertPostItToTask(req.params.id);
    if (!result) return res.status(404).json({ error: 'No se pudo convertir el post-it' });
    res.json(result);
  });

  app.get('/api/postits/cleanup-analysis', (_req, res) => {
    res.json(db.getPostItCleanupAnalysis());
  });

  // Task Engine
  app.get('/api/tasks', (_req, res) => {
    res.json(db.getTasks());
  });

  app.post('/api/tasks', (req, res) => {
    try {
      const task = db.createTask(req.body);
      res.status(201).json(task);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/tasks/:id', (req, res) => {
    const updated = db.updateTask(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(updated);
  });

  app.delete('/api/tasks/:id', (req, res) => {
    const ok = db.deleteTask(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json({ success: true });
  });

  app.post('/api/tasks/:id/toggle', (req, res) => {
    const updated = db.toggleTaskStatus(req.params.id);
    if (!updated) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(updated);
  });

  // Calendar Unified Agenda
  app.get('/api/calendar/unified', (_req, res) => {
    res.json(db.getUnifiedCalendar());
  });

  // --- JARVIS 2.0 API ROUTES ---

  // Habits
  app.get('/api/habits', (_req, res) => {
    res.json(db.getHabits());
  });

  app.post('/api/habits', (req, res) => {
    try {
      const habit = db.createHabit(req.body);
      res.status(201).json(habit);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/habits/:id/toggle', (req, res) => {
    const habit = db.toggleHabit(req.params.id);
    if (!habit) return res.status(404).json({ error: 'Hábito no encontrado' });
    res.json(habit);
  });

  app.delete('/api/habits/:id', (req, res) => {
    const ok = db.deleteHabit(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Hábito no encontrado' });
    res.json({ success: true });
  });

  // Daily Checkin / Mood
  app.get('/api/checkins', (_req, res) => {
    res.json(db.getCheckins());
  });

  app.get('/api/checkins/latest', (_req, res) => {
    res.json(db.getLatestCheckin());
  });

  app.post('/api/checkins', (req, res) => {
    try {
      const checkin = db.saveCheckin(req.body);
      res.status(201).json(checkin);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Creko Leads (CRM Pipeline)
  app.get('/api/creko/leads', (_req, res) => {
    res.json(db.getCrekoLeads());
  });

  app.post('/api/creko/leads', (req, res) => {
    try {
      const lead = db.createCrekoLead(req.body);
      res.status(201).json(lead);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/creko/leads/:id', (req, res) => {
    const updated = db.updateCrekoLead(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Lead de Creko no encontrado' });
    res.json(updated);
  });

  app.delete('/api/creko/leads/:id', (req, res) => {
    const ok = db.deleteCrekoLead(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Lead no encontrado' });
    res.json({ success: true });
  });

  // Creko Quotes (Presupuestos)
  app.get('/api/creko/quotes', (_req, res) => {
    res.json(db.getCrekoQuotes());
  });

  app.post('/api/creko/quotes', (req, res) => {
    try {
      const quote = db.createCrekoQuote(req.body);
      res.status(201).json(quote);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/creko/quotes/:id', (req, res) => {
    const updated = db.updateCrekoQuote(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Presupuesto no encontrado' });
    res.json(updated);
  });

  app.delete('/api/creko/quotes/:id', (req, res) => {
    const ok = db.deleteCrekoQuote(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Presupuesto no encontrado' });
    res.json({ success: true });
  });

  // Creko Opportunities (Google Maps)
  app.get('/api/creko/opportunities', (_req, res) => {
    res.json(db.getCrekoOpportunities());
  });

  app.post('/api/creko/opportunities', (req, res) => {
    try {
      const opp = db.createCrekoOpportunity(req.body);
      res.status(201).json(opp);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/creko/opportunities/:id/convert', (req, res) => {
    const target = req.body.target === 'task' ? 'task' : 'lead';
    const result = db.convertOpportunityToLeadOrTask(req.params.id, target);
    if (!result) return res.status(404).json({ error: 'Oportunidad no encontrada' });
    res.json(result);
  });

  // Spain Process Docs (Rotuprint / Regularización)
  app.get('/api/spain-docs', (_req, res) => {
    res.json(db.getSpainDocs());
  });

  app.post('/api/spain-docs', (req, res) => {
    try {
      const doc = db.createSpainDoc(req.body);
      res.status(201).json(doc);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/spain-docs/:id', (req, res) => {
    const updated = db.updateSpainDoc(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Documento no encontrado' });
    res.json(updated);
  });

  app.delete('/api/spain-docs/:id', (req, res) => {
    const ok = db.deleteSpainDoc(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Documento no encontrado' });
    res.json({ success: true });
  });

  // Missions
  app.get('/api/missions', (_req, res) => {
    res.json(db.getMissions());
  });

  app.post('/api/missions', (req, res) => {
    try {
      const mission = db.createMission(req.body);
      res.status(201).json(mission);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/missions/:id', (req, res) => {
    const updated = db.updateMission(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Misión no encontrada' });
    res.json(updated);
  });

  // Jarvis Settings
  app.get('/api/settings/jarvis', (_req, res) => {
    res.json(db.getJarvisSettings());
  });

  app.put('/api/settings/jarvis', (req, res) => {
    const updated = db.updateJarvisSettings(req.body);
    res.json(updated);
  });

  // Strategy Decisions: "¿Qué hago hoy?" & "Generar Dinero"
  app.get('/api/strategy/daily-plan', (_req, res) => {
    res.json(db.getDailyPlan());
  });

  app.get('/api/voice/briefing', async (_req, res) => {
    try {
      const briefing = await generateDailyVoiceBriefing();
      res.json(briefing);
    } catch (err: any) {
      console.error('Voice briefing error:', err);
      res.status(500).json({ error: 'Error generando briefing por voz' });
    }
  });

  // --- WELCOME REPORT (OUTFIT + SPOTIFY + PENDIENTES) ---
  app.get('/api/welcome-report', (_req, res) => {
    try {
      const report = db.getAppWelcomeReport();
      res.json(report);
    } catch (err: any) {
      console.error('Welcome report error:', err);
      res.status(500).json({ error: 'Error generando reporte de bienvenida' });
    }
  });

  // Weather & Outfit
  app.get('/api/weather-outfit', (req, res) => {
    const city = req.query.city as string | undefined;
    res.json(db.getWeatherOutfit(city));
  });

  // Spotify Control & State
  app.get('/api/spotify/state', (_req, res) => {
    res.json(db.getSpotifyState());
  });

  app.post('/api/spotify/state', (req, res) => {
    const updated = db.updateSpotifyState(req.body);
    res.json(updated);
  });

  app.post('/api/spotify/toggle-play', (_req, res) => {
    const updated = db.toggleSpotifyPlayback();
    res.json(updated);
  });

  // Spotify OAuth Authorization URL (Popup-based according to OAuth Skill)
  app.get('/api/auth/spotify/url', (_req, res) => {
    const clientId = process.env.SPOTIFY_CLIENT_ID || '';
    const appUrl = process.env.APP_URL || 'https://ais-dev-tyx5iyvmum5gjb2pz2yysf-821150334766.europe-west2.run.app';
    const redirectUri = `${appUrl}/auth/callback`;

    if (!clientId) {
      // In development or if not configured, return simulated connect URL or instructions
      return res.json({
        configured: false,
        url: null,
        redirectUri,
        message: 'SPOTIFY_CLIENT_ID no está configurado en las variables de entorno.',
      });
    }

    const scopes = [
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'playlist-read-private',
      'user-library-read',
    ].join(' ');

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: scopes,
      show_dialog: 'true',
    });

    res.json({
      configured: true,
      url: `https://accounts.spotify.com/authorize?${params.toString()}`,
      redirectUri,
    });
  });

  // OAuth Callback Route (handles /auth/callback and /auth/callback/ as per OAuth Skill)
  app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
    const code = req.query.code;
    const error = req.query.error;

    if (error) {
      return res.send(`
        <html>
          <body style="font-family:sans-serif; background:#0f172a; color:#fff; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
            <div style="text-align:center; padding:20px;">
              <h2>Conexión cancelada</h2>
              <p style="color:#94a3b8;">${error}</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: '${error}' }, '*');
                  setTimeout(() => window.close(), 1500);
                }
              </script>
            </div>
          </body>
        </html>
      `);
    }

    // Set Spotify connected in DB
    db.updateSpotifyState({
      isConnected: true,
      isPlaying: true,
      playlistName: 'Enfoque & Flow Operativo',
      profileName: 'Fran Albornoz',
    });

    res.send(`
      <html>
        <head><title>Conexión Exitosa con Spotify</title></head>
        <body style="font-family:sans-serif; background:#0f172a; color:#fff; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
          <div style="text-align:center; padding:24px; background:#1e293b; border-radius:16px; border:1px solid #334155; max-width:400px;">
            <div style="font-size:36px; margin-bottom:12px;">🎵</div>
            <h2 style="color:#10b981; margin:0 0 8px 0;">¡Spotify Conectado!</h2>
            <p style="color:#cbd5e1; font-size:14px; margin:0 0 16px 0;">JARVIS ahora tiene control de tu música y listas de enfoque.</p>
            <p style="color:#64748b; font-size:12px;">Cerrando ventana automáticamente...</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'spotify' }, '*');
                setTimeout(() => { window.close(); }, 1200);
              } else {
                setTimeout(() => { window.location.href = '/'; }, 1500);
              }
            </script>
          </div>
        </body>
      </html>
    `);
  });

  app.get('/api/strategy/make-money', (req, res) => {
    const duration = (req.query.duration as '30m' | '1h' | '2h' | '4h' | 'allday') || '1h';
    res.json(db.getMoneyGenerationActions(duration));
  });

  // Chat & Assistant
  app.post('/api/chat', async (req, res) => {
    const { message, image } = req.body;
    if ((!message || typeof message !== 'string') && !image) {
      return res.status(400).json({ error: 'Mensaje o imagen requerida' });
    }

    try {
      const response = await processAssistantMessage(message || '', image);
      res.json(response);
    } catch (err: any) {
      console.error('Chat error:', err);
      res.status(500).json({ error: 'Error procesando mensaje' });
    }
  });

  // Receipt OCR / Gasto Detectado
  app.post('/api/ocr-receipt', async (req, res) => {
    const { image, mimeType } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Imagen requerida en base64' });
    }
    try {
      const detected = await extractReceiptFromImage(image, mimeType);
      res.json(detected);
    } catch (err: any) {
      console.error('Receipt OCR error:', err);
      res.status(500).json({ error: 'Error al procesar el ticket' });
    }
  });

  // Changas (Trabajos ocasionales)
  app.get('/api/changas', (_req, res) => {
    res.json(db.getChangas());
  });

  app.post('/api/changas', (req, res) => {
    try {
      const changa = db.createChanga(req.body);
      res.status(201).json(changa);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/changas/:id/toggle-paid', (req, res) => {
    const { paymentMethodId } = req.body;
    const updated = db.toggleChangaPaid(req.params.id, paymentMethodId);
    if (!updated) return res.status(404).json({ error: 'Changa no encontrada' });
    res.json(updated);
  });

  app.delete('/api/changas/:id', (req, res) => {
    const success = db.deleteChanga(req.params.id);
    if (!success) return res.status(404).json({ error: 'Changa no encontrada' });
    res.json({ success: true });
  });

  // Creko Pilar 2: Producción
  app.get('/api/creko/production', (_req, res) => {
    res.json(db.getCrekoProduction());
  });

  app.post('/api/creko/production', (req, res) => {
    try {
      const order = db.createCrekoProduction(req.body);
      res.status(201).json(order);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/creko/production/:id', (req, res) => {
    const updated = db.updateCrekoProduction(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json(updated);
  });

  app.delete('/api/creko/production/:id', (req, res) => {
    const success = db.deleteCrekoProduction(req.params.id);
    if (!success) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json({ success: true });
  });

  // Creko Pilar 3: Contenido
  app.get('/api/creko/content', (_req, res) => {
    res.json(db.getCrekoContent());
  });

  app.post('/api/creko/content', (req, res) => {
    try {
      const item = db.createCrekoContent(req.body);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/creko/content/:id', (req, res) => {
    const updated = db.updateCrekoContent(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Item de contenido no encontrado' });
    res.json(updated);
  });

  app.delete('/api/creko/content/:id', (req, res) => {
    const success = db.deleteCrekoContent(req.params.id);
    if (!success) return res.status(404).json({ error: 'Item de contenido no encontrado' });
    res.json({ success: true });
  });

  // Módulos personalizados con IA
  app.get('/api/custom-modules', (_req, res) => {
    res.json(db.getCustomModules());
  });

  app.post('/api/custom-modules', (req, res) => {
    try {
      const mod = db.createCustomModule(req.body);
      res.status(201).json(mod);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/custom-modules/:id/items', (req, res) => {
    const updated = db.addCustomModuleItem(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Módulo no encontrado' });
    res.json(updated);
  });

  app.delete('/api/custom-modules/:id', (req, res) => {
    const success = db.deleteCustomModule(req.params.id);
    if (!success) return res.status(404).json({ error: 'Módulo no encontrado' });
    res.json({ success: true });
  });

  app.post('/api/custom-modules/generate-with-ai', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt requerido' });
    try {
      const generated = await generateCustomAiModule(prompt);
      const saved = db.createCustomModule(generated);
      res.status(201).json(saved);
    } catch (err: any) {
      console.error('AI module generation error:', err);
      res.status(500).json({ error: 'Error generando módulo con IA' });
    }
  });

  // Cierre del Día & Resumen Semanal
  app.get('/api/day-closings', (_req, res) => {
    res.json(db.getDayClosings());
  });

  app.post('/api/day-closings', (req, res) => {
    try {
      const closing = db.createDayClosing(req.body);
      res.status(201).json(closing);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/dispersal-analysis', (_req, res) => {
    res.json(db.getDispersalAnalysis());
  });

  app.get('/api/week-summary', (_req, res) => {
    res.json(db.getWeekSummary());
  });

  // Export / Backup
  app.get('/api/export/json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="finanzas_backup.json"');
    res.send(db.exportJSON());
  });

  app.get('/api/export/csv', (_req, res) => {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="movimientos.csv"');
    res.send(db.exportTransactionsCSV());
  });

  app.post('/api/reset', (_req, res) => {
    db.resetToInitial();
    res.json({ success: true, message: 'Datos restablecidos al estado inicial' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Financial Control Center Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
