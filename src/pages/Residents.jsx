import React, { useEffect, useState } from "react";
import {
  BadgeCheck,
  FileImage,
  Phone,
  UsersRound,
  X,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import api from "../api";

function Modal({ title, onClose, children }) {
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function DetailModal({ resident, onClose }) {
  const ktpUrl = resident.ktp_photo_path
    ? `http://localhost:8000/storage/${resident.ktp_photo_path}`
    : null;

  return (
    <Modal title="Detail Penghuni" onClose={onClose}>
      <div className="space-y-4">
        {ktpUrl && (
          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <img
              src={ktpUrl}
              alt="Foto KTP"
              className="w-full object-cover"
              onError={(e) => console.error("Gagal load:", e.target.src)}
            />
          </div>
        )}

        <dl className="divide-y divide-slate-100 text-sm">
          {[
            ["ID", resident.id],
            ["Nama Lengkap", resident.full_name],
            ["Nomor Telepon", resident.phone_number || "—"],
            ["Status", resident.status === "tetap" ? "Tetap" : "Kontrak"],
            [
              "Status Menikah",
              resident.is_married ? "Sudah Menikah" : "Belum Menikah",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-3">
              <dt className="text-slate-500">{label}</dt>
              <dd className="font-medium text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>

        <button
          onClick={onClose}
          className="mt-2 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Tutup
        </button>
      </div>
    </Modal>
  );
}

function EditModal({ resident, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    full_name: resident.full_name,
    phone_number: resident.phone_number ?? "",
    status: resident.status,
    is_married: String(resident.is_married ? 1 : 0),
  });
  const [ktpFile, setKtpFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Khusus nomor telepon: hanya boleh angka
  const handlePhoneChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, phone_number: onlyDigits }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = new FormData();
    payload.append("_method", "PUT");
    payload.append("full_name", formData.full_name);
    payload.append("phone_number", formData.phone_number);
    payload.append("status", formData.status);
    payload.append("is_married", formData.is_married);
    if (ktpFile) payload.append("ktp_photo", ktpFile);

    try {
      await api.post(`/residents/${resident.id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUpdated();
      onClose();
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(
        errors
          ? Object.values(errors).flat().join(", ")
          : "Gagal mengupdate penghuni.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Edit Data Penghuni" onClose={onClose}>
      {error && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            <BadgeCheck size={15} /> Nama Lengkap
          </label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            <Phone size={15} /> Nomor Telepon
          </label>
          <input
            type="text"
            inputMode="numeric"
            name="phone_number"
            value={formData.phone_number}
            onChange={handlePhoneChange}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="tetap">Tetap</option>
              <option value="kontrak">Kontrak</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Status Menikah
            </label>
            <select
              name="is_married"
              value={formData.is_married}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="1">Sudah Menikah</option>
              <option value="0">Belum Menikah</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            <FileImage size={15} /> Ganti Foto KTP{" "}
            <span className="text-xs font-normal text-slate-400">
              (opsional)
            </span>
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={(e) => setKtpFile(e.target.files[0])}
            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {loading ? "Menyimpan…" : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteModal({ resident, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      await api.delete(`/residents/${resident.id}`);
      onDeleted();
      onClose();
    } catch {
      setError("Gagal menghapus penghuni. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Hapus Penghuni" onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
          Apakah Anda yakin ingin menghapus{" "}
          <span className="font-semibold">{resident.full_name}</span>? Tindakan
          ini tidak dapat dibatalkan dan foto KTP akan ikut terhapus.
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-60"
          >
            {loading ? "Menghapus…" : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function Residents() {
  const [residents, setResidents] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailTarget, setDetailTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    status: "tetap",
    is_married: "0",
  });
  const [ktpFile, setKtpFile] = useState(null);

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/residents");
      setResidents(res.data?.data ?? []);
    } catch {
      setError("Gagal memuat data penghuni.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Khusus nomor telepon: hanya boleh angka
  const handlePhoneChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, phone_number: onlyDigits }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.full_name || !ktpFile) {
      setError("Nama lengkap dan foto KTP wajib diisi.");
      return;
    }

    const payload = new FormData();
    payload.append("full_name", formData.full_name);
    payload.append("phone_number", formData.phone_number);
    payload.append("status", formData.status);
    payload.append("is_married", formData.is_married);
    payload.append("ktp_photo", ktpFile);

    try {
      await api.post("/residents", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Penghuni berhasil ditambahkan!");
      await fetchResidents();
      setFormData({
        full_name: "",
        phone_number: "",
        status: "tetap",
        is_married: "0",
      });
      setKtpFile(null);
      document.getElementById("ktp-input-add")?.((el) => {
        el.value = "";
      });
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(
        errors
          ? Object.values(errors).flat().join(", ")
          : "Gagal menyimpan penghuni.",
      );
    }
  };

  return (
    <>
      {/* ── Modals ── */}
      {detailTarget && (
        <DetailModal
          resident={detailTarget}
          onClose={() => setDetailTarget(null)}
        />
      )}
      {editTarget && (
        <EditModal
          resident={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdated={() => {
            setSuccess("Data penghuni berhasil diupdate!");
            fetchResidents();
          }}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          resident={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            setSuccess("Penghuni berhasil dihapus!");
            fetchResidents();
          }}
        />
      )}

      <div className="space-y-6">
        {/* ── Header ── */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                <UsersRound size={14} /> Data Penghuni
              </div>
              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                Kelola penghuni tetap dan kontrak
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Menyimpan nama lengkap, foto KTP, status penghuni, nomor
                telepon, dan status menikah.
              </p>
            </div>
            <button
              onClick={() =>
                document
                  .getElementById("form-penghuni")
                  .scrollIntoView({ behavior: "smooth" })
              }
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              + Tambah Penghuni
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}
        </section>

        {/* ── Summary Cards ── */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Total penghuni", residents.length],
            [
              "Status tetap",
              residents.filter((r) => r.status === "tetap").length,
            ],
            [
              "Status kontrak",
              residents.filter((r) => r.status === "kontrak").length,
            ],
            [
              "Sudah menikah",
              residents.filter((r) => r.is_married == 1).length,
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr] items-start">
          {/* ── Table ── */}
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <h3 className="text-base font-semibold text-slate-900">
                Daftar Penghuni
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Data penghuni dari database.
              </p>
            </div>
            <div className="overflow-x-auto max-h-125 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-sm text-slate-400">
                  Memuat data...
                </div>
              ) : (
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-slate-500 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nama</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Telepon</th>
                      <th className="px-4 py-3 font-medium">Menikah</th>
                      <th className="px-4 py-3 font-medium text-center">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {residents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-slate-400"
                        >
                          Belum ada data penghuni.
                        </td>
                      </tr>
                    ) : (
                      residents.map((r) => (
                        <tr
                          key={r.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 py-4">
                            <div className="font-medium text-slate-900">
                              {r.full_name}
                            </div>
                            <div className="mt-1 text-xs text-slate-400">
                              ID {r.id}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                r.status === "tetap"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {r.status === "tetap" ? "Tetap" : "Kontrak"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            {r.phone_number || "—"}
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            {r.is_married ? "Sudah" : "Belum"}
                          </td>
                          {/* Action buttons */}
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-1">
                              {/* Detail */}
                              <button
                                onClick={() => setDetailTarget(r)}
                                title="Lihat detail"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-sky-50 hover:text-sky-600"
                              >
                                <Eye size={15} />
                              </button>
                              {/* Edit */}
                              <button
                                onClick={() => setEditTarget(r)}
                                title="Edit penghuni"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
                              >
                                <Pencil size={15} />
                              </button>
                              {/* Delete */}
                              <button
                                onClick={() => setDeleteTarget(r)}
                                title="Hapus penghuni"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* ── Add Form ── */}
          <section
            id="form-penghuni"
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sticky top-6"
          >
            <h3 className="text-base font-semibold text-slate-900">
              Form Tambah Penghuni
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Isi data untuk menambahkan penghuni baru.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <BadgeCheck size={16} /> Nama Lengkap
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Cth: Ahmad Reza"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Phone size={16} /> Nomor Telepon
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handlePhoneChange}
                  placeholder="Cth: 081234567890"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="tetap">Tetap</option>
                    <option value="kontrak">Kontrak</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Status Menikah
                  </label>
                  <select
                    name="is_married"
                    value={formData.is_married}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="1">Sudah Menikah</option>
                    <option value="0">Belum Menikah</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <FileImage size={16} /> Upload KTP
                </label>
                <input
                  id="ktp-input-add"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={(e) => setKtpFile(e.target.files[0])}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                />
              </div>

              <button
                type="submit"
                className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Simpan Penghuni
              </button>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}