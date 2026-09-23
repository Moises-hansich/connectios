import { FilterX, Plus } from "lucide-react";

import { MainLayout } from "../../layouts/MainLayout";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { SearchInput } from "../../components/SearchInput";
import { Select } from "../../components/Select";
import { SkeletonTable } from "../../components/Skeleton";
import { Modal } from "../../components/Modal";
import { ConfirmModal } from "../../components/ConfirmModal";
import { ColaboradorForm } from "../../components/ColaboradorForm";
import { ColaboradorTable } from "../../components/ColaboradorTable";

import { useAuth } from "../../hooks/useAuth";
import { useColaboradores } from "../../hooks/useColaboradores";

interface PermissoesColaboradores {
  podeCriar: boolean;
  podeEditar: boolean;
  podeExcluir: boolean;
}

export function ColaboradoresPage() {
  const { carregando, carregandoPermissoes, temTodasPermissoes } = useAuth();

  if (carregando || carregandoPermissoes) {
    return (
      <MainLayout>
        <Card>
          <SkeletonTable />
        </Card>
      </MainLayout>
    );
  }

  if (!temTodasPermissoes("colaboradores.visualizar")) {
    return (
      <MainLayout>
        <Card className="p-8 text-center">
          <h1 className="text-xl font-semibold text-slate-900">
            Acesso não permitido
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Você não possui permissão para visualizar colaboradores.
          </p>
        </Card>
      </MainLayout>
    );
  }

  const podeCriar = temTodasPermissoes(
    "colaboradores.visualizar",
    "colaboradores.criar",
  );

  const podeEditar = temTodasPermissoes(
    "colaboradores.visualizar",
    "colaboradores.editar",
  );

  const podeExcluir = temTodasPermissoes(
    "colaboradores.visualizar",
    "colaboradores.excluir",
  );

  // Ao mudar as permissões, descarta formulários e seleções anteriores.
  return (
    <ConteudoColaboradores
      key={`${podeCriar}-${podeEditar}-${podeExcluir}`}
      podeCriar={podeCriar}
      podeEditar={podeEditar}
      podeExcluir={podeExcluir}
    />
  );
}

function ConteudoColaboradores({
  podeCriar,
  podeEditar,
  podeExcluir,
}: PermissoesColaboradores) {
  const {
    colaboradoresFiltrados,

    pesquisa,
    setPesquisa,

    localizacaoSelecionada,
    setLocalizacaoSelecionada,

    situacaoSelecionada,
    setSituacaoSelecionada,

    localizacoes,

    filtrosAtivos,
    limparFiltros,

    carregando,
    excluindo,

    modalAberto,
    modalExcluirAberto,

    colaboradorSelecionado,
    colaboradorExcluir,

    abrirModalCriacao,
    abrirModalEdicao,
    fecharModal,

    abrirModalExclusao,
    fecharModalExclusao,
    confirmarExclusao,

    finalizarCadastroOuEdicao,
  } = useColaboradores();

  const podeUsarFormulario = colaboradorSelecionado ? podeEditar : podeCriar;

  return (
    <MainLayout>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Colaboradores</h1>

          <p className="text-sm text-gray-500">
            {carregando
              ? "Carregando colaboradores..."
              : `Total encontrado: ${colaboradoresFiltrados.length}`}
          </p>
        </div>

        {podeCriar && (
          <Button
            type="button"
            onClick={() => {
              if (!podeCriar) return;
              abrirModalCriacao();
            }}
          >
            <Plus size={18} />
            Adicionar colaborador
          </Button>
        )}
      </div>

      <Card className="mb-6">
        <div className="grid items-end gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SearchInput
            value={pesquisa}
            onChange={setPesquisa}
            placeholder="Pesquisar colaborador..."
          />

          <Select
            label="Localização"
            value={localizacaoSelecionada}
            onChange={(event) => setLocalizacaoSelecionada(event.target.value)}
          >
            <option value="">Todas</option>

            {localizacoes.map((localizacao) => (
              <option key={localizacao} value={localizacao}>
                {localizacao}
              </option>
            ))}
          </Select>

          <Select
            label="Situação"
            value={situacaoSelecionada}
            onChange={(event) => setSituacaoSelecionada(event.target.value)}
          >
            <option value="">Todas</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </Select>

          <div className="flex items-end">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={!filtrosAtivos}
              onClick={limparFiltros}
            >
              <FilterX size={18} />
              Limpar filtros
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        {carregando ? (
          <SkeletonTable />
        ) : (
          <ColaboradorTable
            colaboradores={colaboradoresFiltrados}
            onEdit={(colaborador) => {
              if (!podeEditar) return;
              abrirModalEdicao(colaborador);
            }}
            onDelete={(colaborador) => {
              if (!podeExcluir) return;
              abrirModalExclusao(colaborador);
            }}
          />
        )}
      </Card>

      {modalAberto && podeUsarFormulario && (
        <Modal
          aberto
          titulo={
            colaboradorSelecionado ? "Editar colaborador" : "Novo colaborador"
          }
          onClose={fecharModal}
        >
          <ColaboradorForm
            modo={colaboradorSelecionado ? "editar" : "criar"}
            {...(colaboradorSelecionado
              ? { colaborador: colaboradorSelecionado }
              : {})}
            onCancel={fecharModal}
            onSuccess={finalizarCadastroOuEdicao}
          />
        </Modal>
      )}

      {modalExcluirAberto && podeExcluir && colaboradorExcluir && (
        <ConfirmModal
          aberto
          titulo="Excluir colaborador"
          mensagem={`Deseja realmente excluir "${colaboradorExcluir.nome}"?`}
          carregando={excluindo}
          onCancel={fecharModalExclusao}
          onConfirm={async () => {
            if (!podeExcluir || excluindo) return;
            await confirmarExclusao();
          }}
        />
      )}
    </MainLayout>
  );
}
