import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ChevronRight,
  Cpu,
  ExternalLink,
  Mail,
  MapPin,
  Monitor,
  Package,
  Phone,
  UserRound,
} from "lucide-react";

import { MainLayout } from "../../layouts/MainLayout";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Skeleton } from "../../components/Skeleton";

import { colaboradorService } from "../../services/colaboradorService";

import type { ColaboradorCompleto } from "../../types/colaborador";

export function ColaboradorDetalhesPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [colaborador, setColaborador] = useState<ColaboradorCompleto | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [equipamentosAbertos, setEquipamentosAbertos] = useState<Set<number>>(
    new Set(),
  );

  async function carregarColaborador() {
    const colaboradorId = Number(id);

    if (!Number.isInteger(colaboradorId) || colaboradorId <= 0) {
      setErro("ID do colaborador inválido.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErro("");

      const resposta = await colaboradorService.buscarCompleto(colaboradorId);

      setColaborador(resposta.data);
    } catch (error) {
      console.error("Erro ao carregar colaborador:", error);
      setErro("Não foi possível carregar os dados do colaborador.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarColaborador();
  }, [id]);

  function alternarEquipamento(equipamentoId: number) {
    setEquipamentosAbertos((anteriores) => {
      const novos = new Set(anteriores);

      if (novos.has(equipamentoId)) {
        novos.delete(equipamentoId);
      } else {
        novos.add(equipamentoId);
      }

      return novos;
    });
  }

  function formatarTexto(valor: string) {
    return valor
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/(^|\s)\S/g, (letra) => letra.toUpperCase());
  }

  function classeStatus(status: string) {
    const statusNormalizado = status
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replaceAll("_", " ")
      .toUpperCase();

    if (
      statusNormalizado === "ATIVO" ||
      statusNormalizado === "EM USO" ||
      statusNormalizado === "DISPONIVEL"
    ) {
      return "bg-emerald-100 text-emerald-700";
    }

    if (
      statusNormalizado === "MANUTENCAO" ||
      statusNormalizado === "EM MANUTENCAO"
    ) {
      return "bg-amber-100 text-amber-700";
    }

    if (statusNormalizado === "INATIVO" || statusNormalizado === "DESCARTADO") {
      return "bg-red-100 text-red-700";
    }

    return "bg-slate-100 text-slate-700";
  }

  function formatarValor(valor: string, unidade: string | null) {
    if (!unidade) {
      return valor;
    }

    const valorNormalizado = valor.trim().toLowerCase();
    const unidadeNormalizada = unidade.trim().toLowerCase();

    if (valorNormalizado.endsWith(unidadeNormalizada)) {
      return valor;
    }

    return `${valor} ${unidade}`;
  }

  if (loading) {
    return (
      <MainLayout>
        <Skeleton />
      </MainLayout>
    );
  }

  if (erro || !colaborador) {
    return (
      <MainLayout>
        <Card className="p-8 text-center">
          <h2 className="mb-2 text-xl font-bold text-red-600">
            Erro ao carregar colaborador
          </h2>

          <p className="mb-6 text-slate-600">
            {erro || "Colaborador não encontrado."}
          </p>

          <Button
            variant="secondary"
            onClick={() => navigate("/colaboradores")}
          >
            <ArrowLeft size={18} />
            Voltar
          </Button>
        </Card>
      </MainLayout>
    );
  }

  const totalEquipamentos = colaborador.equipamentos.length;

  const totalHardwares = colaborador.equipamentos.reduce(
    (total, equipamento) => total + equipamento.hardware.length,
    0,
  );

  return (
    <MainLayout>
      <div className="mb-6">
        <Button variant="secondary" onClick={() => navigate("/colaboradores")}>
          <ArrowLeft size={18} />
          Voltar
        </Button>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                <UserRound size={32} />
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {colaborador.nome}
                  </h1>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      colaborador.ativo
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {colaborador.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>

                <p className="text-sm text-slate-500">
                  Informações, equipamentos e componentes vinculados ao
                  colaborador.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-2 xl:grid-cols-4">
            <div className="flex items-center gap-3">
              <BriefcaseBusiness className="text-slate-400" size={20} />

              <div>
                <p className="text-xs text-slate-500">Cargo</p>
                <p className="font-medium text-slate-800">
                  {colaborador.cargo || "Não informado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="text-slate-400" size={20} />

              <div className="min-w-0">
                <p className="text-xs text-slate-500">E-mail</p>
                <p className="truncate font-medium text-slate-800">
                  {colaborador.email || "Não informado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="text-slate-400" size={20} />

              <div>
                <p className="text-xs text-slate-500">Telefone</p>
                <p className="font-medium text-slate-800">
                  {colaborador.telefone || "Não informado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Building2 className="text-slate-400" size={20} />

              <div>
                <p className="text-xs text-slate-500">Localização</p>
                <p className="font-medium text-slate-800">
                  {colaborador.localizacao?.nome || "Não informada"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-indigo-100 p-3 text-indigo-700">
                <Package size={26} />
              </div>

              <div>
                <p className="text-sm text-slate-500">Equipamentos</p>
                <p className="text-2xl font-bold text-slate-900">
                  {totalEquipamentos}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
                <Cpu size={26} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Componentes de hardware
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {totalHardwares}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Equipamentos vinculados
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Clique em um equipamento para visualizar seus componentes.
            </p>
          </div>

          {colaborador.equipamentos.length === 0 ? (
            <div className="py-12 text-center">
              <Monitor className="mx-auto mb-3 text-slate-300" size={42} />

              <p className="font-medium text-slate-600">
                Nenhum equipamento vinculado
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Este colaborador ainda não possui equipamentos.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {colaborador.equipamentos.map((equipamento) => {
                const aberto = equipamentosAbertos.has(equipamento.id);

                return (
                  <div
                    key={equipamento.id}
                    className="overflow-hidden rounded-xl border border-slate-200"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 bg-white p-4 text-left transition hover:bg-slate-50"
                      aria-expanded={aberto}
                      onClick={() => alternarEquipamento(equipamento.id)}
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="rounded-lg bg-slate-100 p-2.5 text-slate-600">
                          <Monitor size={23} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {equipamento.nome}
                          </p>

                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span>{equipamento.categoria}</span>

                            {equipamento.patrimonio && (
                              <span>Patrimônio: {equipamento.patrimonio}</span>
                            )}

                            <span>
                              {equipamento.hardware.length} componente(s)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`hidden rounded-full px-3 py-1 text-xs font-semibold sm:inline-flex ${classeStatus(
                            equipamento.status,
                          )}`}
                        >
                          {formatarTexto(equipamento.status)}
                        </span>

                        {aberto ? (
                          <ChevronDown className="text-slate-400" size={20} />
                        ) : (
                          <ChevronRight className="text-slate-400" size={20} />
                        )}
                      </div>
                    </button>

                    {aberto && (
                      <div className="border-t border-slate-200 bg-slate-50 p-4 sm:p-5">
                        <div className="mb-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <p className="text-xs text-slate-500">Fabricante</p>
                            <p className="font-medium text-slate-800">
                              {equipamento.fabricante || "Não informado"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500">Modelo</p>
                            <p className="font-medium text-slate-800">
                              {equipamento.modelo || "Não informado"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500">
                              Número de série
                            </p>
                            <p className="font-medium text-slate-800">
                              {equipamento.numeroSerie || "Não informado"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500">
                              Localização
                            </p>

                            <p className="flex items-center gap-1 font-medium text-slate-800">
                              <MapPin size={14} />
                              {equipamento.localizacao?.nome || "Não informada"}
                            </p>
                          </div>
                        </div>

                        <div className="mb-5">
                          <Button
                            variant="secondary"
                            onClick={() =>
                              navigate(`/equipamentos/${equipamento.id}`)
                            }
                          >
                            <ExternalLink size={16} />
                            Abrir equipamento
                          </Button>
                        </div>

                        <div>
                          <h3 className="mb-3 font-semibold text-slate-900">
                            Hardwares instalados
                          </h3>

                          {equipamento.hardware.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                              Nenhum hardware cadastrado neste equipamento.
                            </div>
                          ) : (
                            <div className="grid gap-4 lg:grid-cols-2">
                              {equipamento.hardware.map((hardware) => (
                                <div
                                  key={hardware.id}
                                  className="rounded-lg border border-slate-200 bg-white p-4"
                                >
                                  <div className="mb-4 flex items-start gap-3">
                                    <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                                      <Cpu size={19} />
                                    </div>

                                    <div>
                                      <p className="font-semibold text-slate-900">
                                        {hardware.nome}
                                      </p>

                                      <p className="text-xs text-slate-500">
                                        {hardware.tipoHardware.nome}
                                      </p>
                                    </div>
                                  </div>

                                  {(hardware.fabricante || hardware.modelo) && (
                                    <p className="mb-3 text-sm text-slate-600">
                                      {[hardware.fabricante, hardware.modelo]
                                        .filter(Boolean)
                                        .join(" — ")}
                                    </p>
                                  )}

                                  {hardware.valores.length > 0 ? (
                                    <div className="space-y-2 border-t border-slate-100 pt-3">
                                      {hardware.valores.map((valor) => (
                                        <div
                                          key={valor.id}
                                          className="flex items-start justify-between gap-4 text-sm"
                                        >
                                          <span className="text-slate-500">
                                            {valor.campoHardware.nome}
                                          </span>

                                          <span className="text-right font-medium text-slate-800">
                                            {formatarValor(
                                              valor.valor,
                                              valor.campoHardware.unidade,
                                            )}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="border-t border-slate-100 pt-3 text-sm text-slate-500">
                                      Nenhuma especificação cadastrada.
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
