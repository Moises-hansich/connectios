import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  Image as ImageIcon,
  LoaderCircle,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { AuthContext } from "../../contexts/AuthContext";
import { api } from "../../services/api";
import {
  fotoEquipamentoService,
  type FotoEquipamento,
} from "../../services/fotoEquipamentoService";
import { Card } from "../Card";
import { ConfirmModal } from "../ConfirmModal";

interface FotoEquipamentoGalleryProps {
  equipamentoId: number;
}

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANHO_MAXIMO = 5 * 1024 * 1024;
const LIMITE_POR_ENVIO = 5;

function obterOrigemBackend() {
  const baseURL = api.defaults.baseURL;

  if (baseURL && /^https?:\/\//i.test(baseURL)) {
    return new URL(baseURL).origin;
  }

  return `${window.location.protocol}//${window.location.hostname}:3000`;
}

function obterUrlFoto(nomeArquivo: string) {
  return `${obterOrigemBackend()}/uploads/equipamentos/${encodeURIComponent(
    nomeArquivo,
  )}`;
}

function obterMensagemErro(error: unknown, mensagemPadrao: string) {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return mensagemPadrao;
  }

  const response = (
    error as {
      response?: {
        data?: {
          message?: string;
          mensagem?: string;
        };
      };
    }
  ).response;

  return response?.data?.message ?? response?.data?.mensagem ?? mensagemPadrao;
}

export function FotoEquipamentoGallery({
  equipamentoId,
}: FotoEquipamentoGalleryProps) {
  const auth = useContext(AuthContext);
  const inputRef = useRef<HTMLInputElement>(null);

  const [fotos, setFotos] = useState<FotoEquipamento[]>([]);
  const [arquivosSelecionados, setArquivosSelecionados] = useState<File[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [fotoEmProcessamento, setFotoEmProcessamento] = useState<number | null>(
    null,
  );
  const [fotoExcluir, setFotoExcluir] = useState<FotoEquipamento | null>(null);

  const usuarioAdmin = auth?.usuario?.perfil === "ADMIN";

  const carregarFotos = useCallback(async () => {
    try {
      setCarregando(true);
      setErro("");

      const dados = await fotoEquipamentoService.listar(equipamentoId);
      setFotos(dados);
    } catch (error) {
      console.error("Erro ao carregar fotos do equipamento:", error);
      setErro(obterMensagemErro(error, "Não foi possível carregar as fotos."));
    } finally {
      setCarregando(false);
    }
  }, [equipamentoId]);

  useEffect(() => {
    void carregarFotos();
  }, [carregarFotos]);

  function limparSelecao() {
    setArquivosSelecionados([]);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function selecionarArquivos(event: ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(event.target.files ?? []);

    if (!arquivos.length) {
      limparSelecao();
      return;
    }

    if (arquivos.length > LIMITE_POR_ENVIO) {
      toast.error(`Selecione no máximo ${LIMITE_POR_ENVIO} fotos por envio.`);
      limparSelecao();
      return;
    }

    const arquivoFormatoInvalido = arquivos.find(
      (arquivo) => !TIPOS_PERMITIDOS.includes(arquivo.type),
    );

    if (arquivoFormatoInvalido) {
      toast.error("Use somente imagens JPG, PNG ou WebP.");
      limparSelecao();
      return;
    }

    const arquivoMuitoGrande = arquivos.find(
      (arquivo) => arquivo.size > TAMANHO_MAXIMO,
    );

    if (arquivoMuitoGrande) {
      toast.error("Cada foto pode ter no máximo 5 MB.");
      limparSelecao();
      return;
    }

    setArquivosSelecionados(arquivos);
  }

  async function enviarFotos() {
    if (!arquivosSelecionados.length) {
      toast.error("Selecione pelo menos uma foto.");
      return;
    }

    try {
      setEnviando(true);

      await fotoEquipamentoService.adicionar(
        equipamentoId,
        arquivosSelecionados,
      );

      toast.success(
        arquivosSelecionados.length === 1
          ? "Foto adicionada com sucesso."
          : "Fotos adicionadas com sucesso.",
      );

      limparSelecao();
      await carregarFotos();
    } catch (error) {
      console.error("Erro ao enviar fotos do equipamento:", error);
      toast.error(
        obterMensagemErro(error, "Não foi possível enviar as fotos."),
      );
    } finally {
      setEnviando(false);
    }
  }

  async function definirFotoPrincipal(foto: FotoEquipamento) {
    if (foto.principal) {
      return;
    }

    try {
      setFotoEmProcessamento(foto.id);
      await fotoEquipamentoService.definirPrincipal(equipamentoId, foto.id);
      toast.success("Foto principal atualizada.");
      await carregarFotos();
    } catch (error) {
      console.error("Erro ao definir foto principal:", error);
      toast.error(
        obterMensagemErro(error, "Não foi possível definir a foto principal."),
      );
    } finally {
      setFotoEmProcessamento(null);
    }
  }

  async function confirmarExclusao() {
    if (!fotoExcluir) {
      return;
    }

    try {
      setFotoEmProcessamento(fotoExcluir.id);
      await fotoEquipamentoService.excluir(equipamentoId, fotoExcluir.id);
      toast.success("Foto excluída com sucesso.");
      setFotoExcluir(null);
      await carregarFotos();
    } catch (error) {
      console.error("Erro ao excluir foto:", error);
      toast.error(obterMensagemErro(error, "Não foi possível excluir a foto."));
    } finally {
      setFotoEmProcessamento(null);
    }
  }

  return (
    <>
      <Card>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Fotos do equipamento</h2>
            <p className="text-sm text-gray-500">
              {fotos.length}{" "}
              {fotos.length === 1 ? "foto cadastrada" : "fotos cadastradas"}
            </p>
          </div>

          {usuarioAdmin && (
            <div className="flex flex-col gap-2 sm:items-end">
              <div className="flex flex-wrap gap-2">
                <label
                  className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 ${
                    enviando ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  <ImageIcon size={18} />
                  Selecionar fotos
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    disabled={enviando}
                    onChange={selecionarArquivos}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  disabled={!arquivosSelecionados.length || enviando}
                  onClick={enviarFotos}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {enviando ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <Upload size={18} />
                  )}
                  {enviando ? "Enviando..." : "Enviar"}
                </button>
              </div>

              {arquivosSelecionados.length > 0 && (
                <p className="text-xs text-slate-500">
                  {arquivosSelecionados.length}{" "}
                  {arquivosSelecionados.length === 1
                    ? "arquivo selecionado"
                    : "arquivos selecionados"}
                </p>
              )}
            </div>
          )}
        </div>

        {carregando ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, indice) => (
              <div
                key={indice}
                className="aspect-[4/3] animate-pulse rounded-xl bg-slate-200"
              />
            ))}
          </div>
        ) : erro ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center">
            <p className="mb-3 text-sm text-red-700">{erro}</p>
            <button
              type="button"
              onClick={() => void carregarFotos()}
              className="text-sm font-semibold text-red-700 underline underline-offset-2"
            >
              Tentar novamente
            </button>
          </div>
        ) : fotos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 px-4 py-12 text-center text-slate-500">
            <ImageIcon className="mx-auto mb-3 text-slate-400" size={36} />
            <p>Nenhuma foto cadastrada para este equipamento.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {fotos.map((foto) => {
              const processando = fotoEmProcessamento === foto.id;

              return (
                <article
                  key={foto.id}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <a
                    href={obterUrlFoto(foto.nomeArquivo)}
                    target="_blank"
                    rel="noreferrer"
                    className="relative block aspect-[4/3] overflow-hidden bg-slate-100"
                    title="Abrir foto em tamanho original"
                  >
                    <img
                      src={obterUrlFoto(foto.nomeArquivo)}
                      alt={foto.nomeOriginal}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {foto.principal && (
                      <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-semibold text-amber-950 shadow-sm">
                        <Star size={13} fill="currentColor" />
                        Principal
                      </span>
                    )}
                  </a>

                  <div className="flex items-center justify-between gap-2 p-3">
                    <p
                      className="min-w-0 flex-1 truncate text-sm text-slate-600"
                      title={foto.nomeOriginal}
                    >
                      {foto.nomeOriginal}
                    </p>

                    {usuarioAdmin && (
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          disabled={foto.principal || processando}
                          onClick={() => void definirFotoPrincipal(foto)}
                          className="rounded-lg p-2 text-amber-600 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
                          title={
                            foto.principal
                              ? "Esta já é a foto principal"
                              : "Definir como principal"
                          }
                          aria-label="Definir como foto principal"
                        >
                          {processando ? (
                            <LoaderCircle size={17} className="animate-spin" />
                          ) : (
                            <Star size={17} />
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={processando}
                          onClick={() => setFotoExcluir(foto)}
                          className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                          title="Excluir foto"
                          aria-label="Excluir foto"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Card>

      <ConfirmModal
        aberto={Boolean(fotoExcluir)}
        titulo="Excluir foto"
        mensagem={
          fotoExcluir
            ? `Deseja realmente excluir a foto "${fotoExcluir.nomeOriginal}"?`
            : ""
        }
        carregando={
          fotoExcluir !== null && fotoEmProcessamento === fotoExcluir.id
        }
        onCancel={() => setFotoExcluir(null)}
        onConfirm={confirmarExclusao}
      />
    </>
  );
}
