import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Admin/Dashboard';
import Tables from './pages/Admin/Tables';
import Menu from './pages/Admin/Menu';
import Reports from './pages/Admin/Reports';
import Manager from './pages/Admin/Manager';
import Cashier from './pages/Admin/Cashier';
import Categories from './pages/Admin/Categories';
import OrderHistory from './pages/Admin/OrderHistory';
import TableList from './pages/Garson/TableList';
import TableDetail from './pages/Garson/TableDetail';
import Orders from './pages/Garson/Orders';
import MenuView from './pages/Garson/MenuView';
import QRMenu from './pages/QRMenu';

const ProtectedRoute = () => {
  const { user } = useApp();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

function AppContent() {
  return (
    <Routes>
      <Route path="/qr-menu" element={<QRMenu />} />
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<Layout><Outlet /></Layout>}>
          <Route index element={<Dashboard />} />
          <Route path="tables" element={<Tables />} />
          <Route path="menu" element={<Menu />} />
          <Route path="categories" element={<Categories />} />
          <Route path="order-history" element={<OrderHistory />} />
          <Route path="reports" element={<Reports />} />
          <Route path="manager" element={<Manager />} />
        </Route>
        <Route path="/garson" element={<Layout><Outlet /></Layout>}>
          <Route index element={<TableList />} />
          <Route path="table/:id" element={<TableDetail />} />
          <Route path="orders" element={<Orders />} />
          <Route path="menu" element={<MenuView />} />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter basename="/Adisyon-Temel">
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
