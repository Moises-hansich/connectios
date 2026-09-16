import { api } from "./api";
export interface ItemPeca {
  id: number; nome: string; patrimonio: string | null; status: string;
  instaladoEmId: number | null; localReservaId: number | null;
  localizacaoId: number | null; responsavelId: number | null;
  manutencoes: {id: number; tipo: string | null; tecnicoResponsavelId: number | null}[];
}
export interface OpcoesPecas {
  computadores: ItemPeca[]; pecas: ItemPeca[];
  tecnicos: {id: number; nome: string}[];
  localizacoes: {id: number; nome: string}[];
}
export interface OperacaoPeca {
  situacaoRetirada?: "DISPONIVEL" | "DEFEITO";
  acao: "INSTALAR" | "RETIRAR" | "TROCAR";
  computadorId: number; pecaId?: number; retiradaId?: number;
  descricao: string; descricaoRetirada?: string; destinoRetirada?: string;
  localReservaId?: number; tecnicoResponsavelId?: number;
}
export const pecasService = {
  async opcoes(): Promise<OpcoesPecas> { return (await api.get("/manutencoes/pecas/opcoes")).data; },
  async registrar(dados: OperacaoPeca): Promise<{manutencaoId: number; mensagem: string}> {
    return (await api.post("/manutencoes/pecas", dados)).data;
  },
};
