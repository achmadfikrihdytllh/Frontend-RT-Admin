import React, { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import api from '../api';
import SectionCard from '../components/SectionCard';

const CATEGORIES = [
  { value: 'operasional', label: 'Operasional' },
  { value: 'perbaikan', label: 'Perbaikan' },
  { value: 'darurat', label: 'Darurat' },
  { value: 'lainnya', label: 'Lainnya' },
];

const CATEGORY_STYLE = {
  operasional: 'bg-sky-50 text-sky-700',
  perbaikan: 'bg-amber-50 text-amber-700',
  darurat: 'bg-rose-50 text-rose-700',
  lainnya: 'bg-slate-100 text-slate-600',
};

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    category: 'operasional',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
  });

  const formatRupiah = (number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);

  const totalPengeluaran = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data?.data ?? []);
    } catch (err) {
      setError('Gagal memuat data pengeluaran.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/expenses', {
        ...formData,
        amount: Number(formData.amount),
      });
      setSuccess('Pengeluaran berhasil ditambahkan!');
      setFormData({
        category: 'operasional',
        description: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
      });
      await fetchExpenses();
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors).flat().join(', ') : 'Gagal menyimpan pengeluaran.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus data pengeluaran ini?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      setSuccess('Data berhasil dihapus.');
      await fetchExpenses();
    } catch {
      setError('Gagal menghapus data.');
    }
  };

  return (
    <div className="space-y-6">

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Pengeluaran</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">{formatRupiah(totalPengeluaran)}</p>
        </div>
        {CATEGORIES.map(({ value, label }) => (
          <div key={value} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {formatRupiah(expenses.filter(e => e.category === value).reduce((s, e) => s + Number(e.amount), 0))}
            </p>
          </div>
        ))}
      </div>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr] items-start">

        {/* Tabel Pengeluaran */}
        <SectionCard title="Riwayat Pengeluaran" subtitle="Semua catatan pengeluaran RT">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400">Memuat data...</div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Tanggal</th>
                    <th className="px-4 py-3 font-medium">Kategori</th>
                    <th className="px-4 py-3 font-medium">Keterangan</th>
                    <th className="px-4 py-3 font-medium">Nominal</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                        Belum ada data pengeluaran.
                      </td>
                    </tr>
                  ) : expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-600">{e.expense_date}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${CATEGORY_STYLE[e.category] ?? 'bg-slate-100 text-slate-600'}`}>
                          {CATEGORIES.find(c => c.value === e.category)?.label ?? e.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{e.description}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{formatRupiah(e.amount)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="rounded-lg px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        {/* Form Tambah Pengeluaran */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sticky top-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-2xl bg-rose-50 p-2 text-rose-600"><Wallet size={18} /></div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Catat Pengeluaran</h3>
              <p className="text-xs text-slate-500">Isi form untuk menambah data baru</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Kategori</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {CATEGORIES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Keterangan</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Cth: Bayar listrik tiang RT"
                required
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Nominal (Rp)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Cth: 250000"
                required
                min={1}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Tanggal</label>
              <input
                type="date"
                name="expense_date"
                value={formData.expense_date}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Simpan Pengeluaran
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}