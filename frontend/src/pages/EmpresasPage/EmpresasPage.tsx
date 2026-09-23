import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Building2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { MainLayout } from "../../layouts/MainLayout";
import { EmpresaForm, EmpresaTable } from "../../components/Empresa";
import { useAuth } from "../../hooks/useAuth";
import { empresaService } from "../../services/empresaService";

import type { Empresa } from "../../types/empresa";

interface ErroApi {
  mensagem?: string;
  message?: string;
  erro?: string;
}

interface EmpresasConteudoProps {
  podeCriar: boolean;
  podeEditar: boolean;
  podeExcluir: boolean;
}

type FiltroStatus = "TODAS" | "ATIVAS" | "INATIVAS";

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
  const {
    autenticado,
    carregando,
    carregandoPermissoes,
    erroPermissoes,
    temPermissao,
    temTodasPermissoes,
  } = useAuth();

  if (carregando || carregandoPermissoes) {
    return (
      <MainLayout>
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">Verificando permissões...</p>
        </div>
      </MainLayout>
    );
  }

  if (erroPermissoes) {
    return (
      <MainLayout>
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-700"
        >
          Não foi possível carregar suas permissões. Atualize a página para
          tentar novamente.
        </div>
      </MainLayout>
    );
  }

  if (!autenticado || !temPermissao("empresas.visualizar")) {
    return (
      <MainLayout>
        <div
          role="alert"
          className="rounded-xl border border-slate-200 bg-white p-8 text-center"
        >
          <h1 className="text-xl font-semibold text-slate-900">
            Acesso não permitido
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Você não possui permissão para visualizar empresas.
          </p>
        </div>
      </MainLayout>
    );
  }

  const podeCriar = temTodasPermissoes("empresas.visualizar", "empresas.criar");

  const podeEditar = temTodasPermissoes(
    "empresas.visualizar",
    "empresas.editar",
  );

  const podeExcluir = temTodasPermissoes(
    "empresas.visualizar",
    "empresas.excluir",
  );

  return (
    <EmpresasConteudo
      key={`${podeCriar}-${podeEditar}-${podeExcluir}`}
      podeCriar={podeCriar}
      podeEditar={podeEditar}
      podeExcluir={podeExcluir}
    />
  );
}

function EmpresasConteudo({
  podeCriar,
  podeEditar,
  podeExcluir,
}: EmpresasConteudoProps) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(
    null,
  );

  const [pesquisa, setPesquisa] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("TODAS");

  const [alterandoId, setAlterandoId] = useState<number | null>(null);
  const [excluindoId, setExcluindoId] = useState<number | null>(null);

  const montadoRef = useRef(false);
  const consultaRef = useRef(0);
  const operacaoRef = useRef(false);

  const carregarEmpresas = useCallback(async () => {
    if (!montadoRef.current) return;

    const consultaAtual = ++consultaRef.current;

    setCarregando(true);
    setErroCarregamento("");

    try {
      const dados = await empresaService.listar();

      if (!montadoRef.current || consultaAtual !== consultaRef.current) {
        return;
      }

      setEmpresas(
        [...dados].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
      );
    } catch (error) {
      if (!montadoRef.current || consultaAtual !== consultaRef.current) {
        return;
      }

      setEmpresas([]);
      setErroCarregamento(
        obterMensagemErro(error, "Não foi possível carregar as empresas."),
      );
    } finally {
      if (montadoRef.current && consultaAtual === consultaRef.current) {
        setCarregando(false);
      }
    }
  }, []);

  useEffect(() => {
    montadoRef.current = true;
    void carregarEmpresas();

    return () => {
      montadoRef.current = false;
      consultaRef.current += 1;
    };
  }, [carregarEmpresas]);

  const empresasFiltradas = useMemo(() => {
    const termo = pesquisa.trim().toLocaleLowerCase("pt-BR");

    return empresas.filter((empresa) => {
      const correspondeStatus =
        filtroStatus === "TODAS" ||
        (filtroStatus === "ATIVAS" && empresa.ativo) ||
        (filtroStatus === "INATIVAS" && !empresa.ativo);

      if (!correspondeStatus) return false;
      if (!termo) return true;

      return [empresa.nome, empresa.cnpj, empresa.telefone, empresa.email].some(
        (valor) => valor?.toLocaleLowerCase("pt-BR").includes(termo),
      );
    });
  }, [empresas, pesquisa, filtroStatus]);

  function abrirCadastro() {
    if (!podeCriar || operacaoRef.current) return;

    setEmpresaSelecionada(null);
    setModalAberto(true);
  }

  function abrirEdicao(empresa: Empresa) {
    if (!podeEditar || operacaoRef.current) return;

    setEmpresaSelecionada(empresa);
    setModalAberto(true);
  }

  function fecharFormulario() {
    setModalAberto(false);
    setEmpresaSelecionada(null);
  }

  async function concluirFormulario() {
    if (!montadoRef.current) return;

    fecharFormulario();
    await carregarEmpresas();
  }

  async function alterarStatus(empresa: Empresa) {
    if (!podeEditar || operacaoRef.current) return;

    const acao = empresa.ativo ? "desativar" : "ativar";

    if (!window.confirm(`Deseja ${acao} a empresa "${empresa.nome}"?`)) {
      return;
    }

    operacaoRef.current = true;
    setAlterandoId(empresa.id);

    try {
      await empresaService.alterarStatus(empresa);

      if (!montadoRef.current) return;

      toast.success(
        empresa.ativo
          ? "Empresa desativada com sucesso."
          : "Empresa ativada com sucesso.",
      );

      await carregarEmpresas();
    } catch (error) {
      if (!montadoRef.current) return;

      toast.error(
        obterMensagemErro(
          error,
          "Não foi possível alterar o status da empresa.",
        ),
      );
    } finally {
      operacaoRef.current = false;

      if (montadoRef.current) {
        setAlterandoId(null);
      }
    }
  }

  async function excluirEmpresa(empresa: Empresa) {
    if (!podeExcluir || operacaoRef.current) return;

    const confirmou = window.confirm(
      `Deseja excluir a empresa "${empresa.nome}"?\n\nEmpresas vinculadas a equipamentos ou manutenções não podem ser excluídas. Nesse caso, desative a empresa.`,
    );

    if (!confirmou) return;

    operacaoRef.current = true;
    setExcluindoId(empresa.id);

    try {
      await empresaService.excluir(empresa.id);

      if (!montadoRef.current) return;

      toast.success("Empresa excluída com sucesso.");
      await carregarEmpresas();
    } catch (error) {
      if (!montadoRef.current) return;

      toast.error(
        obterMensagemErro(
          error,
          "Não foi possível excluir a empresa. Se ela possuir vínculos, desative-a.",
        ),
      );
    } finally {
      operacaoRef.current = false;

      if (montadoRef.current) {
        setExcluindoId(null);
      }
    }
  }

  const totalAtivas = empresas.filter((empresa) => empresa.ativo).length;
  const totalInativas = empresas.length - totalAtivas;

  const podeUsarFormulario = empresaSelecionada ? podeEditar : podeCriar;
  const operacaoEmAndamento = alterandoId !== null || excluindoId !== null;

  return (
    <MainLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

        {podeCriar && (
          <button
            type="button"
            onClick={abrirCadastro}
            disabled={operacaoEmAndamento}
            className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={18} />
            Nova empresa
          </button>
        )}
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {carregando || erroCarregamento ? "—" : empresas.length}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-700">Ativas</p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">
            {carregando || erroCarregamento ? "—" : totalAtivas}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-100 p-4">
          <p className="text-sm text-slate-600">Inativas</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">
            {carregando || erroCarregamento ? "—" : totalInativas}
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
            aria-label="Pesquisar empresas"
            value={pesquisa}
            onChange={(event) => setPesquisa(event.target.value)}
            placeholder="Pesquisar por nome, CNPJ, telefone ou e-mail"
            className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <select
          aria-label="Filtrar empresas por situação"
          value={filtroStatus}
          onChange={(event) =>
            setFiltroStatus(event.target.value as FiltroStatus)
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="TODAS">Todas as empresas</option>
          <option value="ATIVAS">Somente ativas</option>
          <option value="INATIVAS">Somente inativas</option>
        </select>
      </div>

      {erroCarregamento ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-6 text-center"
        >
          <p className="text-sm text-red-700">{erroCarregamento}</p>

          <button
            type="button"
            onClick={() => void carregarEmpresas()}
            className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <EmpresaTable
          empresas={empresasFiltradas}
          carregando={carregando}
          alterandoId={alterandoId}
          excluindoId={excluindoId}
          onEditar={podeEditar ? abrirEdicao : undefined}
          onAlterarStatus={podeEditar ? alterarStatus : undefined}
          onExcluir={podeExcluir ? excluirEmpresa : undefined}
        />
      )}

      {modalAberto && podeUsarFormulario && (
        <EmpresaForm
          aberto={modalAberto}
          empresa={empresaSelecionada}
          onFechar={fecharFormulario}
          onSucesso={concluirFormulario}
        />
      )}
    </MainLayout>
  );
}
