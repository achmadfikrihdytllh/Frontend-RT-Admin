import React, { useEffect, useState } from "react";
import api from "../api";
import SectionCard from "../components/SectionCard";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [residents, setResidents] = useState([]);
  const [feeCategories, setFeeCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [period, setPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const [manualForm, setManualForm] = useState({
    resident_id: "",
    fee_category_id: "",
    for_month: new Date().getMonth() + 1,
    for_year: new Date().getFullYear(),
    number_of_months: 1,
    payment_date: new Date().toISOString().split("T")[0],
  });

  const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value ?? 0);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [payRes, resRes, feeRes] = await Promise.all([
        api.get("/payments"),
        api.get("/residents"),
        api.get("/fee-categories"),
      ]);
      setPayments(payRes.data?.data ?? []);
      setResidents(resRes.data?.data ?? []);
      setFeeCategories(feeRes.data?.data ?? []);
    } catch {
      setError("Gagal mengambil data.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setError(""); setSuccess("");
    try {
      const res = await api.post("/payments/generate-monthly", {
        month: period.month,
        year: period.year,
      });
      setSuccess(res.data.message);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message ?? "Gagal generate tagihan.");
    }
  };

  const handlePay = async (paymentId) => {
    setError(""); setSuccess("");
    try {
      const res = await api.patch(`/payments/${paymentId}/pay`);
      setSuccess(res.data.message);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message ?? "Gagal melunasi tagihan.");
    }
  };

  const handlePeriodChange = (e) => {
    const { name, value } = e.target;
    setPeriod((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      const res = await api.post("/payments", {
        ...manualForm,
        resident_id: Number(manualForm.resident_id),
        fee_category_id: Number(manualForm.fee_category_id),
        for_month: Number(manualForm.for_month),
        for_year: Number(manualForm.for_year),
        number_of_months: Number(manualForm.number_of_months),
      });
      setSuccess(res.data?.message ?? "Pembayaran berhasil dicatat!");
      setManualForm({
        resident_id: "",
        fee_category_id: "",
        for_month: new Date().getMonth() + 1,
        for_year: new Date().getFullYear(),
        number_of_months: 1,
        payment_date: new Date().toISOString().split("T")[0],
      });
      fetchAll();
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors).flat().join(", ") : "Gagal menyimpan pembayaran.");
    }
  };

  const totalBelum = payments.filter((p) => p.status === "belum").length;
  const totalLunas = payments.filter((p) => p.status === "lunas").length;
  const totalNominal = payments
    .filter((p) => p.status === "lunas")
    .reduce((sum, p) => sum + p.amount_paid, 0);

  const selectedFee = feeCategories.find((f) => f.id == manualForm.fee_category_id);
  const estimasiTotal = (selectedFee?.amount ?? 0) * Number(manualForm.number_of_months);

  return (
    <div className="space-y-6">
      <SectionCard title="Pembayaran Iuran" subtitle="Kelola tagihan dan pembayaran warga">

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        {success && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>
        )}

        {/* Ringkasan */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Total Tagihan Belum Lunas</p>
            <h3 className="mt-2 text-3xl font-bold text-amber-600">{totalBelum}</h3>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Total Tagihan Lunas</p>
            <h3 className="mt-2 text-3xl font-bold text-emerald-600">{totalLunas}</h3>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Total Pemasukan</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">{formatRupiah(totalNominal)}</h3>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_0.4fr]">

          {/* Tabel */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {loading ? (
              <div className="p-10 text-center text-slate-400">Memuat data...</div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-sm font-semibold">Penghuni</th>
                    <th className="px-5 py-3 text-left text-sm font-semibold">Iuran</th>
                    <th className="px-5 py-3 text-left text-sm font-semibold">Periode</th>
                    <th className="px-5 py-3 text-left text-sm font-semibold">Nominal</th>
                    <th className="px-5 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-5 py-3 text-center text-sm font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">Belum ada tagihan.</td>
                    </tr>
                  ) : payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-5 py-4 font-medium text-slate-800">{payment.resident?.full_name}</td>
                      <td className="px-5 py-4 text-slate-600">{payment.fee_category?.name}</td>
                      <td className="px-5 py-4 text-slate-600">
                        {MONTHS[payment.for_month - 1]} {payment.for_year}
                      </td>
                      <td className="px-5 py-4 font-medium">{formatRupiah(payment.amount_paid)}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${payment.status === "lunas" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {payment.status === "lunas" ? "Lunas" : "Belum"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {payment.status === "belum" ? (
                          <button
                            onClick={() => handlePay(payment.id)}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-emerald-700"
                          >
                            Lunasi
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Panel Kanan */}
          <div className="space-y-4 sticky top-6">

            {/* Generate Tagihan */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Generate Tagihan</h3>
              <p className="mb-4 text-sm text-slate-500">
                Buat tagihan otomatis untuk seluruh penghuni aktif.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Bulan</label>
                  <select
                    name="month"
                    value={period.month}
                    onChange={handlePeriodChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-slate-900 focus:outline-none"
                  >
                    {MONTHS.map((month, index) => (
                      <option key={index} value={index + 1}>{month}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Tahun</label>
                  <input
                    type="number"
                    name="year"
                    min="2025"
                    value={period.year}
                    onChange={handlePeriodChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleGenerate}
                  className="w-full rounded-xl bg-slate-900 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Generate Tagihan
                </button>
              </div>
              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <h4 className="mb-2 text-xs font-semibold text-slate-700">Informasi</h4>
                <ul className="space-y-1.5 text-xs leading-relaxed text-slate-500">
                  <li>• Generate hanya membuat tagihan yang belum ada.</li>
                  <li>• Tagihan yang sudah ada tidak akan dibuat ulang.</li>
                  <li>• Setiap penghuni mendapat seluruh kategori iuran.</li>
                  <li>• Setelah warga membayar, klik tombol <b>Lunasi</b>.</li>
                </ul>
              </div>
            </div>

            {/* Catat Pembayaran Manual */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Catat Pembayaran</h3>
              <p className="mb-4 text-sm text-slate-500">
                Catat pembayaran manual, termasuk pembayaran beberapa bulan sekaligus.
              </p>
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Penghuni</label>
                  <select
                    value={manualForm.resident_id}
                    onChange={(e) => setManualForm(prev => ({ ...prev, resident_id: e.target.value }))}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="">Pilih penghuni...</option>
                    {residents.map((r) => (
                      <option key={r.id} value={r.id}>{r.full_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Kategori Iuran</label>
                  <select
                    value={manualForm.fee_category_id}
                    onChange={(e) => setManualForm(prev => ({ ...prev, fee_category_id: e.target.value }))}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="">Pilih kategori...</option>
                    {feeCategories.map((f) => (
                      <option key={f.id} value={f.id}>{f.name} — {formatRupiah(f.amount)}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Bulan Mulai</label>
                    <select
                      value={manualForm.for_month}
                      onChange={(e) => setManualForm(prev => ({ ...prev, for_month: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      {MONTHS.map((m, i) => (
                        <option key={i} value={i + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Tahun</label>
                    <input
                      type="number"
                      value={manualForm.for_year}
                      onChange={(e) => setManualForm(prev => ({ ...prev, for_year: e.target.value }))}
                      min={2000}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Jumlah Bulan
                    <span className="ml-1 font-normal text-slate-400">(bayar sekaligus)</span>
                  </label>
                  <input
                    type="number"
                    value={manualForm.number_of_months}
                    onChange={(e) => setManualForm(prev => ({ ...prev, number_of_months: e.target.value }))}
                    min={1}
                    max={12}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  {manualForm.number_of_months > 1 && selectedFee && (
                    <p className="mt-1 text-xs text-indigo-600 font-medium">
                      Estimasi total: {formatRupiah(estimasiTotal)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Tanggal Bayar</label>
                  <input
                    type="date"
                    value={manualForm.payment_date}
                    onChange={(e) => setManualForm(prev => ({ ...prev, payment_date: e.target.value }))}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-medium text-white transition hover:bg-indigo-700"
                >
                  Simpan Pembayaran
                </button>
              </form>
            </div>

          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default Payments;