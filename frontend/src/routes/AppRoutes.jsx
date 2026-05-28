import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import FileImport from '../pages/FileImport';
import Validation from '../pages/Validation';
import Mapping from '../pages/Mapping';
import Migrations from '../pages/Migrations';
import Logs from '../pages/Logs';
import Users from '../pages/Users';

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/import" element={<ProtectedRoute><FileImport /></ProtectedRoute>} />
    <Route path="/validation" element={<ProtectedRoute><Validation /></ProtectedRoute>} />
    <Route path="/mapping" element={<ProtectedRoute><Mapping /></ProtectedRoute>} />
    <Route path="/migrations" element={<ProtectedRoute><Migrations /></ProtectedRoute>} />
    <Route path="/logs" element={<ProtectedRoute adminOnly><Logs /></ProtectedRoute>} />
    <Route path="/users" element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;
