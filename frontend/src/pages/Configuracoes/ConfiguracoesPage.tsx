import { Plus } from "lucide-react";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { ConfirmModal } from "../../components/ConfirmModal";
import { MainLayout } from "../../layouts/MainLayout";

import {
  TipoHardwareModal,
  TipoHardwareTable,
} from "../../components/TipoHardware";

import {
  CampoHardwareModal,
  CampoHardwareTable,
} from "../../components/CampoHardware";

import { useTipoHardware } from "../../hooks/useTipoHardware";
import { useCampoHardware } from "../../hooks/useCampoHardware";

export function ConfiguracoesPage() {
  const {
    tiposHardware,
    carregando,

    modalAberto,
    tipoSelecionado,

    modalExcluirAberto,
    tipoExcluir,
    excluindo,

    abrirModalCadastro,
    abrirModalEdicao,
    fecharModal,
    finalizarCadastroOuEdicao,

    abrirModalExclusao,
    fecharModalExclusao,
    confirmarExclusao,
  } = useTipoHardware();

  const {
    camposHardware,
    carregando: carregandoCampos,

    modalAberto: modalCampoAberto,
    campoSelecionado,

    modalExcluirAberto: modalExcluirCampoAberto,
    campoExcluir,
    excluindo: excluindoCampo,

    abrirModalCadastro: abrirCadastroCampo,
    abrirModalEdicao: abrirEdicaoCampo,
    fecharModal: fecharModalCampo,
    finalizarCadastroOuEdicao: finalizarCampo,

    abrirModalExclusao: abrirExcluirCampo,
    fecharModalExclusao: fecharExcluirCampo,
    confirmarExclusao: confirmarExcluirCampo,
  } = useCampoHardware();

  return (
    <MainLayout>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>

          <p className="mt-1 text-sm text-slate-500">
            Configure os tipos e os campos personalizados dos hardwares.
          </p>
        </header>

        <Card
          title="Tipos de Hardware"
          description="Cadastre e organize os tipos de hardware disponíveis no sistema."
        >
          <div className="mb-6 flex justify-end">
            <Button type="button" onClick={abrirModalCadastro}>
              <Plus size={18} />
              Novo Tipo
            </Button>
          </div>

          <TipoHardwareTable
            tipos={tiposHardware}
            carregando={carregando}
            onEditar={abrirModalEdicao}
            onExcluir={abrirModalExclusao}
          />
        </Card>

        <Card
          title="Campos de Hardware"
          description="Configure os campos que serão exibidos para cada tipo de hardware."
        >
          <div className="mb-6 flex justify-end">
            <Button type="button" onClick={abrirCadastroCampo}>
              <Plus size={18} />
              Novo Campo
            </Button>
          </div>

          <CampoHardwareTable
            campos={camposHardware}
            carregando={carregandoCampos}
            onEditar={abrirEdicaoCampo}
            onExcluir={abrirExcluirCampo}
          />
        </Card>
      </div>

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

      <CampoHardwareModal
        aberto={modalCampoAberto}
        campoHardware={campoSelecionado}
        onClose={fecharModalCampo}
        onSuccess={finalizarCampo}
      />

      <ConfirmModal
        aberto={modalExcluirCampoAberto}
        titulo="Excluir Campo de Hardware"
        mensagem={
          campoExcluir ? `Deseja realmente excluir "${campoExcluir.nome}"?` : ""
        }
        carregando={excluindoCampo}
        onCancel={fecharExcluirCampo}
        onConfirm={confirmarExcluirCampo}
      />
    </MainLayout>
  );
}
