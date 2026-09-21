import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import { LoginPage } from "./pages/Login";
import { DashboardPage } from "./pages/Dashboard/DashboardPage";
import { EquipamentosPage } from "./pages/Equipamentos/EquipamentosPage";
import { EquipamentoDetalhesPage } from "./pages/EquipamentoDetalhes/EquipamentoDetalhesPage";
import { UsuariosPage } from "./pages/usuarios/UsuariosPage";
import { LocalizacoesPage } from "./pages/Localizacao/LocalizacoesPage";
import { ColaboradoresPage } from "./pages/colaboradores/ColaboradoresPage";
import { ColaboradorDetalhesPage } from "./pages/colaboradores/ColaboradorDetalhesPage";
import { ConfiguracoesPage } from "./pages/Configuracoes/ConfiguracoesPage";
import { ManutencoesPage } from "./pages/Manutencoes/ManutencoesPage";
import { MovimentacoesPage } from "./pages/Movimentacoes/MovimentacoesPage";
import { EmpresasPage } from "./pages/EmpresasPage/EmpresasPage";

import { PrivateRoute } from "./routes/PrivateRoute";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <PrivateRoute permissoes={["dashboard.visualizar"]}>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/equipamentos"
          element={
            <PrivateRoute permissoes={["equipamentos.visualizar"]}>
              <EquipamentosPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/equipamentos/:id"
          element={
            <PrivateRoute
              permissoes={["equipamentos.visualizar", "hardware.visualizar"]}
            >
              <EquipamentoDetalhesPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/localizacoes"
          element={
            <PrivateRoute permissoes={["localizacoes.visualizar"]}>
              <LocalizacoesPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/colaboradores"
          element={
            <PrivateRoute permissoes={["colaboradores.visualizar"]}>
              <ColaboradoresPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/colaboradores/:id"
          element={
            <PrivateRoute
              permissoes={[
                "colaboradores.visualizar",
                "equipamentos.visualizar",
              ]}
            >
              <ColaboradorDetalhesPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/usuarios"
          element={
            <PrivateRoute somenteAdmin>
              <UsuariosPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/manutencoes"
          element={
            <PrivateRoute permissoes={["manutencoes.visualizar"]}>
              <ManutencoesPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/configuracoes"
          element={
            <PrivateRoute
              permissoes={["configuracoes.visualizar", "hardware.visualizar"]}
            >
              <ConfiguracoesPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/movimentacoes"
          element={
            <PrivateRoute permissoes={["movimentacoes.visualizar"]}>
              <MovimentacoesPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/empresas"
          element={
            <PrivateRoute permissoes={["empresas.visualizar"]}>
              <EmpresasPage />
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
