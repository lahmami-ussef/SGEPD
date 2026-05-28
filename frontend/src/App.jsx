import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ToastProvider from './components/Toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './index.css';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ScreenManagement from './pages/ScreenManagement';
import ClientManagement from './pages/ClientManagement';
import TicketManagement from './pages/TicketManagement';
import LocationManagement from './pages/LocationManagement';
import Settings from './pages/Settings';
import AssignmentManagement from './pages/AssignmentManagement'; // ✅ ajouté

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
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

            {/* ✅ nouvelle route ajoutée */}
            <Route 
              path="/assignments" 
              element={
                <PrivateRoute>
                  <AssignmentManagement />
                </PrivateRoute>
              } 
            />

            <Route 
              path="/settings" 
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              } 
            />

            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;