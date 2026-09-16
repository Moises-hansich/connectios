import { prisma } from "../prisma";
import { AppError } from "../errors/AppError";
import { ManutencaoService } from "./manutencaoService";
import { obterGrupo, normalizarTexto } from "../utils/grupoEquipamento";

function id(valor: unknown, nome: string): number {
  if (typeof valor !== "number" || !Number.isSafeInteger(valor) || valor <= 0) throw new AppError(`${nome} inválido`, 400);
  return valor;
}
function texto(valor: unknown, nome: string, minimo = 5): string {
  if (typeof valor !== "string" || valor.trim().length < minimo || valor.length > 4000) throw new AppError(`${nome}: informe de ${minimo} a 4000 caracteres`, 400);
  return valor.trim();
}
const identificacao = (e: {id: number; nome: string; patrimonio: string | null}) => `${e.nome} (${e.patrimonio || `ID ${e.id}`})`;

export class PecasService {
  async opcoes() {
    const [equipamentos, tecnicos, localizacoes] = await Promise.all([
      prisma.equipamento.findMany({select: {
        id: true, nome: true, patrimonio: true, status: true, instaladoEmId: true,
        localReservaId: true, localizacaoId: true, responsavelId: true,
        categoria: {select: {nome: true}},
        manutencoes: {where: {status: "EM_ANDAMENTO"}, select: {id: true, tipo: true, tecnicoResponsavelId: true}},
      }, orderBy: {nome: "asc"}}),
      prisma.usuario.findMany({where: {ativo: true}, select: {id: true, nome: true}, orderBy: {nome: "asc"}}),
      prisma.localizacao.findMany({select: {id: true, nome: true}, orderBy: {nome: "asc"}}),
    ]);
    return {
      computadores: equipamentos.filter(e => obterGrupo(e.categoria.nome) === "COMPUTADORES"),
      pecas: equipamentos.filter(e => obterGrupo(e.categoria.nome) === "PECAS" || e.instaladoEmId !== null),
      tecnicos, localizacoes,
    };
  }

  async registrar(entrada: Record<string, unknown>, usuarioId: number) {
    id(usuarioId, "Usuário");
    const computadorId = id(entrada.computadorId, "Computador");
    const acao = entrada.acao;
    if (acao !== "INSTALAR" && acao !== "RETIRAR" && acao !== "TROCAR") throw new AppError("Operação inválida", 400);
    const situacaoRetirada = entrada.situacaoRetirada ?? "DISPONIVEL";
    if (situacaoRetirada !== "DISPONIVEL" && situacaoRetirada !== "DEFEITO") throw new AppError("Situação da peça retirada inválida", 400);
    const statusRetirada = situacaoRetirada === "DEFEITO" ? "Com defeito" : "Disponível";
    const descricao = texto(entrada.descricao, "Serviço realizado");
    const pecaId = acao !== "RETIRAR" ? id(entrada.pecaId, "Peça da reserva") : null;
    const retiradaId = entrada.retiradaId == null ? null : id(entrada.retiradaId, "Peça retirada");
    if (acao === "INSTALAR" && (retiradaId !== null || entrada.descricaoRetirada)) throw new AppError("Selecione Trocar para registrar uma retirada", 400);
    const descricaoRetirada = acao !== "INSTALAR" && retiradaId === null ? texto(entrada.descricaoRetirada, "Descrição da peça original") : null;
    const destinoRetirada = descricaoRetirada ? texto(entrada.destinoRetirada, "Destino da peça original", 3) : null;
    if (pecaId === computadorId || retiradaId === computadorId || (pecaId !== null && pecaId === retiradaId)) throw new AppError("Selecione peças diferentes do computador e entre si", 400);

    return prisma.$transaction(async tx => {
      const usuario = await tx.usuario.findUnique({where: {id: usuarioId}});
      if (!usuario?.ativo || usuario.perfil !== "ADMIN") throw new AppError("Usuário sem permissão para registrar a intervenção", 403);
      const computador = await tx.equipamento.findUnique({where: {id: computadorId}, include: {categoria: true}});
      if (!computador || obterGrupo(computador.categoria.nome) !== "COMPUTADORES" || computador.instaladoEmId !== null) throw new AppError("Selecione um computador cadastrado", 400);
      if (["baixado", "descartado"].includes(normalizarTexto(computador.status))) throw new AppError("O computador está baixado", 409);
      const nova = pecaId === null ? null : await tx.equipamento.findUnique({where: {id: pecaId}, include: {categoria: true}});
      if (pecaId !== null && (!nova || obterGrupo(nova.categoria.nome) !== "PECAS" || nova.instaladoEmId !== null || normalizarTexto(nova.status) !== "disponivel" || nova.responsavelId !== null)) throw new AppError("A peça não está disponível na reserva. Atualize a lista.", 409);
      const retirada = retiradaId === null ? null : await tx.equipamento.findUnique({where: {id: retiradaId}});
      if (retiradaId !== null && (!retirada || retirada.instaladoEmId !== computadorId)) throw new AppError("A peça retirada não está instalada neste computador", 409);
      const ids = [pecaId, retiradaId].filter((v): v is number => v !== null);
      if (await tx.manutencao.findFirst({where: {equipamentoId: {in: ids}, status: "EM_ANDAMENTO"}})) throw new AppError("Uma das peças possui manutenção em andamento", 409);
      let manutencao = await tx.manutencao.findFirst({where: {equipamentoId: computadorId, status: "EM_ANDAMENTO"}});
      if (manutencao && manutencao.tipo !== "INTERNA") throw new AppError("O computador possui manutenção externa em andamento", 409);
      if (!manutencao) {
        const criada = await new ManutencaoService().abrir({
          equipamentoId: computadorId, tipo: "INTERNA",
          tecnicoResponsavelId: id(entrada.tecnicoResponsavelId, "Técnico responsável"),
          problemaInformado: descricao, registradoPorId: usuarioId,
          localManutencao: "Atendimento de TI — peças",
        }, tx);
        if (!criada) throw new AppError("Não foi possível abrir a manutenção", 500);
        manutencao = criada;
      }
      const manutencaoId = manutencao.id;
      const dataHora = new Date();
      // Existing history stores snapshots in the description, even if names change later.
      const registrarHistorico = async (tipo: string, peca: typeof retirada, observacoes: string, statusNovo: string | null, localizacaoNovaId: number | null) => {
        await tx.movimentacao.create({data: {
          tipo, equipamentoId: computadorId, equipamentoRelacionadoId: peca?.id ?? null,
          manutencaoId, usuarioId, observacoes, dataHora,
          statusAnterior: "Em manutenção", statusNovo: "Em manutenção",
        }});
        if (peca) await tx.movimentacao.create({data: {
          tipo, equipamentoId: peca.id, equipamentoRelacionadoId: computadorId,
          manutencaoId, usuarioId, observacoes, dataHora,
          statusAnterior: peca.status, statusNovo,
          localizacaoAnteriorId: peca.localizacaoId, localizacaoNovaId,
          setorAnteriorId: peca.setorId,
          setorNovoId: tipo === "INSTALACAO_PECA" ? computador.setorId : peca.setorReservaId,
          responsavelAnteriorId: peca.responsavelId, responsavelNovoId: null,
        }});
      };
      if (retirada) {
        const localId = entrada.localReservaId == null ? retirada.localReservaId : id(entrada.localReservaId, "Local de reserva");
        if (localId === null || !await tx.localizacao.findUnique({where: {id: localId}})) throw new AppError("Selecione o local de devolução da peça", 400);
        const atualizado = await tx.equipamento.updateMany({where: {id: retirada.id, instaladoEmId: computadorId}, data: {
          instaladoEmId: null, status: statusRetirada, localizacaoId: localId,
          setorId: retirada.setorReservaId, responsavelId: null, localReservaId: null, setorReservaId: null,
        }});
        if (atualizado.count !== 1) throw new AppError("A peça já foi retirada. Atualize a lista.", 409);
        const local = await tx.localizacao.findUniqueOrThrow({where: {id: localId}});
        await registrarHistorico("RETIRADA_PECA", retirada, `Retirada de ${identificacao(retirada)} do computador ${identificacao(computador)}. Devolvida a: ${local.nome}. Situação: ${statusRetirada}.\nServiço: ${descricao}`, statusRetirada, localId);
      } else if (descricaoRetirada) {
        await registrarHistorico("RETIRADA_PECA", null, `Retirada de peça original sem cadastro do computador ${identificacao(computador)}: ${descricaoRetirada}. Destino: ${destinoRetirada}.\nServiço: ${descricao}`, null, null);
      }
      if (nova) {
        const atualizado = await tx.equipamento.updateMany({where: {id: nova.id, instaladoEmId: null, status: nova.status, responsavelId: null}, data: {
          instaladoEmId: computadorId, status: "Instalada", localReservaId: nova.localizacaoId,
          setorReservaId: nova.setorId, localizacaoId: computador.localizacaoId,
          setorId: computador.setorId, responsavelId: null,
        }});
        if (atualizado.count !== 1) throw new AppError("A peça deixou de estar disponível. Atualize a lista.", 409);
        await registrarHistorico("INSTALACAO_PECA", nova, `Instalação de ${identificacao(nova)} no computador ${identificacao(computador)}.\nServiço: ${descricao}`, "Instalada", computador.localizacaoId);
      }
      return {mensagem: "Intervenção registrada na manutenção interna", manutencaoId};
    });
  }
}
export const pecasService = new PecasService();
