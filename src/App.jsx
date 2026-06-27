import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Houses from './pages/Houses';
import Residents from './pages/Residents';
import Payments from './pages/Payment';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Expenses from './pages/Expenses';
import Report from './pages/Report';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/houses" element={<Houses />} />
            <Route path="/residents" element={<Residents />} />
            <Route path="/report" element={<Report />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/expenses" element={<Expenses />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;



