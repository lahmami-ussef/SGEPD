import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './index.css';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ScreenManagement from './pages/ScreenManagement';
import ClientManagement from './pages/ClientManagement';
import TicketManagement from './pages/TicketManagement';
import LocationManagement from './pages/LocationManagement';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/screens" 
            element={
              <PrivateRoute>
                <ScreenManagement />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/clients" 
            element={
              <PrivateRoute>
                <ClientManagement />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/tickets" 
            element={
              <PrivateRoute>
                <TicketManagement />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/locations" 
            element={
              <PrivateRoute>
                <LocationManagement />
              </PrivateRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
