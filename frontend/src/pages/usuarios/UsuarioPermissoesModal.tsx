import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { LoaderCircle, Save, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";

import {
  permissaoService,
  type GrupoPermissoes,
} from "../../services/permissaoService";

interface Props {
  usuario: {
    id: number;
    nome: string;
    perfil: string;
  };
  onFechar: () => void;
}

function obterErro(error: unknown, padrao: string) {
  if (
    axios.isAxiosError<{
      mensagem?: string;
      message?: string;
    }>(error)
  ) {
    return (
      error.response?.data?.mensagem || error.response?.data?.message || padrao
    );
  }

  return padrao;
}

export function UsuarioPermissoesModal({ usuario, onFechar }: Props) {
  const [grupos, setGrupos] = useState<GrupoPermissoes[]>([]);
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erroCarga, setErroCarga] = useState("");
  const [erroSalvar, setErroSalvar] = useState("");
  const [tentativa, setTentativa] = useState(0);

  const enviando = useRef(false);
  const dialogoRef = useRef<HTMLDialogElement>(null);

  const administrador = usuario.perfil === "ADMIN";
  const bloqueado =
    administrador || carregando || salvando || Boolean(erroCarga);

  useEffect(() => {
    const dialogo = dialogoRef.current;
    const elementoAnterior = document.activeElement;

    dialogo?.showModal();

    return () => {
      dialogo?.close();

      if (elementoAnterior instanceof HTMLElement) {
        elementoAnterior.focus();
      }
    };
  }, []);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setCarregando(true);
      setErroCarga("");
      setErroSalvar("");
      setSelecionadas([]);

      try {
        const [catalogo, dados] = await Promise.all([
          permissaoService.catalogo(),
          permissaoService.buscar(usuario.id),
        ]);

        if (!ativo) return;

        setGrupos(catalogo);
        setSelecionadas(dados.permissoes);
      } catch (error) {
        if (ativo) {
          setErroCarga(
            obterErro(error, "Não foi possível carregar as permissões."),
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, [usuario.id, tentativa]);

  function fechar() {
    if (!enviando.current) onFechar();
  }

  function alterarPermissao(chave: string, marcada: boolean) {
    if (bloqueado) return;

    setErroSalvar("");

    setSelecionadas((anteriores) =>
      marcada
        ? [...new Set([...anteriores, chave])]
        : anteriores.filter((item) => item !== chave),
    );
  }

  function alterarGrupo(grupo: GrupoPermissoes, marcado: boolean) {
    if (bloqueado) return;

    const chaves = grupo.permissoes.map((item) => item.chave);

    setErroSalvar("");

    setSelecionadas((anteriores) =>
      marcado
        ? [...new Set([...anteriores, ...chaves])]
        : anteriores.filter((item) => !chaves.includes(item)),
    );
  }

  async function salvar() {
    if (bloqueado || enviando.current) return;

    enviando.current = true;
    setSalvando(true);
    setErroSalvar("");

    try {
      await permissaoService.atualizar(usuario.id, selecionadas);
    } catch (error) {
      setErroSalvar(obterErro(error, "Não foi possível salvar as permissões."));
      return;
    } finally {
      enviando.current = false;
      setSalvando(false);
    }

    toast.success("Permissões salvas.");
    onFechar();
  }

  return (
    <dialog
      ref={dialogoRef}
      aria-labelledby="titulo-permissoes"
      onCancel={(event) => {
        event.preventDefault();
        fechar();
      }}
      className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-2xl bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/50"
    >
      <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
            <ShieldCheck size={24} />
          </div>

          <div>
            <h2 id="titulo-permissoes" className="text-lg font-semibold">
              Permissões do usuário
            </h2>
            <p className="mt-1 text-sm text-slate-500">{usuario.nome}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={fechar}
          disabled={salvando}
          aria-label="Fechar permissões"
          className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-40"
        >
          <X size={20} />
        </button>
      </header>

      <div className="space-y-4 p-5">
        {administrador && (
          <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
            Administradores possuem acesso completo. As permissões individuais
            podem ser configuradas nos demais perfis.
          </p>
        )}

        {carregando ? (
          <p role="status" className="py-8 text-center text-slate-500">
            Carregando permissões...
          </p>
        ) : erroCarga ? (
          <div role="alert" className="rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-700">{erroCarga}</p>
            <button
              type="button"
              onClick={() => setTentativa((valor) => valor + 1)}
              className="mt-3 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            {!administrador && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                  {selecionadas.length} permissão(ões) selecionada(s)
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={bloqueado}
                    onClick={() => {
                      setErroSalvar("");
                      setSelecionadas(
                        grupos.flatMap((grupo) =>
                          grupo.permissoes.map((item) => item.chave),
                        ),
                      );
                    }}
                    className="text-sm font-medium text-blue-700 disabled:opacity-40"
                  >
                    Marcar todas
                  </button>

                  <button
                    type="button"
                    disabled={bloqueado}
                    onClick={() => {
                      setErroSalvar("");
                      setSelecionadas([]);
                    }}
                    className="text-sm font-medium text-slate-600 disabled:opacity-40"
                  >
                    Desmarcar todas
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {grupos.map((grupo) => {
                const todasMarcadas = grupo.permissoes.every((item) =>
                  selecionadas.includes(item.chave),
                );

                return (
                  <fieldset
                    key={grupo.chave}
                    disabled={bloqueado}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <legend className="px-1 text-sm font-semibold">
                      {grupo.nome}
                    </legend>

                    <label className="mb-3 flex cursor-pointer items-center gap-2 border-b border-slate-100 pb-3 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={todasMarcadas}
                        onChange={(event) =>
                          alterarGrupo(grupo, event.target.checked)
                        }
                        className="h-4 w-4 accent-blue-600"
                      />
                      Todas deste módulo
                    </label>

                    <div className="space-y-3">
                      {grupo.permissoes.map((permissao) => (
                        <label
                          key={permissao.chave}
                          className="flex cursor-pointer items-start gap-2 text-sm text-slate-600"
                        >
                          <input
                            type="checkbox"
                            checked={selecionadas.includes(permissao.chave)}
                            onChange={(event) =>
                              alterarPermissao(
                                permissao.chave,
                                event.target.checked,
                              )
                            }
                            className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
                          />
                          {permissao.nome}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                );
              })}
            </div>
          </>
        )}

        {erroSalvar && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {erroSalvar}
          </p>
        )}
      </div>

      <footer className="flex justify-end gap-3 border-t border-slate-200 p-5">
        <button
          type="button"
          onClick={fechar}
          disabled={salvando}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium disabled:opacity-40"
        >
          {administrador ? "Fechar" : "Cancelar"}
        </button>

        {!administrador && (
          <button
            type="button"
            onClick={() => void salvar()}
            disabled={bloqueado}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-40"
          >
            {salvando ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Save size={17} />
            )}

            {salvando ? "Salvando..." : "Salvar permissões"}
          </button>
        )}
      </footer>
    </dialog>
  );
}
