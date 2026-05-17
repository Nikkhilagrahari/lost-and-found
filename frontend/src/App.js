import { useEffect, useState } from "react";
import { useLocation, BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "@/App.css";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Browse from "./pages/Browse";
import ReportItem from "./pages/ReportItem";
import ItemDetail from "./pages/ItemDetail";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import { Toaster } from "sonner";

function AppRouter() {
  const location = useLocation();
  // Detect session_id during render to handle Emergent OAuth callback before any other routing
  if (location.hash?.includes("session_id=")) return <AuthCallback />;

  return (
    <Routes>
      <Route path="/" element={<Layout><Landing /></Layout>} />
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/browse" element={<Layout><Browse /></Layout>} />
      <Route path="/items/:id" element={<Layout><ItemDetail /></Layout>} />
      <Route path="/report/:type" element={<ProtectedRoute><Layout><ReportItem /></Layout></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Layout><Messages /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
