import { createContext, useContext, useState, useMemo } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppProvider = ({ children }) => {
  const [houses, setHouses] = useState([
    { no: 'A-01', status: 'Dihuni', occupant: 'Budi Santoso', occupancy: 'Tetap', history: '3 riwayat pindah' },
    { no: 'A-02', status: 'Dihuni', occupant: 'Siti Amelia', occupancy: 'Kontrak', history: '1 riwayat pindah' },
    { no: 'B-01', status: 'Tidak dihuni', occupant: '-', occupancy: '-', history: 'Kosong' },
    { no: 'C-03', status: 'Dihuni', occupant: 'Andi Pratama', occupancy: 'Tetap', history: '2 riwayat pindah' },
  ]);

  const [payments, setPayments] = useState([
    { house: 'A-01', resident: 'Budi Santoso', type: 'Tetap', status: 'Lunas', amount: 115000, date: '26 Jun 2026', desc: 'Satpam + kebersihan' },
    { house: 'B-04', resident: 'Siti Amelia', type: 'Kontrak', status: 'Lunas', amount: 100000, date: '25 Jun 2026', desc: 'Satpam' },
    { house: 'C-02', resident: 'Andi Pratama', type: 'Tetap', status: 'Belum', amount: 115000, date: '24 Jun 2026', desc: 'Tahunan' },
    { house: 'D-03', resident: 'Rina Wulandari', type: 'Kontrak', status: 'Lunas', amount: 15000, date: '22 Jun 2026', desc: 'Kebersihan' },
  ]);

  const [monthlyChart, setMonthlyChart] = useState([
    { month: 'Jan', income: 145, expense: 92 },
    { month: 'Feb', income: 152, expense: 88 },
    { month: 'Mar', income: 148, expense: 101 },
    { month: 'Apr', income: 160, expense: 95 },
  ]);

  const value = useMemo(() => ({
    houses, setHouses,
    payments, setPayments,
    monthlyChart, setMonthlyChart
  }), [houses, payments, monthlyChart]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};