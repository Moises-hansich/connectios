import { obterGrupo } from "../../utils/grupoEquipamento";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import {
  Cpu,
  Image as ImageIcon,
  MoreHorizontal,
  Pencil,
  Trash2,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "../Badge";
import { api } from "../../services/api";
import type { Equipamento } from "../../types/equipamento";

function obterUrlFoto(nomeArquivo: string) {
  const baseURL = api.defaults.baseURL;

  const origem =
    baseURL && /^https?:\/\//i.test(baseURL)
      ? new URL(baseURL).origin
      : `${window.location.protocol}//${window.location.hostname}:3100`;

  return `${origem}/uploads/equipamentos/${encodeURIComponent(nomeArquivo)}`;
}

function MiniaturaEquipamento({ equipamento }: { equipamento: Equipamento }) {
  const [erro, setErro] = useState(false);
  const foto = equipamento.fotos?.[0];

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
      {foto && !erro ? (
        <img
          src={obterUrlFoto(foto.nomeArquivo)}
          alt={`Foto de ${equipamento.nome}`}
          loading="lazy"
          onError={() => setErro(true)}
          className="h-full w-full object-contain"
        />
      ) : (
        <ImageIcon size={22} aria-label="Equipamento sem foto" />
      )}
    </div>
  );
}

interface Acao {
  titulo: string;
  icone: LucideIcon;
  executar: () => void;
  perigo?: boolean;
}

function MenuAcoes({ nome, acoes }: { nome: string; acoes: Acao[] }) {
  const id = useId();
  const botaoRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [posicao, setPosicao] = useState<{
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    if (!posicao) {
      return;
    }

    menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus();

    function fecharAoClicarFora(event: PointerEvent) {
      const alvo = event.target;

      if (
        alvo instanceof Node &&
        !menuRef.current?.contains(alvo) &&
        !botaoRef.current?.contains(alvo)
      ) {
        setPosicao(null);
      }
    }

    function fecharAoMoverTela(event: Event) {
      if (
        event.target instanceof Node &&
        menuRef.current?.contains(event.target)
      ) {
        return;
      }

      setPosicao(null);
    }

    document.addEventListener("pointerdown", fecharAoClicarFora);
    window.addEventListener("scroll", fecharAoMoverTela, true);
    window.addEventListener("resize", fecharAoMoverTela);

    return () => {
      document.removeEventListener("pointerdown", fecharAoClicarFora);
      window.removeEventListener("scroll", fecharAoMoverTela, true);
      window.removeEventListener("resize", fecharAoMoverTela);
    };
  }, [posicao]);

  function fechar() {
    setPosicao(null);
    botaoRef.current?.focus();
  }

  function alternar() {
    if (posicao) {
      fechar();
      return;
    }

    const retangulo = botaoRef.current?.getBoundingClientRect();

    if (!retangulo) {
      return;
    }

    const altura = acoes.length * 40 + 10;

    setPosicao({
      left: Math.max(
        8,
        Math.min(retangulo.right - 208, window.innerWidth - 216),
      ),

      top:
        retangulo.bottom + altura + 8 > window.innerHeight
          ? Math.max(8, retangulo.top - altura - 8)
          : retangulo.bottom + 8,
    });
  }

  function navegarMenu(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      fechar();
      return;
    }

    if (event.key === "Tab") {
      botaoRef.current?.focus();
      setPosicao(null);
      return;
    }

    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();

    const itens = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? [],
    );

    if (!itens.length) {
      return;
    }

    const atual = itens.indexOf(document.activeElement as HTMLButtonElement);

    const proximo =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? itens.length - 1
          : (atual + (event.key === "ArrowDown" ? 1 : -1) + itens.length) %
            itens.length;

    itens[proximo]?.focus();
  }

  if (!acoes.length) {
    return null;
  }

  return (
    <>
      <button
        ref={botaoRef}
        type="button"
        aria-label={`Ações de ${nome}`}
        aria-haspopup="menu"
        aria-expanded={posicao !== null}
        aria-controls={posicao ? id : undefined}
        onClick={alternar}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      >
        <MoreHorizontal size={20} />
      </button>

      {posicao &&
        createPortal(
          <div
            ref={menuRef}
            id={id}
            role="menu"
            aria-label={`Ações de ${nome}`}
            onKeyDown={navegarMenu}
            style={posicao}
            className="fixed z-[70] max-h-[calc(100vh-16px)] w-52 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
          >
            {acoes.map(({ titulo, icone: Icone, executar, perigo }) => (
              <button
                key={titulo}
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={() => {
                  fechar();
                  executar();
                }}
                className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm outline-none ${
                  perigo
                    ? "text-red-600 hover:bg-red-50 focus:bg-red-50"
                    : "text-slate-700 hover:bg-slate-100 focus:bg-slate-100"
                }`}
              >
                <Icone size={17} className="shrink-0" />
                {titulo}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

interface EquipmentTableProps {
  equipamentos: Equipamento[];
  onEdit?: (equipamento: Equipamento) => void;
  onDelete?: (equipamento: Equipamento) => void;
  onHardware?: (equipamento: Equipamento) => void;
  onPecas?: (equipamento: Equipamento) => void;
  onMaintenance?: (equipamento: Equipamento) => void;
}

export function EquipmentTable({
  equipamentos,
  onEdit,
  onDelete,
  onHardware,
  onMaintenance,
  onPecas,
}: EquipmentTableProps) {
  function acoesDoEquipamento(equipamento: Equipamento): Acao[] {
    const acoes: Acao[] = [];

    if (
      onPecas &&
      ["PECAS", "COMPUTADORES"].includes(obterGrupo(equipamento.categoria))
    ) {
      acoes.push({
        titulo: equipamento.instaladoEmId
          ? "Retirar peça"
          : obterGrupo(equipamento.categoria) === "PECAS"
            ? "Instalar peça"
            : "Instalar ou trocar peça",
        icone: Cpu,
        executar: () => onPecas(equipamento),
      });
    }
    if (onHardware) {
      acoes.push({
        titulo: "Detalhes e hardware",
        icone: Cpu,
        executar: () => onHardware(equipamento),
      });
    }

    if (onMaintenance) {
      acoes.push({
        titulo: "Manutenção",
        icone: Wrench,
        executar: () => onMaintenance(equipamento),
      });
    }

    if (onEdit) {
      acoes.push({
        titulo: "Editar",
        icone: Pencil,
        executar: () => onEdit(equipamento),
      });
    }

    if (onDelete) {
      acoes.push({
        titulo: "Excluir",
        icone: Trash2,
        executar: () => onDelete(equipamento),
        perigo: true,
      });
    }

    return acoes;
  }

  function identificarEquipamento(equipamento: Equipamento) {
    const descricao = [equipamento.fabricante, equipamento.modelo]
      .filter(Boolean)
      .join(" · ");

    return (
      <div className="flex min-w-0 items-start gap-3">
        <MiniaturaEquipamento
          key={`${equipamento.id}-${
            equipamento.fotos?.[0]?.nomeArquivo ?? "sem-foto"
          }`}
          equipamento={equipamento}
        />

        <div className="min-w-0 space-y-1">
          {onHardware ? (
            <button
              type="button"
              onClick={() => onHardware(equipamento)}
              className="break-words text-left font-semibold text-slate-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              {equipamento.nome}
            </button>
          ) : (
            <p className="break-words font-semibold text-slate-900">
              {equipamento.nome}
            </p>
          )}

          {equipamento.instaladoEmId && (
            <p className="text-xs text-indigo-700">
              Instalada no computador #{equipamento.instaladoEmId}
            </p>
          )}
          {descricao && (
            <p className="break-words text-sm text-slate-500">{descricao}</p>
          )}

          <p className="text-xs text-slate-500">
            {equipamento.categoria?.nome || "Sem categoria"}
          </p>
        </div>
      </div>
    );
  }

  if (!equipamentos.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <p className="font-semibold text-slate-800">
          Nenhum equipamento encontrado
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Ajuste o grupo, a pesquisa ou os filtros para ver outros itens.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Celular e tablet */}
      <div className="space-y-3 lg:hidden">
        {equipamentos.map((equipamento) => (
          <article
            key={equipamento.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              {identificarEquipamento(equipamento)}

              <div className="shrink-0">
                <MenuAcoes
                  nome={equipamento.nome}
                  acoes={acoesDoEquipamento(equipamento)}
                />
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Patrimônio</dt>
                <dd className="mt-1 break-words font-medium text-slate-800">
                  {equipamento.patrimonio || "Não informado"}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-slate-500">Status</dt>
                <dd className="mt-1">
                  <Badge status={equipamento.status} />
                </dd>
              </div>

              <div>
                <dt className="text-xs text-slate-500">Responsável</dt>
                <dd className="mt-1 break-words text-slate-700">
                  {equipamento.responsavel?.nome || "Sem responsável"}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-slate-500">Localização</dt>
                <dd className="mt-1 break-words text-slate-700">
                  {equipamento.localizacao?.nome || "Não informada"}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      {/* Computador */}
      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
        <table className="w-full min-w-[900px] text-left text-sm">
          <caption className="sr-only">Equipamentos encontrados</caption>

          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-4 font-medium">
                Equipamento
              </th>
              <th scope="col" className="px-4 py-4 font-medium">
                Patrimônio
              </th>
              <th scope="col" className="px-4 py-4 font-medium">
                Responsável
              </th>
              <th scope="col" className="px-4 py-4 font-medium">
                Localização
              </th>
              <th scope="col" className="px-4 py-4 font-medium">
                Status
              </th>
              <th scope="col" className="px-5 py-4 text-right font-medium">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {equipamentos.map((equipamento) => (
              <tr
                key={equipamento.id}
                className="text-slate-700 transition-colors hover:bg-slate-50/70"
              >
                <td className="min-w-64 max-w-sm px-5 py-4">
                  {identificarEquipamento(equipamento)}
                </td>

                <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-800">
                  {equipamento.patrimonio || "—"}
                </td>

                <td className="max-w-48 break-words px-4 py-4">
                  {equipamento.responsavel?.nome || "Sem responsável"}
                </td>

                <td className="max-w-48 break-words px-4 py-4">
                  {equipamento.localizacao?.nome || "Não informada"}
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <Badge status={equipamento.status} />
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end">
                    <MenuAcoes
                      nome={equipamento.nome}
                      acoes={acoesDoEquipamento(equipamento)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
