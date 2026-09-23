import { useEffect, useState } from "react";

import { pecasService, type ItemPeca } from "../../services/pecasService";

import { useAuth } from "../../hooks/useAuth";
import { Button } from "../Button";
import { Card } from "../Card";
import { PecasModal } from "./PecasModal";

interface PecasComputadorProps {
  computadorId: number;
  onSucesso: () => void | Promise<void>;
}

interface OperacaoPeca {
  retiradaId?: number;
}

export function PecasComputador(props: PecasComputadorProps) {
  const { temTodasPermissoes } = useAuth();

  const podeVisualizar = temTodasPermissoes(
    "equipamentos.visualizar",
    "pecas.visualizar",
  );

  const podeMovimentar = temTodasPermissoes(
    "equipamentos.visualizar",
    "pecas.visualizar",
    "pecas.movimentar",
    "manutencoes.visualizar",
    "manutencoes.abrir",
  );

  if (!podeVisualizar) {
    return null;
  }

  return (
    <ListaPecasComputador
      key={`${props.computadorId}-${podeMovimentar}`}
      {...props}
      podeMovimentar={podeMovimentar}
    />
  );
}

function ListaPecasComputador({
  computadorId,
  onSucesso,
  podeMovimentar,
}: PecasComputadorProps & {
  podeMovimentar: boolean;
}) {
  const [pecas, setPecas] = useState<ItemPeca[]>([]);
  const [erro, setErro] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [versao, setVersao] = useState(0);
  const [operacao, setOperacao] = useState<OperacaoPeca | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setCarregando(true);
      setErro(false);

      try {
        const dados = await pecasService.opcoes();

        if (ativo) {
          setPecas(
            dados.pecas.filter((peca) => peca.instaladoEmId === computadorId),
          );
        }
      } catch (error) {
        if (ativo) {
          console.error("Erro ao carregar peças:", error);
          setPecas([]);
          setErro(true);
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
  }, [computadorId, versao]);

  function abrirOperacao(dados: OperacaoPeca) {
    if (!podeMovimentar) return;

    setOperacao(dados);
  }

  async function concluirOperacao() {
    setOperacao(null);
    setVersao((valor) => valor + 1);
    await onSucesso();
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Peças instaladas da reserva</h2>

          <p className="text-sm text-slate-500">
            Itens do CPD vinculados a este computador.
          </p>
        </div>

        {podeMovimentar && (
          <Button type="button" onClick={() => abrirOperacao({})}>
            Instalar ou trocar peça
          </Button>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {carregando ? (
          <p className="text-sm text-slate-500">Carregando peças...</p>
        ) : erro ? (
          <Button
            variant="secondary"
            onClick={() => setVersao((valor) => valor + 1)}
          >
            Falha ao carregar. Tentar novamente
          </Button>
        ) : pecas.length === 0 ? (
          <p className="text-sm text-slate-500">
            Nenhuma peça da reserva instalada. Os componentes originais podem
            continuar descritos em Hardware.
          </p>
        ) : (
          pecas.map((peca) => (
            <div
              key={peca.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3"
            >
              <div>
                <p className="font-medium">{peca.nome}</p>

                <p className="text-xs text-slate-500">
                  {peca.patrimonio || `ID ${peca.id}`}
                </p>
              </div>

              {podeMovimentar && (
                <Button
                  variant="secondary"
                  onClick={() => abrirOperacao({ retiradaId: peca.id })}
                >
                  Retirar peça
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      {podeMovimentar && operacao && (
        <PecasModal
          computadorId={computadorId}
          {...operacao}
          onFechar={() => setOperacao(null)}
          onSucesso={concluirOperacao}
        />
      )}
    </Card>
  );
}
