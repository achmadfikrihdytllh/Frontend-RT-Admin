# Frontend RT Admin — React + Vite

Antarmuka pengguna untuk aplikasi administrasi RT, dibangun dengan React 18 dan Vite.

> Repository backend tersedia di: https://github.com/achmadfikrihdytllh/Backend-RT-Admin

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | React 18 |
| Build Tool | Vite |
| Styling | Tailwind CSS v3 |
| HTTP Client | Axios |
| Routing | React Router v6 |
| Icons | Lucide React |

---

## Prasyarat

Pastikan perangkat kamu sudah terinstal:

- Node.js >= 18.x
- npm >= 9.x
- Git

> Backend harus sudah berjalan sebelum menjalankan frontend. Ikuti panduan instalasi backend terlebih dahulu.

---

## Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/achmadfikrihdytllh/Frontend-RT-Admin.git
cd Frontend-RT-Admin
```

### 2. Install Dependency

```bash
npm install
```

### 3. Konfigurasi API URL

Buka file `src/api.js` dan pastikan `baseURL` mengarah ke backend yang sudah berjalan:

```js
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});
```

> Jika backend berjalan di port berbeda, sesuaikan URL di sini.

### 4. Jalankan Server Development

```bash
npm run dev
```

Frontend akan berjalan di: `http://localhost:5173`

---

## Verifikasi Instalasi

Buka browser dan akses `http://localhost:5173`. Pastikan hal-hal berikut berfungsi:

| Halaman | URL | Yang Diverifikasi |
|---|---|---|
| Dashboard | `/` | Summary cards & grafik muncul |
| Data Rumah | `/houses` | Daftar rumah tampil |
| Data Penghuni | `/residents` | Daftar penghuni tampil |
| Pembayaran & Laporan | `/payments` | Tabel tagihan tampil |
| Pengeluaran | `/expenses` | Tabel pengeluaran tampil |
| Laporan Bulanan | `/report` | Grafik tahunan tampil |

---

## Troubleshooting

### Data tidak muncul / halaman kosong
Pastikan backend sudah berjalan di `http://127.0.0.1:8000` dan bisa diakses. Buka browser ke `http://127.0.0.1:8000/api/ping` — jika tidak ada response, backend belum berjalan.

### CORS Error di console browser
Backend belum mengizinkan origin frontend. Ikuti langkah konfigurasi CORS di README backend.

### Port 5173 sudah digunakan
Vite otomatis mencari port berikutnya. Atau jalankan di port spesifik:
```bash
npm run dev -- --port 3000
```

---

## Fitur Aplikasi

- **Dashboard** — Summary penghuni, saldo, tunggakan, grafik bulanan, quick actions
- **Kelola Penghuni** — Tambah & edit penghuni, upload foto KTP
- **Kelola Rumah** — Tambah & edit rumah, assign/keluarkan penghuni, riwayat penghuni & pembayaran per rumah
- **Pembayaran** — Generate tagihan bulanan otomatis, lunasi tagihan, catat pembayaran manual multi-bulan
- **Pengeluaran** — Catat & hapus pengeluaran RT per kategori
- **Laporan Bulanan** — Grafik tahunan pemasukan & pengeluaran, detail laporan per bulan

---

## Lisensi

Project ini dibuat untuk keperluan administrasi RT. Hak cipta © 2026.