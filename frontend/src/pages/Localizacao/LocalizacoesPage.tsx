import { Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { MainLayout } from "../../layouts/MainLayout";
import { Modal } from "../../components/Modal";

import { LocalizacaoForm } from "../../components/LocalizacaoForm";
import { LocalizacaoTable } from "../../components/LocalizacaoTable";
import { useLocalizacoes, type Localizacao } from "../../hooks/useLocalizacoes";

export function LocalizacoesPage() {
  const {
    localizacoesFiltradas,

    pesquisa,
    setPesquisa,

    modalAberto,
    modalExcluirAberto,

    localizacaoSelecionada,
    localizacaoExcluir,

    abrirModalCriacao,
    abrirModalEdicao,
    fecharModal,

    abrirModalExclusao,
    fecharModalExclusao,

    setLocalizacoes,
  } = useLocalizacoes();

  async function salvarLocalizacao(
    dados: Omit<Localizacao, "id">,
  ): Promise<void> {
    if (localizacaoSelecionada) {
      setLocalizacoes((localizacoesAtuais) =>
        localizacoesAtuais.map((localizacao) =>
          localizacao.id === localizacaoSelecionada.id
            ? {
                ...localizacao,
                ...dados,
              }
            : localizacao,
        ),
      );

      toast.success("Localização atualizada com sucesso.");
      fecharModal();
      return;
    }

    const novaLocalizacao: Localizacao = {
      id: Date.now(),
      ...dados,
    };

    setLocalizacoes((localizacoesAtuais) => [
      ...localizacoesAtuais,
      novaLocalizacao,
    ]);

    toast.success("Localização cadastrada com sucesso.");
    fecharModal();
  }

  function excluirLocalizacao() {
    if (!localizacaoExcluir) {
      return;
    }

    setLocalizacoes((localizacoesAtuais) =>
      localizacoesAtuais.filter(
        (localizacao) => localizacao.id !== localizacaoExcluir.id,
      ),
    );

    toast.success("Localização excluída com sucesso.");
    fecharModalExclusao();
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Localizações</h1>

            <p className="mt-1 text-slate-500">
              Gerencie os locais onde os equipamentos estão instalados.
            </p>
          </div>

          <button
            type="button"
            onClick={abrirModalCriacao}
            className="
            inline-flex items-center justify-center gap-2
            rounded-lg bg-slate-900 px-4 py-2.5
            font-medium text-white transition
            hover:bg-slate-700
          "
          >
            <Plus size={18} />
            Nova localização
          </button>
        </div>

        <div className="relative max-w-md">
          <Search
            size={18}
            className="
            pointer-events-none absolute left-3 top-1/2
            -translate-y-1/2 text-slate-400
          "
          />

          <input
            type="search"
            value={pesquisa}
            onChange={(event) => setPesquisa(event.target.value)}
            placeholder="Pesquisar localização..."
            className="
            w-full rounded-lg border border-slate-300
            bg-white py-2.5 pl-10 pr-4
            text-sm text-slate-900 outline-none transition
            placeholder:text-slate-400
            focus:border-blue-500 focus:ring-2 focus:ring-blue-100
          "
          />
        </div>

        <LocalizacaoTable
          localizacoes={localizacoesFiltradas}
          onEditar={abrirModalEdicao}
          onExcluir={abrirModalExclusao}
        />

        <Modal
          aberto={modalAberto}
          titulo={
            localizacaoSelecionada ? "Editar localização" : "Nova localização"
          }
          onClose={fecharModal}
          tamanho="sm"
        >
          <LocalizacaoForm
            localizacao={localizacaoSelecionada}
            onCancelar={fecharModal}
            onSalvar={salvarLocalizacao}
          />
        </Modal>

        <Modal
          aberto={modalExcluirAberto}
          titulo="Excluir localização"
          onClose={fecharModalExclusao}
          tamanho="sm"
        >
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <div
                className="
                mb-4 flex h-14 w-14 items-center justify-center
                rounded-full bg-red-100 text-red-600
              "
              >
                <Trash2 size={26} />
              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                Confirmar exclusão
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Tem certeza de que deseja excluir a localização{" "}
                <strong className="font-semibold text-slate-700">
                  {localizacaoExcluir?.nome}
                </strong>
                ?
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Essa ação não poderá ser desfeita.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={fecharModalExclusao}
                className="
                rounded-lg border border-slate-300
                px-4 py-2.5 font-medium text-slate-700
                transition hover:bg-slate-100
              "
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={excluirLocalizacao}
                className="
                inline-flex items-center justify-center gap-2
                rounded-lg bg-red-600 px-4 py-2.5
                font-medium text-white transition
                hover:bg-red-700
              "
              >
                <Trash2 size={17} />
                Excluir localização
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}
