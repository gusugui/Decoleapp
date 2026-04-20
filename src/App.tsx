import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ExamPage from "./pages/ExamPage";
import Upgrade from "./pages/Upgrade";
import ResultsPage from "./pages/ResultsPage";
import AdminPage from "./pages/AdminPage";
import WrongQuestions from "./pages/WrongQuestions";
import TrainingPage from "./pages/TrainingPage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import { useEffect } from "react";
import { seedQuestions } from "./lib/seedQuestions";

function AppLayout({ children, showSidebar = false }: { children: React.ReactNode, showSidebar?: boolean }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {showSidebar ? (
        <div className="flex-grow flex max-w-7xl mx-auto w-full">
          <Sidebar />
          <main className="flex-grow min-w-0">
            {children}
          </main>
        </div>
      ) : (
        <main className="flex-grow">
          {children}
        </main>
      )}
      <Footer />
    </div>
  );
}

function PrivateRoute({ children, showSidebar = true }: { children: React.ReactNode, showSidebar?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (!user) return <Navigate to="/" />;
  
  return (
    <AppLayout showSidebar={showSidebar}>
      {children}
    </AppLayout>
  );
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (!user || user.email !== 'gustavo.sugui@orbitronic.com.br') return <Navigate to="/dashboard" />;
  
  return (
    <AppLayout showSidebar={true}>
      {children}
    </AppLayout>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

function AppContent() {
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user && user.email === 'gustavo.sugui@orbitronic.com.br') {
      seedQuestions().catch(console.error);
    }
  }, [user]);

  return (
    <Routes>
      <Route path="/" element={<AppLayout><Home /></AppLayout>} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/simulado" 
            element={
              <PrivateRoute showSidebar={false}>
                <ExamPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/resultados/:simulationId" 
            element={
              <PrivateRoute showSidebar={false}>
                <ResultsPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/upgrade" 
            element={
              <PrivateRoute>
                <Upgrade />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            } 
          />
          <Route 
            path="/erradas" 
            element={
              <PrivateRoute>
                <WrongQuestions />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/treino" 
            element={
              <PrivateRoute>
                <TrainingPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/historico" 
            element={
              <PrivateRoute>
                <HistoryPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/configuracoes" 
            element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            } 
          />
        </Routes>
  );
}
