import { Navigate, Route, Routes } from "react-router-dom";
import { ToastProvider } from "./components/Toast/ToastProvider";

import { DashboardPage } from "./pages/Dashboard/DashboardPage";
import { EquipamentosPage } from "./pages/Equipamentos/EquipamentosPage";

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/equipamentos" element={<EquipamentosPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}
