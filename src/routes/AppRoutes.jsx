import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';

// Pages (to be implemented)
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import Dashboard from '../pages/Dashboard';
import Products from '../pages/Products';
import Categories from '../pages/Categories';
import Inventory from '../pages/Inventory';

import Suppliers from '../pages/Suppliers';
import ReorderPage from '../pages/ReorderPage';
import Billing from '../pages/Billing';
import LowStock from '../pages/LowStock';
import Expiry from '../pages/Expiry';
import Settings from '../pages/Settings';
import ManageStaff from '../pages/Admin/ManageStaff';
import StaffLogin from '../pages/Auth/StaffLogin';
import NotificationPage from '../pages/NotificationPage';
import ApplicationMessages from '../pages/ApplicationMessages';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/staff-login" element={<StaffLogin />} />
      <Route path="/register" element={<Register />} />


      {/* Protected Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/products" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Products />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/categories" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Categories />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/inventory" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Inventory />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/suppliers" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Suppliers />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reorders" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ReorderPage />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/billing" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Billing />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/low-stock" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <LowStock />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/expiry" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Expiry />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <NotificationPage />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/messages" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ApplicationMessages />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/manage-staff" 
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <DashboardLayout>
              <ManageStaff />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />




      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
