import { useEffect, useState } from "react";
import { Plus, Settings } from "lucide-react";
import { toast } from "sonner";

import {
  tipoHardwareService,
  type TipoHardware,
} from "../../services/tipoHardwareService";

import { TipoHardwareTable } from "../../components/TipoHardware";
import { MainLayout } from "../../layouts";
export function ConfiguracoesPage() {
  const [tiposHardware, setTiposHardware] = useState<TipoHardware[]>([]);
  const [carregandoTipos, setCarregandoTipos] = useState(true);

  async function carregarTiposHardware() {
    try {
      setCarregandoTipos(true);

      const dados = await tipoHardwareService.listar();

      setTiposHardware(Array.isArray(dados) ? dados : []);
    } catch (erro) {
      console.error("Erro ao carregar tipos de hardware:", erro);

      toast.error("Não foi possível carregar os tipos de hardware.");
    } finally {
      setCarregandoTipos(false);
    }
  }

  function abrirCadastroTipoHardware() {
    console.log("Abrir cadastro de tipo de hardware");
  }

  function editarTipoHardware(tipo: TipoHardware) {
    console.log("Editar tipo de hardware:", tipo);
  }

  function excluirTipoHardware(tipo: TipoHardware) {
    console.log("Excluir tipo de hardware:", tipo);
  }

  useEffect(() => {
    carregarTiposHardware();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-8">
        <header>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
              <Settings size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Configurações
              </h1>

              <p className="text-sm text-slate-500">
                Gerencie os tipos e campos de hardware do sistema.
              </p>
            </div>
          </div>
        </header>

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Tipos de Hardware
              </h2>

              <p className="text-sm text-slate-500">
                Cadastre os tipos de componentes que podem pertencer a um
                equipamento.
              </p>
            </div>

            <button
              type="button"
              onClick={abrirCadastroTipoHardware}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={18} />
              Novo tipo
            </button>
          </div>

          <TipoHardwareTable
            tipos={tiposHardware}
            carregando={carregandoTipos}
            onEditar={editarTipoHardware}
            onExcluir={excluirTipoHardware}
          />
        </section>

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Campos de Hardware
              </h2>

              <p className="text-sm text-slate-500">
                Configure os campos personalizados de cada tipo de hardware.
              </p>
            </div>

            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-slate-300 px-4 py-2 text-sm font-semibold text-slate-500"
            >
              <Plus size={18} />
              Novo campo
            </button>
          </div>

          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-medium text-slate-700">
              O módulo de campos de hardware será implementado na próxima etapa.
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Primeiro concluiremos o CRUD de tipos de hardware.
            </p>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
