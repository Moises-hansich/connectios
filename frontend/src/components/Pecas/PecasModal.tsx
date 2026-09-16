import { useEffect, useRef, useState, type FormEvent } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Modal } from "../Modal";
import { Button } from "../Button";
import { pecasService, type OpcoesPecas, type OperacaoPeca } from "../../services/pecasService";
import { normalizarTexto } from "../../utils/grupoEquipamento";

interface Props {
  computadorId?: number;
  pecaId?: number;
  retiradaId?: number;
  onFechar: () => void;
  onSucesso: () => void | Promise<void>;
}
const campo = "mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm disabled:bg-slate-100";
const nome = (e: {nome: string; patrimonio: string | null}) => `${e.nome}${e.patrimonio ? ` · ${e.patrimonio}` : ""}`;

// Mounted only while open: each new operation starts with fresh server data.
export function PecasModal({computadorId, pecaId, retiradaId, onFechar, onSucesso}: Props) {
  const [opcoes, setOpcoes] = useState<OpcoesPecas | null>(null);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const enviando = useRef(false);
  const [acao, setAcao] = useState<OperacaoPeca["acao"]>(retiradaId ? "RETIRAR" : "INSTALAR");
  const [computador, setComputador] = useState(String(computadorId ?? ""));
  const [peca, setPeca] = useState(String(pecaId ?? ""));
  const [retirada, setRetirada] = useState(String(retiradaId ?? ""));
  const [situacao, setSituacao] = useState<"DISPONIVEL" | "DEFEITO">("DISPONIVEL");
  const [local, setLocal] = useState("");
  const [tecnico, setTecnico] = useState("");
  const [descricao, setDescricao] = useState("");
  const [original, setOriginal] = useState("");
  const [destino, setDestino] = useState("");
  useEffect(() => {
    let ativo = true;
    setErro(""); setOpcoes(null);
    pecasService.opcoes().then(dados => { if (ativo) setOpcoes(dados); }).catch(() => {
      if (ativo) setErro("Não foi possível consultar as peças. Tente novamente.");
    });
    return () => { ativo = false; };
  }, [tentativa]);
  const pc = opcoes?.computadores.find(e => e.id === Number(computador));
  const manutencao = pc?.manutencoes[0];
  const instaladas = opcoes?.pecas.filter(e => e.instaladoEmId === Number(computador)) ?? [];
  const removida = instaladas.find(e => e.id === Number(retirada));
  const disponiveis = opcoes?.pecas.filter(e => e.instaladoEmId === null && normalizarTexto(e.status) === "disponivel" && e.responsavelId === null && e.manutencoes.length === 0) ?? [];
  const externa = !!manutencao && manutencao.tipo !== "INTERNA";

  async function enviar(event: FormEvent) {
    event.preventDefault();
    if (enviando.current) return;
    if (!pc || externa || !opcoes) return;
    if (descricao.trim().length < 5) { setErro("Descreva o serviço com pelo menos 5 caracteres."); return; }
    if (acao !== "RETIRAR" && !disponiveis.some(e => e.id === Number(peca))) { setErro("Selecione uma peça disponível."); return; }
    if (acao !== "INSTALAR" && retirada && !removida) { setErro("Selecione uma peça instalada neste computador."); return; }
    const dados: OperacaoPeca = {
      acao, situacaoRetirada: situacao, computadorId: pc.id, descricao: descricao.trim(),
      ...(!manutencao && {tecnicoResponsavelId: Number(tecnico)}),
      ...(acao !== "RETIRAR" && {pecaId: Number(peca)}),
      ...(acao !== "INSTALAR" && (retirada ? {retiradaId: Number(retirada), localReservaId: Number(local || removida?.localReservaId)} : {descricaoRetirada: original.trim(), destinoRetirada: destino.trim()})),
    };
    enviando.current = true; setSalvando(true); setErro("");
    try {
      const resultado = await pecasService.registrar(dados);
      toast.success(`Intervenção registrada na manutenção #${resultado.manutencaoId}.`);
    } catch (error) {
      setErro(axios.isAxiosError(error) ? error.response?.data?.mensagem || error.response?.data?.message || "Não foi possível registrar. Atualize a lista e confira o histórico antes de tentar novamente." : "Não foi possível registrar a intervenção.");
      enviando.current = false; setSalvando(false); return;
    }
    // A refresh failure must never be reported as a failed save or invite a duplicate POST.
    try { await onSucesso(); } catch { toast.warning("Registro salvo. Atualize a página para ver os dados recentes."); }
    onFechar();
  }
  return <Modal aberto titulo="Intervenção em peças" onClose={() => { if (!enviando.current) onFechar(); }}>
    <form onSubmit={enviar} className="space-y-4">
      <p className="text-sm text-slate-500">Instale peças da reserva ou registre uma retirada. Todo serviço fica no histórico de manutenção do computador.</p>
      {erro && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{erro}</p>}
      {!opcoes ? <div>{!erro ? "Carregando peças..." : <Button type="button" onClick={() => setTentativa(v => v + 1)}>Tentar novamente</Button>}</div> : <fieldset disabled={salvando} className="space-y-4">
        <label className="block text-sm font-medium">Operação
          <select className={campo} value={acao} onChange={e => setAcao(e.target.value as OperacaoPeca["acao"])}>
            <option value="INSTALAR">Instalar peça da reserva</option><option value="TROCAR">Trocar peça</option><option value="RETIRAR">Retirar peça</option>
          </select>
        </label>
        <label className="block text-sm font-medium">Computador
          <select required disabled={!!computadorId} className={campo} value={computador} onChange={e => {setComputador(e.target.value); setRetirada(""); setLocal("");}}>
            <option value="">Selecione o computador</option>
            {opcoes.computadores.map(e => <option key={e.id} value={e.id}>{nome(e)}</option>)}
          </select>
        </label>
        {acao !== "RETIRAR" && <label className="block text-sm font-medium">Peça disponível na reserva
          <select required className={campo} value={peca} onChange={e => setPeca(e.target.value)}>
            <option value="">Selecione a peça</option>{disponiveis.map(e => <option key={e.id} value={e.id}>{nome(e)}</option>)}
          </select>
          {disponiveis.length === 0 && <span className="text-xs text-amber-700">Nenhuma peça disponível na reserva.</span>}
        </label>}
        {acao !== "INSTALAR" && <div className="space-y-3 rounded-xl border border-slate-200 p-4">
          <label className="block text-sm font-medium">Peça retirada
            <select className={campo} value={retirada} onChange={e => {setRetirada(e.target.value); setLocal("");}}>
              <option value="">Peça original sem cadastro</option>{instaladas.map(e => <option key={e.id} value={e.id}>{nome(e)}</option>)}
            </select>
          </label>
          {retirada ? <label className="block text-sm font-medium">Local de devolução da peça
            <select required className={campo} value={local || String(removida?.localReservaId ?? "")} onChange={e => setLocal(e.target.value)}>
              <option value="">Selecione o local</option>{opcoes.localizacoes.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </select>

          </label> : <>
            <label className="block text-sm font-medium">Descrição da peça original<input required minLength={5} maxLength={4000} className={campo} value={original} onChange={e => setOriginal(e.target.value)} placeholder="Ex.: memória DDR3 de 4 GB, sem patrimônio" /></label>
            <label className="block text-sm font-medium">Destino da peça original<input required minLength={3} maxLength={4000} className={campo} value={destino} onChange={e => setDestino(e.target.value)} placeholder="Ex.: separada no CPD para descarte" /></label>
            <p className="text-xs text-slate-500">O histórico guardará essa descrição. Nenhum item será criado no estoque automaticamente.</p>
          </>}
        </div>}
        {acao !== "INSTALAR" && retirada && <label className="block text-sm font-medium">Situação da peça retirada
          <select className={campo} value={situacao} onChange={e => setSituacao(e.target.value as "DISPONIVEL" | "DEFEITO")}><option value="DISPONIVEL">Funcionando — disponível na reserva</option><option value="DEFEITO">Com defeito — indisponível para instalação</option></select>
        </label>}
        {pc && (manutencao ? <p className={`rounded-lg p-3 text-sm ${externa ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
          {externa ? "Há manutenção externa em andamento. Finalize esse atendimento antes de registrar peças." : `O serviço será registrado na manutenção interna #${manutencao.id}. Técnico: ${opcoes.tecnicos.find(t => t.id === manutencao.tecnicoResponsavelId)?.nome || "Veja o atendimento"}.`}
        </p> : <label className="block text-sm font-medium">Técnico responsável pela nova manutenção interna
          <select required className={campo} value={tecnico} onChange={e => setTecnico(e.target.value)}><option value="">Selecione o técnico</option>{opcoes.tecnicos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}</select>
        </label>)}
        <label className="block text-sm font-medium">Serviço realizado<textarea required minLength={5} maxLength={4000} rows={3} className={campo} value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descreva o motivo e o que foi feito" /></label>
        <p className="text-xs text-slate-500">O usuário conectado e o horário serão registrados automaticamente. A manutenção ficará em andamento para finalização.</p>
        <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onFechar}>Cancelar</Button><Button type="submit" disabled={salvando || !pc || externa}>{salvando ? "Registrando..." : "Registrar intervenção"}</Button></div>
      </fieldset>}
    </form>
  </Modal>;
}
