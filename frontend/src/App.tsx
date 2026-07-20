import { Navigate, Route, Routes } from "react-router-dom";

import { LoginPage } from "./pages/Login";
import { DashboardPage } from "./pages/Dashboard/DashboardPage";
import { EquipamentosPage } from "./pages/Equipamentos/EquipamentosPage";
import { PrivateRoute } from "./routes/PrivateRoute";
import { UsuariosPage } from "./pages/usuarios/UsuariosPage";

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
            <PaginaEmConstrucao titulo="Localizações" />
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
  );
}
