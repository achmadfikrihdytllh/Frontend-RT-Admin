import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleCheckBig, CircleDashed, Home, Landmark, ReceiptText, ShieldCheck, Users, Wallet, MapPin, Receipt, TrendingDown, FileText } from 'lucide-react';
import api from '../api';
import SectionCard from '../components/SectionCard';
import MiniBarChart from '../components/MiniBarChart';

const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [houses, setHouses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatRupiah = (number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dashRes, houseRes, paymentRes] = await Promise.all([
        api.get('/reports/dashboard'),
        api.get('/houses'),
        api.get('/payments'),
      ]);
      setSummary(dashRes.data?.data ?? null);
      setHouses(houseRes.data?.data ?? []);
      setPayments(paymentRes.data?.data ?? []);
    } catch (err) {
      setError('Gagal memuat data dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const totalHouses = houses.length;
  const activeResidents = houses.filter(h => h.status === 'dihuni').length;

  const summaryCards = [
    {
      label: 'Total Rumah',
      value: totalHouses.toString(),
      hint: 'Total rumah terdaftar',
      icon: Home,
      tone: 'bg-sky-50 text-sky-700',
    },
    {
      label: 'Penghuni Aktif',
      value: activeResidents.toString(),
      hint: 'Rumah status dihuni',
      icon: Users,
      tone: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Saldo Bulan Ini',
      value: formatRupiah(summary?.saldo ?? 0),
      hint: summary?.period?.label ?? 'Pemasukan - pengeluaran',
      icon: Wallet,
      tone: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Tunggakan',
      value: `${summary?.outstanding_count ?? 0} tagihan`,
      hint: formatRupiah(summary?.outstanding_amount ?? 0),
      icon: ReceiptText,
      tone: 'bg-rose-50 text-rose-700',
    },
  ];

  const quickActions = [
    { label: 'Tambah Penghuni', desc: 'Daftarkan penghuni baru', icon: Users, color: 'bg-sky-50 text-sky-700', path: '/residents' },
    { label: 'Kelola Rumah', desc: 'Assign atau keluarkan penghuni', icon: MapPin, color: 'bg-emerald-50 text-emerald-700', path: '/houses' },
    { label: 'Catat Pembayaran', desc: 'Input pembayaran manual', icon: Wallet, color: 'bg-amber-50 text-amber-700', path: '/payments' },
    { label: 'Generate Tagihan', desc: 'Buat tagihan bulanan otomatis', icon: Receipt, color: 'bg-indigo-50 text-indigo-700', path: '/payments' },
    { label: 'Catat Pengeluaran', desc: 'Tambah data pengeluaran RT', icon: TrendingDown, color: 'bg-rose-50 text-rose-700', path: '/expenses' },
    { label: 'Lihat Laporan', desc: 'Report bulanan & grafik tahunan', icon: FileText, color: 'bg-purple-50 text-purple-700', path: '/report' },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        Memuat dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Hero */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-r from-slate-900 via-slate-800 to-slate-700 px-8 py-8 text-white shadow-lg">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-100">
              <ShieldCheck size={14} /> RT Admin
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Kelola penghuni, rumah, pembayaran, dan report bulanan dalam satu dashboard.
            </h2>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <p className="text-xs text-slate-300">Rumah aktif</p>
            <p className="mt-2 text-lg font-semibold">{activeResidents} / {totalHouses}</p>
            <p className="mt-1 text-xs text-slate-400">{summary?.period?.label}</p>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="mt-3 text-2xl font-bold text-slate-900">{card.value}</p>
                  <p className="mt-2 text-sm text-slate-500">{card.hint}</p>
                </div>
                <div className={`rounded-2xl p-3 ${card.tone}`}><Icon size={20} /></div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">

        {/* Quick Actions */}
        <SectionCard title="Quick Actions" subtitle="Akses cepat untuk fungsionalitas">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:shadow-sm"
                >
                  <div className={`rounded-xl p-2.5 ${action.color}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{action.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </SectionCard>

        <MiniBarChart />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">

        {/* Tabel Pembayaran Terbaru */}
        <SectionCard title="Status Pembayaran Terbaru" subtitle="Daftar pembayaran bulan ini">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Penghuni</th>
                  <th className="px-4 py-3 font-medium">Kategori</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                      Belum ada data pembayaran.
                    </td>
                  </tr>
                ) : payments.slice(0, 8).map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {item.resident?.full_name ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.fee_category?.name ?? '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.status === 'lunas' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {item.status === 'lunas' ? 'Lunas' : 'Belum'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatRupiah(item.amount_paid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Status Rumah */}
        <SectionCard title="Status Rumah" subtitle="Dihuni / tidak dihuni">
          <div className="space-y-3 h-64 overflow-y-auto pr-2">
            {houses.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Belum ada data rumah.</p>
            ) : houses.map((house) => {
              const activeHistory = house.histories?.[0];
              const occupantName = activeHistory?.resident?.full_name ?? 'Kosong';
              const isDihuni = house.status === 'dihuni';
              return (
                <div key={house.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-slate-900">{house.house_code}</h4>
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${isDihuni ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {isDihuni ? <CircleCheckBig size={14} /> : <CircleDashed size={14} />}
                          {isDihuni ? 'Dihuni' : 'Tidak Dihuni'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">Penghuni: {occupantName}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Landmark size={16} /> {house.histories?.length ?? 0} riwayat
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

      </div>
    </div>
  );
};

export default Dashboard;