import { useMemo } from "react";
import { useEquipamentos } from "./useEquipamentos";

export function useDashboard() {
  const { equipamentos, carregando } = useEquipamentos();

  const estatisticas = useMemo(() => {
    const total = equipamentos.length;

    const emUso = equipamentos.filter(
      (equipamento) => equipamento.status === "Em uso",
    ).length;

    const manutencao = equipamentos.filter(
      (equipamento) => equipamento.status === "Manutenção",
    ).length;

    const disponivel = equipamentos.filter(
      (equipamento) => equipamento.status === "Disponível",
    ).length;

    return {
      total,
      emUso,
      manutencao,
      disponivel,
    };
  }, [equipamentos]);

  const categorias = useMemo(() => {
    const mapa = new Map<string, number>();

    equipamentos.forEach((equipamento) => {
      const categoria = equipamento.categoria || "Sem categoria";

      mapa.set(categoria, (mapa.get(categoria) ?? 0) + 1);
    });

    return Array.from(mapa.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [equipamentos]);

  const status = useMemo(() => {
    const mapa = new Map<string, number>();

    equipamentos.forEach((equipamento) => {
      const nomeStatus = equipamento.status || "Sem status";

      mapa.set(nomeStatus, (mapa.get(nomeStatus) ?? 0) + 1);
    });

    return Array.from(mapa.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [equipamentos]);

  return {
    equipamentos,
    carregando,
    estatisticas,
    categorias,
    status,
  };
}
