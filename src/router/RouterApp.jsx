// Router mejorado
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { AuthPage } from "../pages/AuthPage";
import { Home } from "../pages/Home";
import { Tutorial } from "../pages/Tutorial";
import { Dashboard } from "../pages/Dashboard";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { PublicRoute } from "../components/auth/PublicRoute";

export function RouterApp() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Rutas públicas - solo accesibles sin autenticación */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />

          {/* Rutas protegidas - solo accesibles con autenticación */}
          <Route
            path="/mis-tareas"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Rutas públicas sin restricción */}
          <Route path="/tutorial" element={<Tutorial />} />

          {/* Ruta catch-all para 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
