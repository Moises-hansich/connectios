import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { ColaboradoresPage } from "./pages/Colaboradores/ColaboradoresPage";
import { LoginPage } from "./pages/Login";
import { DashboardPage } from "./pages/Dashboard/DashboardPage";
import { EquipamentosPage } from "./pages/Equipamentos/EquipamentosPage";
import { UsuariosPage } from "./pages/usuarios/UsuariosPage";
import { PrivateRoute } from "./routes/PrivateRoute";
import { LocalizacoesPage } from "./pages/localizacao/LocalizacoesPage";
function PaginaEmConstrucao({ titulo }: { titulo: string }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">{titulo}</h1>

      <p className="mt-2 text-slate-500">
        Esta página ainda está em desenvolvimento.
      </p>
    </div>
  );
}

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
              <PaginaEmConstrucao titulo="Configurações" />
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
