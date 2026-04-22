import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardEnseignant from './pages/DashboardEnseignant';
import DashboardDelegue from './pages/DashboardDelegue';
import DashboardSurveillant from './pages/DashboardSurveillant';
import DashboardComptable from './pages/DashboardComptable';
import EmploiTempsPage from './pages/EmploiTempsPage';
import GestionEmploiTemps from './pages/GestionEmploiTemps';
import GestionClasses from './pages/GestionClasses';
import GestionEnseignants from './pages/GestionEnseignants';
import GenerationQR from './pages/GenerationQR';
import PointageQR from './pages/PointageQR';
import CahierTextePage from './pages/CahierTextePage';
import NouveauCahier from './pages/NouveauCahier';
import VacationPage from './pages/VacationPage';

function PrivateRoute({ children, roles }) {
  const { utilisateur } = useAuth();
  if (!utilisateur) return <Navigate to="/login" />;
  if (roles && !roles.includes(utilisateur.role)) return <Navigate to="/login" />;
  return children;
}

function AppRoutes() {
  const { utilisateur } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard/admin" element={
        <PrivateRoute roles={['admin']}><DashboardAdmin /></PrivateRoute>
      } />
      <Route path="/dashboard/enseignant" element={
        <PrivateRoute roles={['enseignant']}><DashboardEnseignant /></PrivateRoute>
      } />
      <Route path="/dashboard/delegue" element={
        <PrivateRoute roles={['delegue']}><DashboardDelegue /></PrivateRoute>
      } />
      <Route path="/dashboard/surveillant" element={
        <PrivateRoute roles={['surveillant']}><DashboardSurveillant /></PrivateRoute>
      } />
      <Route path="/dashboard/comptable" element={
        <PrivateRoute roles={['comptable']}><DashboardComptable /></PrivateRoute>
      } />
      <Route path="/emploi-temps" element={
        <PrivateRoute roles={['admin','enseignant','delegue','etudiant','surveillant','comptable']}>
          <EmploiTempsPage />
        </PrivateRoute>
      } />
      <Route path="/gestion-emploi-temps" element={
        <PrivateRoute roles={['admin']}><GestionEmploiTemps /></PrivateRoute>
      } />
      <Route path="/gestion-classes" element={
        <PrivateRoute roles={['admin']}><GestionClasses /></PrivateRoute>
      } />
      <Route path="/gestion-enseignants" element={
        <PrivateRoute roles={['admin']}><GestionEnseignants /></PrivateRoute>
      } />
      <Route path="/generation-qr" element={
        <PrivateRoute roles={['admin']}><GenerationQR /></PrivateRoute>
      } />
      <Route path="/pointage-qr" element={
        <PrivateRoute roles={['enseignant']}><PointageQR /></PrivateRoute>
      } />
      <Route path="/cahier-texte" element={
        <PrivateRoute roles={['admin','delegue','enseignant','surveillant']}>
          <CahierTextePage />
        </PrivateRoute>
      } />
      <Route path="/nouveau-cahier" element={
        <PrivateRoute roles={['delegue']}><NouveauCahier /></PrivateRoute>
      } />
      <Route path="/vacations" element={
        <PrivateRoute roles={['admin','enseignant','surveillant','comptable']}>
          <VacationPage />
        </PrivateRoute>
      } />
      <Route path="/" element={
        utilisateur ? <Navigate to={`/dashboard/${utilisateur.role}`} /> : <Navigate to="/login" />
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;