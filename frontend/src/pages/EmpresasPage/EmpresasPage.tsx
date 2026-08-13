import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Building2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { MainLayout } from "../../layouts/MainLayout";

import { EmpresaForm, EmpresaTable } from "../../components/Empresa";

import { empresaService } from "../../services/empresaService";

import type { Empresa } from "../../types/empresa";

interface ErroApi {
  mensagem?: string;
  message?: string;
  erro?: string;
}

function obterMensagemErro(error: unknown, mensagemPadrao: string): string {
  if (axios.isAxiosError<ErroApi>(error)) {
    return (
      error.response?.data?.mensagem ||
      error.response?.data?.message ||
      error.response?.data?.erro ||
      mensagemPadrao
    );
  }

  return mensagemPadrao;
}

export function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  const [carregando, setCarregando] = useState(true);

  const [modalAberto, setModalAberto] = useState(false);

  const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(
    null,
  );

  const [pesquisa, setPesquisa] = useState("");

  const [filtroStatus, setFiltroStatus] = useState<
    "TODAS" | "ATIVAS" | "INATIVAS"
  >("TODAS");

  const [alterandoId, setAlterandoId] = useState<number | null>(null);

  const [excluindoId, setExcluindoId] = useState<number | null>(null);

  const carregarEmpresas = useCallback(async () => {
    try {
      setCarregando(true);

      const dados = await empresaService.listar();

      setEmpresas(
        [...dados].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
      );
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);

      toast.error(
        obterMensagemErro(error, "Não foi possível carregar as empresas."),
      );

      setEmpresas([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarEmpresas();
  }, [carregarEmpresas]);

  const empresasFiltradas = useMemo(() => {
    const termo = pesquisa.trim().toLocaleLowerCase("pt-BR");

    return empresas.filter((empresa) => {
      const correspondeStatus =
        filtroStatus === "TODAS" ||
        (filtroStatus === "ATIVAS" && empresa.ativo) ||
        (filtroStatus === "INATIVAS" && !empresa.ativo);

      if (!correspondeStatus) {
        return false;
      }

      if (!termo) {
        return true;
      }

      return [empresa.nome, empresa.cnpj, empresa.telefone, empresa.email].some(
        (valor) => valor?.toLocaleLowerCase("pt-BR").includes(termo),
      );
    });
  }, [empresas, pesquisa, filtroStatus]);

  function abrirCadastro() {
    setEmpresaSelecionada(null);
    setModalAberto(true);
  }

  function abrirEdicao(empresa: Empresa) {
    setEmpresaSelecionada(empresa);
    setModalAberto(true);
  }

  function fecharFormulario() {
    setModalAberto(false);
    setEmpresaSelecionada(null);
  }

  async function alterarStatus(empresa: Empresa) {
    const acao = empresa.ativo ? "desativar" : "ativar";

    const confirmou = window.confirm(
      `Deseja ${acao} a empresa "${empresa.nome}"?`,
    );

    if (!confirmou) {
      return;
    }

    try {
      setAlterandoId(empresa.id);

      await empresaService.alterarStatus(empresa);

      toast.success(
        empresa.ativo
          ? "Empresa desativada com sucesso."
          : "Empresa ativada com sucesso.",
      );

      await carregarEmpresas();
    } catch (error) {
      console.error("Erro ao alterar status:", error);

      toast.error(
        obterMensagemErro(
          error,
          "Não foi possível alterar o status da empresa.",
        ),
      );
    } finally {
      setAlterandoId(null);
    }
  }

  async function excluirEmpresa(empresa: Empresa) {
    const confirmou = window.confirm(
      `Deseja excluir a empresa "${empresa.nome}"?\n\nEmpresas vinculadas a equipamentos ou manutenções não podem ser excluídas. Nesse caso, desative a empresa.`,
    );

    if (!confirmou) {
      return;
    }

    try {
      setExcluindoId(empresa.id);

      await empresaService.excluir(empresa.id);

      toast.success("Empresa excluída com sucesso.");

      await carregarEmpresas();
    } catch (error) {
      console.error("Erro ao excluir empresa:", error);

      toast.error(
        obterMensagemErro(
          error,
          "Não foi possível excluir a empresa. Se ela possuir vínculos, desative-a.",
        ),
      );
    } finally {
      setExcluindoId(null);
    }
  }

  const totalAtivas = empresas.filter((empresa) => empresa.ativo).length;

  const totalInativas = empresas.length - totalAtivas;

  return (
    <MainLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2.5 text-slate-800">
              <Building2 size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Empresas
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Gerencie fornecedores e empresas responsáveis por manutenções.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={abrirCadastro}
          className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Nova empresa
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total</p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {empresas.length}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-700">Ativas</p>

          <p className="mt-1 text-2xl font-bold text-emerald-800">
            {totalAtivas}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-100 p-4">
          <p className="text-sm text-slate-600">Inativas</p>

          <p className="mt-1 text-2xl font-bold text-slate-800">
            {totalInativas}
          </p>
        </div>
      </div>

      <div className="mb-5 grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={pesquisa}
            onChange={(event) => setPesquisa(event.target.value)}
            placeholder="Pesquisar por nome, CNPJ, telefone ou e-mail"
            className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <select
          value={filtroStatus}
          onChange={(event) =>
            setFiltroStatus(
              event.target.value as "TODAS" | "ATIVAS" | "INATIVAS",
            )
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="TODAS">Todas as empresas</option>

          <option value="ATIVAS">Somente ativas</option>

          <option value="INATIVAS">Somente inativas</option>
        </select>
      </div>

      <EmpresaTable
        empresas={empresasFiltradas}
        carregando={carregando}
        alterandoId={alterandoId}
        excluindoId={excluindoId}
        onEditar={abrirEdicao}
        onAlterarStatus={alterarStatus}
        onExcluir={excluirEmpresa}
      />

      <EmpresaForm
        aberto={modalAberto}
        empresa={empresaSelecionada}
        onFechar={fecharFormulario}
        onSucesso={carregarEmpresas}
      />
    </MainLayout>
  );
}
