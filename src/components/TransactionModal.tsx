import React, { useState } from 'react';
import {
  X,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  AlertCircle,
} from 'lucide-react';
import { Account, Category, Project } from '../types';
import { api } from '../services/api';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  projects: Project[];
  onSuccess: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  accounts,
  categories,
  projects,
  onSuccess,
}) => {
  const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethodId, setPaymentMethodId] = useState<string>(accounts[0]?.id || '');
  const [toPaymentMethodId, setToPaymentMethodId] = useState<string>(accounts[1]?.id || '');
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || '');
  const [subcategoryId, setSubcategoryId] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const currentCategory = categories.find((c) => c.id === categoryId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    if (type === 'transfer' && paymentMethodId === toPaymentMethodId) {
      alert('La cuenta de origen y destino deben ser distintas');
      return;
    }

    setLoading(true);
    try {
      await api.createTransaction({
        type,
        amount: Number(amount),
        currency: 'EUR',
        paymentMethodId,
        toPaymentMethodId: type === 'transfer' ? toPaymentMethodId : undefined,
        categoryId: type !== 'transfer' ? categoryId : undefined,
        subcategoryId: type !== 'transfer' && subcategoryId ? subcategoryId : undefined,
        projectId: projectId || undefined,
        description:
          description.trim() ||
          (type === 'transfer'
            ? 'Transferencia interna'
            : currentCategory?.name || 'Movimiento'),
        notes: notes.trim() || undefined,
        date,
        status: 'confirmed',
        source: 'manual',
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error al guardar el movimiento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white">Registrar Nuevo Movimiento</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type Selector */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              type === 'expense'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" /> Gasto
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              type === 'income'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" /> Ingreso
          </button>
          <button
            type="button"
            onClick={() => setType('transfer')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              type === 'transfer'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" /> Transferencia
          </button>
        </div>

        {type === 'transfer' && (
          <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl flex items-start gap-2 text-xs text-blue-300">
            <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <p>
              <strong className="text-white">Transferencia propia:</strong> Mueve fondos entre tus cuentas. NO se computa como ingreso ni como gasto.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Importe (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="0.00"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-base font-bold text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Account Selection */}
          {type !== 'transfer' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cuenta / Medio de pago
              </label>
              <select
                value={paymentMethodId}
                onChange={(e) => setPaymentMethodId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.balance} {a.currency})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Desde (Origen)
                </label>
                <select
                  value={paymentMethodId}
                  onChange={(e) => setPaymentMethodId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.balance} €)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hacia (Destino)
                </label>
                <select
                  value={toPaymentMethodId}
                  onChange={(e) => setToPaymentMethodId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.balance} €)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Concepto / Descripción
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Comida, Nafta, Materiales Rotuprint..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Category & Subcategory (for Income and Expense) */}
          {type !== 'transfer' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría</label>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setSubcategoryId('');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subcategoría
                </label>
                <select
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">General</option>
                  {currentCategory?.subcategories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Project (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Imputar a Proyecto (Opcional)
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Ninguno (Finanzas Personales)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
