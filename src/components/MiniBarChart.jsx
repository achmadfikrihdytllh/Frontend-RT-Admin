import { useEffect, useState } from 'react';
import api from '../api';

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

const MiniBarChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchSummary();
  }, [year]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/summary', { params: { year } });
      const raw = res.data?.data ?? [];
      const mapped = raw.map((item, idx) => ({
        ...item,
        label: MONTH_LABELS[idx],
      }));
      setChartData(mapped);
    } catch (err) {
      console.error('Gagal fetch report summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const maxValue = chartData.length
    ? Math.max(...chartData.flatMap((item) => [item.income, item.expense]), 1)
    : 1;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Report Summary 1 Tahun</h3>
          <p className="mt-1 text-sm text-slate-500">Pemasukan dan pengeluaran bulanan.</p>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 border-none focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="mt-6 flex h-44 items-center justify-center text-sm text-slate-400">
          Memuat grafik...
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-12 gap-3 items-end">
          {chartData.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2">
              <div className="flex h-44 w-full items-end gap-1 rounded-2xl bg-slate-50 p-2">
                <div
                  className="w-1/2 rounded-full bg-emerald-500/90"
                  style={{ height: `${(item.income / maxValue) * 100}%`, minHeight: item.income > 0 ? '4px' : '0' }}
                  title={`Pemasukan: Rp ${item.income.toLocaleString('id-ID')}`}
                />
                <div
                  className="w-1/2 rounded-full bg-rose-400/90"
                  style={{ height: `${(item.expense / maxValue) * 100}%`, minHeight: item.expense > 0 ? '4px' : '0' }}
                  title={`Pengeluaran: Rp ${item.expense.toLocaleString('id-ID')}`}
                />
              </div>
              <span className="text-[11px] font-medium text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-600">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Pemasukan
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> Pengeluaran
        </span>
      </div>
    </div>
  );
};

export default MiniBarChart;