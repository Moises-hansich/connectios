import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, History, Plus, RefreshCw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "../../hooks/useAuth";
import { obterGrupo } from "../../utils/grupoEquipamento";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { ConfirmModal } from "../../components/ConfirmModal";
import { EquipmentInfoCard } from "../../components/EquipmentInfo/EquipmentInfoCard";
import { FotoEquipamentoGallery } from "../../components/FotoEquipamento/FotoEquipamentoGallery";
import { HardwareForm } from "../../components/Hardware/HardwareForm";
import { HardwareList } from "../../components/Hardware/HardwareList";
import { HardwareModal } from "../../components/Hardware/HardwareModal";
import { PecasComputador } from "../../components/Pecas/PecasComputador";
import { Skeleton } from "../../components/Skeleton";
import { MainLayout } from "../../layouts/MainLayout";

import { equipamentoService } from "../../services/equipamentoService";
import { hardwareService } from "../../services/hardwareService";
import { movimentacaoService } from "../../services/movimentacaoService";

import type { Equipamento, Hardware } from "../../types/equipamento";
import type { Movimentacao, TipoMovimentacao } from "../../types/movimentacao";

interface AlteracaoHistorico {
  origem: string;
  destino: string;
}

const tiposMovimentacao: Record<
  TipoMovimentacao,
  { texto: string; classe: string }
> = {
  ENTREGA: {
    texto: "Entrega",
    classe: "bg-blue-100 text-blue-700",
  },
  TROCA: {
    texto: "Troca",
    classe: "bg-violet-100 text-violet-700",
  },
  DEVOLUCAO: {
    texto: "Devolução",
    classe: "bg-cyan-100 text-cyan-700",
  },
  MUDANCA_SETOR: {
    texto: "Mudança de setor",
    classe: "bg-indigo-100 text-indigo-700",
  },
  MUDANCA_LOCALIZACAO: {
    texto: "Mudança de localização",
    classe: "bg-sky-100 text-sky-700",
  },
  ENTRADA_MANUTENCAO: {
    texto: "Entrada em manutenção",
    classe: "bg-amber-100 text-amber-700",
  },
  RETORNO_MANUTENCAO: {
    texto: "Retorno da manutenção",
    classe: "bg-emerald-100 text-emerald-700",
  },
  INSTALACAO_PECA: {
    texto: "Instalação de peça",
    classe: "bg-blue-100 text-blue-700",
  },
  RETIRADA_PECA: {
    texto: "Retirada de peça",
    classe: "bg-amber-100 text-amber-700",
  },
  ALTERACAO_CADASTRAL: {
    texto: "Alteração cadastral",
    classe: "bg-orange-100 text-orange-700",
  },
  BAIXA: {
    texto: "Baixa",
    classe: "bg-rose-100 text-rose-700",
  },
};

function formatarDataHora(valor: string) {
  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "Data inválida";
  }

  return data.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function obterDescricao(movimentacao: Movimentacao): string {
  switch (movimentacao.tipo) {
    case "ENTREGA":
      return movimentacao.responsavelNovo
        ? `Entregue para ${movimentacao.responsavelNovo.nome}`
        : "Equipamento entregue";

    case "TROCA":
      return movimentacao.equipamentoRelacionado
        ? `Troca relacionada a ${movimentacao.equipamentoRelacionado.nome}`
        : "Troca de equipamento";

    case "DEVOLUCAO":
      return movimentacao.responsavelAnterior
        ? `Devolvido por ${movimentacao.responsavelAnterior.nome}`
        : "Equipamento devolvido";

    case "MUDANCA_SETOR":
      return movimentacao.setorNovo
        ? `Movido para o setor ${movimentacao.setorNovo.nome}`
        : "Setor alterado";

    case "MUDANCA_LOCALIZACAO":
      return movimentacao.localizacaoNova
        ? `Movido para ${movimentacao.localizacaoNova.nome}`
        : "Localização alterada";

    case "ENTRADA_MANUTENCAO":
      return "Enviado para manutenção";

    case "RETORNO_MANUTENCAO":
      return "Retornou da manutenção";

    case "INSTALACAO_PECA":
      return "Instalação de peça registrada";

    case "RETIRADA_PECA":
      return "Retirada de peça registrada";

    case "ALTERACAO_CADASTRAL":
      return "Dados cadastrais do equipamento alterados";

    case "BAIXA":
      return "Equipamento baixado";

    default:
      return "Movimentação registrada";
  }
}

function obterAlteracao(movimentacao: Movimentacao): AlteracaoHistorico | null {
  switch (movimentacao.tipo) {
    case "ENTREGA":
      return {
        origem: movimentacao.responsavelAnterior?.nome ?? "Estoque",
        destino: movimentacao.responsavelNovo?.nome ?? "Não informado",
      };

    case "TROCA":
      return {
        origem: movimentacao.equipamento.nome,
        destino: movimentacao.equipamentoRelacionado?.nome ?? "Não informado",
      };

    case "DEVOLUCAO":
      return {
        origem: movimentacao.responsavelAnterior?.nome ?? "Não informado",
        destino: movimentacao.responsavelNovo?.nome ?? "Estoque",
      };

    case "MUDANCA_SETOR":
      return {
        origem: movimentacao.setorAnterior?.nome ?? "Não informado",
        destino: movimentacao.setorNovo?.nome ?? "Não informado",
      };

    case "MUDANCA_LOCALIZACAO":
      return {
        origem: movimentacao.localizacaoAnterior?.nome ?? "Não informado",
        destino: movimentacao.localizacaoNova?.nome ?? "Não informado",
      };

    default:
      if (!movimentacao.statusAnterior && !movimentacao.statusNovo) {
        return null;
      }

      return {
        origem: movimentacao.statusAnterior ?? "Não informado",
        destino: movimentacao.statusNovo ?? "Não informado",
      };
  }
}

interface HistoricoEquipamentoProps {
  equipamentoId: number;
  versao: number;
}

function HistoricoEquipamento({
  equipamentoId,
  versao,
}: HistoricoEquipamentoProps) {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setCarregando(true);
      setErro("");

      try {
        const dados =
          await movimentacaoService.buscarPorEquipamento(equipamentoId);

        if (ativo) {
          setMovimentacoes(dados);
        }
      } catch (error) {
        if (ativo) {
          console.error("Erro ao carregar histórico:", error);
          setMovimentacoes([]);
          setErro("Não foi possível carregar o histórico deste equipamento.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, [equipamentoId, versao, tentativa]);

  return (
    <Card>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2.5 text-blue-600">
            <History size={22} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Histórico do equipamento
            </h2>

            <p className="text-sm text-slate-500">
              {movimentacoes.length}{" "}
              {movimentacoes.length === 1
                ? "evento registrado"
                : "eventos registrados"}
            </p>
          </div>
        </div>

        {erro && (
          <Button
            variant="secondary"
            onClick={() => setTentativa((valor) => valor + 1)}
          >
            <RefreshCw size={17} />
            Tentar novamente
          </Button>
        )}
      </div>

      {carregando ? (
        <div className="py-4">
          <Skeleton />
        </div>
      ) : erro ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-8 text-center">
          <p className="text-sm text-red-700">{erro}</p>
        </div>
      ) : movimentacoes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 px-5 py-12 text-center">
          <History size={38} className="mx-auto mb-3 text-slate-300" />

          <h3 className="font-semibold text-slate-700">
            Nenhum evento registrado
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            As movimentações deste equipamento aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="ml-2 border-l border-slate-200 pl-6">
          {movimentacoes.map((movimentacao) => {
            const tipo = tiposMovimentacao[movimentacao.tipo] ?? {
              texto: "Movimentação",
              classe: "bg-slate-100 text-slate-700",
            };

            const alteracao = obterAlteracao(movimentacao);

            return (
              <article
                key={movimentacao.id}
                className="relative pb-8 last:pb-0"
              >
                <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-blue-600 ring-4 ring-white" />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${tipo.classe}`}
                  >
                    {tipo.texto}
                  </span>

                  <time className="text-sm text-slate-500">
                    {formatarDataHora(movimentacao.dataHora)}
                  </time>
                </div>

                <h3 className="mt-3 font-semibold text-slate-900">
                  {obterDescricao(movimentacao)}
                </h3>

                {alteracao && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <span>{alteracao.origem}</span>

                    <ArrowRight size={16} className="text-slate-400" />

                    <span className="font-medium text-slate-800">
                      {alteracao.destino}
                    </span>
                  </div>
                )}

                {movimentacao.observacoes && (
                  <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    {movimentacao.observacoes}
                  </p>
                )}

                <p className="mt-2 text-xs text-slate-400">
                  Registrado por {movimentacao.usuario?.nome ?? "Sistema"}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export function EquipamentoDetalhesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { carregando, temTodasPermissoes } = useAuth();

  const equipamentoId = Number(id);

  if (carregando) {
    return (
      <MainLayout>
        <Skeleton />
      </MainLayout>
    );
  }

  if (!Number.isSafeInteger(equipamentoId) || equipamentoId <= 0) {
    return (
      <MainLayout>
        <Card className="p-8 text-center">
          <p className="mb-4 text-red-600">ID do equipamento inválido.</p>

          <Button variant="secondary" onClick={() => navigate("/equipamentos")}>
            <ArrowLeft size={18} />
            Voltar
          </Button>
        </Card>
      </MainLayout>
    );
  }

  // A rota /equipamentos/:id/completo exige as duas permissões.
  if (!temTodasPermissoes("equipamentos.visualizar", "hardware.visualizar")) {
    return (
      <MainLayout>
        <Card className="p-8 text-center">
          <p className="mb-4 text-slate-600">
            Você não possui permissão para visualizar estes detalhes.
          </p>

          <Button variant="secondary" onClick={() => navigate("/equipamentos")}>
            <ArrowLeft size={18} />
            Voltar
          </Button>
        </Card>
      </MainLayout>
    );
  }

  return (
    <DetalhesEquipamento key={equipamentoId} equipamentoId={equipamentoId} />
  );
}

function DetalhesEquipamento({ equipamentoId }: { equipamentoId: number }) {
  const navigate = useNavigate();
  const { temTodasPermissoes } = useAuth();

  const podeCriarHardware = temTodasPermissoes(
    "hardware.visualizar",
    "hardware.criar",
  );

  const podeEditarHardware = temTodasPermissoes(
    "hardware.visualizar",
    "hardware.editar",
  );

  const podeExcluirHardware = temTodasPermissoes(
    "hardware.visualizar",
    "hardware.excluir",
  );

  const podeVerHistorico = temTodasPermissoes(
    "equipamentos.visualizar",
    "movimentacoes.visualizar",
  );

  const [equipamento, setEquipamento] = useState<Equipamento | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [versao, setVersao] = useState(0);

  const [modalHardwareAberto, setModalHardwareAberto] = useState(false);
  const [hardwareSelecionado, setHardwareSelecionado] =
    useState<Hardware | null>(null);

  const [hardwareExcluir, setHardwareExcluir] = useState<Hardware | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const exclusaoEmAndamento = useRef(false);

  const podeSalvarHardware = hardwareSelecionado
    ? podeEditarHardware
    : podeCriarHardware;

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setCarregando(true);
      setErro("");

      try {
        const dados = await equipamentoService.buscarCompleto(equipamentoId);

        if (ativo) {
          setEquipamento(dados);
        }
      } catch (error) {
        if (ativo) {
          console.error("Erro ao carregar equipamento:", error);
          setErro("Não foi possível carregar o equipamento.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, [equipamentoId, versao]);

  useEffect(() => {
    if (!podeSalvarHardware) {
      setModalHardwareAberto(false);
      setHardwareSelecionado(null);
    }

    if (!podeExcluirHardware) {
      setHardwareExcluir(null);
    }
  }, [podeSalvarHardware, podeExcluirHardware]);

  function atualizarDados() {
    setVersao((valor) => valor + 1);
  }

  function adicionarHardware() {
    if (!podeCriarHardware) return;

    setHardwareSelecionado(null);
    setModalHardwareAberto(true);
  }

  function editarHardware(hardware: Hardware) {
    if (!podeEditarHardware) return;

    setHardwareSelecionado(hardware);
    setModalHardwareAberto(true);
  }

  function fecharHardwareModal() {
    setModalHardwareAberto(false);
    setHardwareSelecionado(null);
  }

  function excluirHardware(hardware: Hardware) {
    if (!podeExcluirHardware) return;

    setHardwareExcluir(hardware);
  }

  function fecharModalExclusao() {
    if (exclusaoEmAndamento.current) return;

    setHardwareExcluir(null);
  }

  async function confirmarExclusaoHardware() {
    if (
      !podeExcluirHardware ||
      !hardwareExcluir ||
      exclusaoEmAndamento.current
    ) {
      return;
    }

    exclusaoEmAndamento.current = true;
    setExcluindo(true);

    try {
      await hardwareService.excluir(hardwareExcluir.id);

      toast.success(`Hardware "${hardwareExcluir.nome}" excluído com sucesso.`);

      setHardwareExcluir(null);
      atualizarDados();
    } catch (error) {
      console.error("Erro ao excluir hardware:", error);
      toast.error("Não foi possível excluir o hardware.");
    } finally {
      exclusaoEmAndamento.current = false;
      setExcluindo(false);
    }
  }

  function concluirFormularioHardware() {
    fecharHardwareModal();
    atualizarDados();
  }

  if (carregando && !equipamento) {
    return (
      <MainLayout>
        <Skeleton />
      </MainLayout>
    );
  }

  if (erro || !equipamento) {
    return (
      <MainLayout>
        <Card className="p-8 text-center">
          <h2 className="mb-2 text-xl font-bold text-red-600">
            Erro ao carregar equipamento
          </h2>

          <p className="mb-6 text-slate-600">
            {erro || "Equipamento não encontrado."}
          </p>

          <div className="flex justify-center gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate("/equipamentos")}
            >
              <ArrowLeft size={18} />
              Voltar
            </Button>

            <Button onClick={atualizarDados}>
              <RefreshCw size={18} />
              Tentar novamente
            </Button>
          </div>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Button variant="secondary" onClick={() => navigate("/equipamentos")}>
          <ArrowLeft size={18} />
          Voltar
        </Button>

        {podeCriarHardware && (
          <Button onClick={adicionarHardware}>
            <Plus size={18} />
            Adicionar Hardware
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <EquipmentInfoCard equipamento={equipamento} />

        <FotoEquipamentoGallery equipamentoId={equipamento.id} />

        {obterGrupo(equipamento.categoria) === "COMPUTADORES" && (
          <PecasComputador
            computadorId={equipamento.id}
            onSucesso={atualizarDados}
          />
        )}

        <Card>
          <div className="mb-6">
            <h2 className="text-xl font-bold">Hardwares instalados</h2>

            <p className="text-sm text-gray-500">
              Total: {equipamento.hardware?.length ?? 0}
            </p>
          </div>

          {equipamento.hardware && equipamento.hardware.length > 0 ? (
            <HardwareList
              hardwares={equipamento.hardware}
              {...(podeEditarHardware ? { onEditar: editarHardware } : {})}
              {...(podeExcluirHardware ? { onExcluir: excluirHardware } : {})}
            />
          ) : (
            <div className="py-12 text-center text-gray-500">
              Nenhum hardware cadastrado para este equipamento.
            </div>
          )}
        </Card>

        {podeVerHistorico && (
          <HistoricoEquipamento
            equipamentoId={equipamento.id}
            versao={versao}
          />
        )}
      </div>

      {modalHardwareAberto && podeSalvarHardware && (
        <HardwareModal
          aberto
          titulo={
            hardwareSelecionado ? "Editar Hardware" : "Adicionar Hardware"
          }
          onClose={fecharHardwareModal}
        >
          <HardwareForm
            equipamentoId={equipamento.id}
            hardware={hardwareSelecionado}
            onCancelar={fecharHardwareModal}
            onSucesso={concluirFormularioHardware}
          />
        </HardwareModal>
      )}

      {podeExcluirHardware && hardwareExcluir && (
        <ConfirmModal
          aberto
          titulo="Excluir Hardware"
          mensagem={`Deseja realmente excluir o hardware "${hardwareExcluir.nome}"?`}
          carregando={excluindo}
          onCancel={fecharModalExclusao}
          onConfirm={confirmarExclusaoHardware}
        />
      )}
    </MainLayout>
  );
}
