import React, { useEffect, useState } from 'react';
import { CircleCheckBig, CircleDashed, Landmark, Pencil, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api';
import SectionCard from '../components/SectionCard';

const MONTHS = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
];

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value ?? 0);

export default function Houses() {
  const [houses, setHouses] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editHouse, setEditHouse] = useState(null);
  const [editCode, setEditCode] = useState('');

  const [openHistory, setOpenHistory] = useState(null);
  const [historyTab, setHistoryTab] = useState('penghuni');
  const [historyData, setHistoryData] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [formData, setFormData] = useState({ house_code: '' });
  const [assignData, setAssignData] = useState({
    house_id: '',
    resident_id: '',
    start_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [houseRes, residentRes] = await Promise.all([
        api.get('/houses'),
        api.get('/residents'),
      ]);
      setHouses(houseRes.data?.data ?? []);
      setResidents(residentRes.data?.data ?? []);
    } catch {
      setError('Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHouse = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.post('/houses', formData);
      setSuccess('Rumah berhasil ditambahkan!');
      setFormData({ house_code: '' });
      await fetchAll();
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors).flat().join(', ') : 'Gagal menambah rumah.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.put(`/houses/${editHouse.id}`, { house_code: editCode });
      setSuccess('Kode rumah berhasil diperbarui!');
      setEditHouse(null);
      setEditCode('');
      await fetchAll();
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors).flat().join(', ') : 'Gagal mengupdate rumah.');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.post(`/houses/${assignData.house_id}/assign`, {
        resident_id: assignData.resident_id,
        start_date: assignData.start_date,
      });
      setSuccess('Penghuni berhasil di-assign ke rumah!');
      setAssignData({ house_id: '', resident_id: '', start_date: new Date().toISOString().split('T')[0] });
      await fetchAll();
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors).flat().join(', ') : err.response?.data?.message ?? 'Gagal assign penghuni.');
    }
  };

  const handleUnassign = async (houseId) => {
    if (!window.confirm('Keluarkan penghuni dari rumah ini?')) return;
    setError(''); setSuccess('');
    try {
      await api.post(`/houses/${houseId}/unassign`);
      setSuccess('Penghuni berhasil dikeluarkan!');
      if (openHistory === houseId) setOpenHistory(null);
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal mengeluarkan penghuni.');
    }
  };

  const handleDeleteHouse = async (house) => {
    if (!window.confirm(`Hapus rumah ${house.house_code}? Tindakan ini tidak bisa dibatalkan.`)) return;
    setError(''); setSuccess('');
    try {
      await api.delete(`/houses/${house.id}`);
      setSuccess(`Rumah ${house.house_code} berhasil dihapus!`);
      if (openHistory === house.id) setOpenHistory(null);
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal menghapus rumah.');
    }
  };

  const toggleHistory = async (house) => {
    if (openHistory === house.id) {
      setOpenHistory(null);
      setHistoryData([]);
      setPaymentHistory([]);
      return;
    }
    setOpenHistory(house.id);
    setHistoryTab('penghuni');
    setHistoryLoading(true);
    try {
      const res = await api.get(`/houses/${house.id}`);
      const detail = res.data?.data;
      setHistoryData(detail?.histories ?? []);

      const allPayments = (detail?.histories ?? []).flatMap((h) =>
        (h.resident?.payments ?? []).map((p) => ({
          ...p,
          resident_name: h.resident?.full_name,
        }))
      );

      allPayments.sort((a, b) => {
        if (b.for_year !== a.for_year) return b.for_year - a.for_year;
        return b.for_month - a.for_month;
      });

      setPaymentHistory(allPayments);
    } catch {
      setError('Gagal memuat history rumah.');
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}
      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>
      )}

      {/* Modal Edit */}
      {editHouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900">Edit Kode Rumah</h3>
              <button onClick={() => setEditHouse(null)} className="rounded-lg p-1 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Kode Rumah</label>
                <input
                  type="text"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditHouse(null)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr] items-start">

        {/* Daftar Rumah */}
        <SectionCard title="Kelola Rumah" subtitle="Daftar seluruh rumah di RT">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400">Memuat data...</div>
          ) : (
            <div className="space-y-3 max-h-150 overflow-y-auto pr-1">
              {houses.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">Belum ada data rumah.</p>
              ) : houses.map((house) => {
                const activeHistory = house.histories?.[0];
                const occupantName = activeHistory?.resident?.full_name ?? 'Kosong';
                const isDihuni = house.status === 'dihuni';
                const isHistoryOpen = openHistory === house.id;

                return (
                  <div key={house.id} className="rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="p-4">
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

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleHistory(house)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                          >
                            <Landmark size={13} />
                            {house.histories?.length ?? 0} riwayat
                            {isHistoryOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>

                          <button
                            onClick={() => { setEditHouse(house); setEditCode(house.house_code); }}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:bg-slate-50"
                          >
                            <Pencil size={13} />
                          </button>

                          {isDihuni && (
                            <button
                              onClick={() => handleUnassign(house.id)}
                              className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                            >
                              Keluarkan
                            </button>
                          )}

                          {!isDihuni && (
                            <button
                              onClick={() => handleDeleteHouse(house)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                            >
                              <Trash2 size={13} />
                              Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Panel History */}
                    {isHistoryOpen && (
                      <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">

                        {/* Tab */}
                        <div className="flex gap-2 mb-3">
                          <button
                            onClick={() => setHistoryTab('penghuni')}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${historyTab === 'penghuni' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                          >
                            Riwayat Penghuni
                          </button>
                          <button
                            onClick={() => setHistoryTab('pembayaran')}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${historyTab === 'pembayaran' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                          >
                            Riwayat Pembayaran
                          </button>
                        </div>

                        {historyLoading ? (
                          <p className="text-xs text-slate-400">Memuat riwayat...</p>
                        ) : historyTab === 'penghuni' ? (
                          historyData.length === 0 ? (
                            <p className="text-xs text-slate-400">Belum ada riwayat penghuni.</p>
                          ) : (
                            <div className="space-y-2">
                              {historyData.map((h) => (
                                <div key={h.id} className="flex items-center justify-between rounded-xl bg-white border border-slate-200 px-3 py-2.5">
                                  <div>
                                    <p className="text-sm font-medium text-slate-900">{h.resident?.full_name ?? '-'}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      {h.start_date} — {h.end_date ?? <span className="text-emerald-600 font-medium">Sekarang</span>}
                                    </p>
                                  </div>
                                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${!h.end_date ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {!h.end_date ? 'Aktif' : 'Selesai'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )
                        ) : (
                          paymentHistory.length === 0 ? (
                            <p className="text-xs text-slate-400">Belum ada riwayat pembayaran.</p>
                          ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {paymentHistory.map((p) => (
                                <div key={p.id} className="flex items-center justify-between rounded-xl bg-white border border-slate-200 px-3 py-2.5">
                                  <div>
                                    <p className="text-sm font-medium text-slate-900">{p.resident_name}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      {p.fee_category?.name} — {MONTHS[(p.for_month ?? 1) - 1]} {p.for_year}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-medium text-slate-900">{formatRupiah(p.amount_paid)}</p>
                                    <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${p.status === 'lunas' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                      {p.status === 'lunas' ? 'Lunas' : 'Belum'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Form Kanan */}
        <div className="space-y-4">

          {/* Tambah Rumah */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Tambah Rumah Baru</h3>
            <p className="mt-1 text-sm text-slate-500">Daftarkan kode rumah baru ke sistem.</p>
            <form onSubmit={handleAddHouse} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Kode Rumah</label>
                <input
                  type="text"
                  value={formData.house_code}
                  onChange={(e) => setFormData({ house_code: e.target.value })}
                  placeholder="Cth: A-05"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Tambah Rumah
              </button>
            </form>
          </div>

          {/* Assign Penghuni */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Assign Penghuni ke Rumah</h3>
            <p className="mt-1 text-sm text-slate-500">Hubungkan penghuni dengan rumah yang tersedia.</p>
            <form onSubmit={handleAssign} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Pilih Rumah</label>
                <select
                  value={assignData.house_id}
                  onChange={(e) => setAssignData(prev => ({ ...prev, house_id: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="">Pilih rumah...</option>
                  {houses.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.house_code} — {h.status === 'dihuni' ? 'Dihuni' : 'Kosong'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Pilih Penghuni</label>
                <select
                  value={assignData.resident_id}
                  onChange={(e) => setAssignData(prev => ({ ...prev, resident_id: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="">Pilih penghuni...</option>
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>{r.full_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Tanggal Mulai</label>
                <input
                  type="date"
                  value={assignData.start_date}
                  onChange={(e) => setAssignData(prev => ({ ...prev, start_date: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                Assign Penghuni
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}