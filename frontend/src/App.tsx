import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import { ColaboradoresPage } from "./pages/colaboradores/ColaboradoresPage";
import { LoginPage } from "./pages/Login";
import { DashboardPage } from "./pages/Dashboard/DashboardPage";
import { EquipamentosPage } from "./pages/Equipamentos/EquipamentosPage";
import { UsuariosPage } from "./pages/usuarios/UsuariosPage";
import { PrivateRoute } from "./routes/PrivateRoute";
import { LocalizacoesPage } from "./pages/Localizacao/LocalizacoesPage";
import { EquipamentoDetalhesPage } from "./pages/EquipamentoDetalhes/EquipamentoDetalhesPage";
import { ConfiguracoesPage } from "./pages/Configuracoes/ConfiguracoesPage";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/equipamentos"
          element={
            <PrivateRoute>
              <EquipamentosPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/equipamentos/:id"
          element={
            <PrivateRoute>
              <EquipamentoDetalhesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/localizacoes"
          element={
            <PrivateRoute>
              <LocalizacoesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/colaboradores"
          element={
            <PrivateRoute>
              <ColaboradoresPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/usuarios"
          element={
            <PrivateRoute>
              <UsuariosPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/configuracoes"
          element={
            <PrivateRoute>
              <ConfiguracoesPage />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={3000}
        theme="light"
      />
    </>
  );
}
