import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import api from '../api';
import SectionCard from '../components/SectionCard';

const MONTHS = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
];

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

export default function Report() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('');
  const [loading, setLoading] = useState(true);

  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);

  const formatRupiah = (number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);

    const formatRupiahShort = (number) => {
    if (number >= 1000000000) return `${(number / 1000000000).toFixed(1)}M`;
    if (number >= 1000000) return `${(number / 1000000).toFixed(1)}jt`;
    if (number >= 1000) return `${(number / 1000).toFixed(0)}rb`;
    return number.toString();
    };

  const formatTanggal = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  useEffect(() => {
    fetchDetail();
  }, [month, year]);

  useEffect(() => {
    fetchYearlySummary();
  }, [year]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/detail', { params: { month, year } });
      setData(res.data?.data ?? null);
      setPeriod(res.data?.period ?? '');
    } catch (err) {
      console.error('Gagal fetch report detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchYearlySummary = async () => {
    setChartLoading(true);
    try {
      const res = await api.get('/reports/summary', { params: { year } });
      const raw = res.data?.data ?? [];
      setChartData(raw.map((item, idx) => ({
        ...item,
        income: Number(item.income), 
        expense: Number(item.expense),
        label: MONTH_SHORT[idx],
      })));
    } catch (err) {
      console.error('Gagal fetch yearly summary:', err);
    } finally {
      setChartLoading(false);
    }
  };

  const saldo = (data?.total_income ?? 0) - (data?.total_expense ?? 0);

  const maxChart = chartData.length
    ? Math.max(...chartData.flatMap((d) => [d.income, d.expense]), 1)
    : 1;

  const totalIncomeTahun = chartData.reduce((s, d) => s + (d.income ?? 0), 0);
  const totalExpenseTahun = chartData.reduce((s, d) => s + (d.expense ?? 0), 0);
  const saldoTahun = totalIncomeTahun - totalExpenseTahun;

  return (
    <div className="space-y-6">

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
          {period}
        </span>
      </div>

      {/* Chart Tahunan */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Grafik Pemasukan & Pengeluaran {year}</h3>
            <p className="mt-1 text-sm text-slate-500">Perbandingan bulanan selama 1 tahun</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="rounded-2xl bg-emerald-50 px-4 py-2">
              <p className="text-xs text-emerald-600">Total Pemasukan</p>
              <p className="font-bold text-emerald-700">{formatRupiah(totalIncomeTahun)}</p>
            </div>
            <div className="rounded-2xl bg-rose-50 px-4 py-2">
              <p className="text-xs text-rose-600">Total Pengeluaran</p>
              <p className="font-bold text-rose-700">{formatRupiah(totalExpenseTahun)}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 px-4 py-2">
              <p className="text-xs text-amber-600">Saldo Tahun</p>
              <p className={`font-bold ${saldoTahun >= 0 ? 'text-amber-700' : 'text-rose-700'}`}>{formatRupiah(saldoTahun)}</p>
            </div>
          </div>
        </div>

        {chartLoading ? (
          <div className="flex h-48 items-center justify-center text-sm text-slate-400">Memuat grafik...</div>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-2 items-end">
              {chartData.map((item) => {
                const isCurrentMonth = MONTHS[month - 1]?.label === item.month;
                return (
                  <div key={item.label} className="flex flex-col items-center gap-1.5">
                    {/* Tooltip nilai */}
                    <div className="flex flex-col items-center gap-0.5 w-full">
                      {item.income > 0 && (
                        <span className="text-[9px] text-emerald-600 font-medium">
                          {formatRupiahShort(item.income)}
                        </span>
                      )}
                    </div>

                    {/* Bar */}
                    <div className={`flex h-40 w-full items-end gap-0.5 rounded-xl p-1.5 ${isCurrentMonth ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'bg-slate-50'}`}>
                      <div
                        className="w-1/2 rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ height: `${(item.income / maxChart) * 100}%`, minHeight: item.income > 0 ? '4px' : '0' }}
                        title={`Pemasukan: ${formatRupiah(item.income)}`}
                      />
                      <div
                        className="w-1/2 rounded-full bg-rose-400 transition-all duration-500"
                        style={{ height: `${(item.expense / maxChart) * 100}%`, minHeight: item.expense > 0 ? '4px' : '0' }}
                        title={`Pengeluaran: ${formatRupiah(item.expense)}`}
                      />
                    </div>

                    {/* Label bulan */}
                    <span className={`text-[10px] font-medium ${isCurrentMonth ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Pemasukan
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> Pengeluaran
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-200" /> Bulan dipilih
              </span>
            </div>
          </>
        )}
      </div>

      {/* Summary Cards Bulanan */}
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Total Pemasukan</p>
              <p className="mt-3 text-2xl font-bold text-emerald-600">{formatRupiah(data?.total_income)}</p>
              <p className="mt-2 text-sm text-slate-500">Iuran lunas bulan ini</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600"><TrendingUp size={20} /></div>
          </div>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Total Pengeluaran</p>
              <p className="mt-3 text-2xl font-bold text-rose-600">{formatRupiah(data?.total_expense)}</p>
              <p className="mt-2 text-sm text-slate-500">Pengeluaran bulan ini</p>
            </div>
            <div className="rounded-2xl bg-rose-50 p-3 text-rose-600"><TrendingDown size={20} /></div>
          </div>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Saldo Bulan Ini</p>
              <p className={`mt-3 text-2xl font-bold ${saldo >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                {formatRupiah(saldo)}
              </p>
              <p className="mt-2 text-sm text-slate-500">Pemasukan - pengeluaran</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-600"><Wallet size={20} /></div>
          </div>
        </article>
      </div>

      {/* Tabel Detail */}
      {loading ? (
        <div className="flex h-48 items-center justify-center text-sm text-slate-400">Memuat data...</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">

          <SectionCard title="Pemasukan" subtitle={`Iuran lunas — ${period}`}>
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Penghuni</th>
                    <th className="px-4 py-3 font-medium">Iuran</th>
                    <th className="px-4 py-3 font-medium">Tgl Bayar</th>
                    <th className="px-4 py-3 font-medium">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {data?.incomes?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400">Belum ada pemasukan bulan ini.</td>
                    </tr>
                  ) : data?.incomes?.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {item.resident?.full_name ?? '-'}
                        <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${item.resident?.status === 'tetap' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {item.resident?.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.fee_category?.name ?? '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{formatTanggal(item.payment_date)}</td>
                      <td className="px-4 py-3 font-medium text-emerald-600">{formatRupiah(item.amount_paid)}</td>
                    </tr>
                  ))}
                </tbody>
                {data?.incomes?.length > 0 && (
                  <tfoot className="bg-slate-50">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-slate-700">Total</td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-600">{formatRupiah(data?.total_income)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </SectionCard>

          <SectionCard title="Pengeluaran" subtitle={`Detail pengeluaran — ${period}`}>
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Tanggal</th>
                    <th className="px-4 py-3 font-medium">Keterangan</th>
                    <th className="px-4 py-3 font-medium">Kategori</th>
                    <th className="px-4 py-3 font-medium">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {data?.expenses?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400">Belum ada pengeluaran bulan ini.</td>
                    </tr>
                  ) : data?.expenses?.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-600">{formatTanggal(item.expense_date)}</td>
                      <td className="px-4 py-3 text-slate-600">{item.description}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-rose-600">{formatRupiah(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                {data?.expenses?.length > 0 && (
                  <tfoot className="bg-slate-50">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-slate-700">Total</td>
                      <td className="px-4 py-3 text-sm font-bold text-rose-600">{formatRupiah(data?.total_expense)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </SectionCard>

        </div>
      )}
    </div>
  );
}