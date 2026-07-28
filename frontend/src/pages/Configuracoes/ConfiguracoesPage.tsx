import { Plus } from "lucide-react";

import { MainLayout } from "../../layouts";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { ConfirmModal } from "../../components/ConfirmModal";

import {
  TipoHardwareModal,
  TipoHardwareTable,
} from "../../components/TipoHardware";

import { useTipoHardware } from "../../hooks/useTipoHardware";
export function ConfiguracoesPage() {
  const {
    tiposHardware,
    carregando,

    abrirModalCriacao,
    abrirModalEdicao,
    abrirModalExclusao,

    // serão usados na próxima etapa
    modalAberto,
    modalExcluirAberto,
    tipoSelecionado,
    tipoExcluir,
    fecharModal,
    fecharModalExclusao,
    confirmarExclusao,
    finalizarCadastroOuEdicao,
    excluindo,
  } = useTipoHardware();

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configurações</h1>

        <p className="text-sm text-gray-500">
          Gerencie os tipos e campos de hardware do sistema.
        </p>
      </div>

      <Card className="mb-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Tipos de Hardware</h2>

            <p className="text-sm text-gray-500">
              Cadastre os tipos de componentes que podem pertencer a um
              equipamento.
            </p>
          </div>

          <Button onClick={abrirModalCriacao}>
            <Plus size={18} />
            Novo tipo
          </Button>
        </div>

        <TipoHardwareTable
          tipos={tiposHardware}
          carregando={carregando}
          onEditar={abrirModalEdicao}
          onExcluir={abrirModalExclusao}
        />
      </Card>

      <Card>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Campos de Hardware</h2>

            <p className="text-sm text-gray-500">
              Configure os campos personalizados de cada tipo de hardware.
            </p>
          </div>

          <Button disabled>
            <Plus size={18} />
            Novo campo
          </Button>
        </div>

        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="font-medium text-gray-700">
            O módulo de Campos de Hardware será implementado na próxima etapa.
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Primeiro concluiremos o CRUD de Tipos de Hardware.
          </p>
        </div>
      </Card>

      <TipoHardwareModal
        aberto={modalAberto}
        tipoHardware={tipoSelecionado}
        onClose={fecharModal}
        onSuccess={finalizarCadastroOuEdicao}
      />

      <ConfirmModal
        aberto={modalExcluirAberto}
        titulo="Excluir Tipo de Hardware"
        mensagem={
          tipoExcluir ? `Deseja realmente excluir "${tipoExcluir.nome}"?` : ""
        }
        carregando={excluindo}
        onCancel={fecharModalExclusao}
        onConfirm={confirmarExclusao}
      />
    </MainLayout>
  );
}
