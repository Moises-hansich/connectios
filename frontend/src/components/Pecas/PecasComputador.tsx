import { useEffect, useState } from "react";
import { pecasService, type ItemPeca } from "../../services/pecasService";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../Button";
import { Card } from "../Card";
import { PecasModal } from "./PecasModal";
export function PecasComputador({computadorId, onSucesso}: {computadorId: number; onSucesso: () => void | Promise<void>}) {
  const {usuario} = useAuth();
  const [pecas, setPecas] = useState<ItemPeca[]>([]);
  const [erro, setErro] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [versao, setVersao] = useState(0);
  const [operacao, setOperacao] = useState<{retiradaId?: number} | null>(null);
  useEffect(() => {
    let ativo = true; setCarregando(true); setErro(false);
    pecasService.opcoes().then(d => {if (ativo) setPecas(d.pecas.filter(p => p.instaladoEmId === computadorId));}).catch(() => {if (ativo) setErro(true);}).finally(() => {if (ativo) setCarregando(false);});
    return () => {ativo = false;};
  }, [computadorId, versao]);
  return <Card>
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Peças instaladas da reserva</h2><p className="text-sm text-slate-500">Itens do CPD vinculados a este computador.</p></div>{usuario?.perfil === "ADMIN" && <Button type="button" onClick={() => setOperacao({})}>Instalar ou trocar peça</Button>}</div>
    <div className="mt-4 space-y-2">{carregando ? <p>Carregando peças...</p> : erro ? <Button variant="secondary" onClick={() => setVersao(v => v + 1)}>Falha ao carregar. Tentar novamente</Button> : pecas.length === 0 ? <p className="text-sm text-slate-500">Nenhuma peça da reserva instalada. Os componentes originais podem continuar descritos em Hardware.</p> : pecas.map(p => <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3"><div><p className="font-medium">{p.nome}</p><p className="text-xs text-slate-500">{p.patrimonio || `ID ${p.id}`}</p></div>{usuario?.perfil === "ADMIN" && <Button variant="secondary" onClick={() => setOperacao({retiradaId: p.id})}>Retirar peça</Button>}</div>)}</div>
    {operacao && <PecasModal computadorId={computadorId} retiradaId={operacao.retiradaId} onFechar={() => setOperacao(null)} onSucesso={async () => {setOperacao(null); setVersao(v => v + 1); await onSucesso();}} />}
  </Card>;
}
