import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

// Layouts
import MainLayout from '../views/shared/MainLayout';
import AdminLayout from '../views/shared/AdminLayout';

// Auth
import Login from '../views/auth/Login';
import Register from '../views/auth/Register';

// Public/Customer Pages
import ProductList from '../views/products/ProductList';
import ProductDetail from '../views/products/ProductDetail';
import CartPage from '../views/cart/CartPage';
import CheckoutPage from '../views/cart/CheckoutPage';
import OrderHistory from '../views/orders/OrderHistory';
import QRScannerPage from '../views/qr/QRScannerPage';
import WishlistPage from '../views/products/WishlistPage';

// Admin Pages
import Dashboard from '../views/admin/Dashboard';
import ProductManagement from '../views/admin/ProductManagement';
import OrderManagement from '../views/admin/OrderManagement';
import QRGenerator from '../views/admin/QRGenerator';

// Protection Wrapper
const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { profile, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!profile || profile.role !== 'admin') return <Navigate to="/" />;
  return children;
};

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!session) return <Navigate to="/login" />;
  return children;
};

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/scan" element={<QRScannerPage />} />
          
          <Route path="/checkout" element={
            <PrivateRoute><CheckoutPage /></PrivateRoute>
          } />
          <Route path="/orders" element={
            <PrivateRoute><OrderHistory /></PrivateRoute>
          } />
        </Route>

        <Route path="/admin" element={
          <AdminRoute><AdminLayout /></AdminRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="qr" element={<QRGenerator />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
