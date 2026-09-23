import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import { Select } from "../Select";
import { Button } from "../Button";
import { Input } from "../Input";

import { useAuth } from "../../hooks/useAuth";

import { categoriaService } from "../../services/categoriaService";
import { equipamentoService } from "../../services/equipamentoService";
import { localizacaoService } from "../../services/localizacaoService";
import { colaboradorService } from "../../services/colaboradorService";
import { empresaService } from "../../services/empresaService";
import { zabbixService, type ZabbixHost } from "../../services/zabbixService";

import type {
  Categoria,
  CriarEquipamentoData,
  Equipamento,
} from "../../types/equipamento";

import type { Empresa } from "../../types/empresa";

interface EquipmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  modo: "criar" | "editar";
  equipamento?: Equipamento;
}

interface LocalizacaoOption {
  id: number;
  nome: string;
}

interface ColaboradorOption {
  id: number;
  nome: string;
  ativo?: boolean;
}

interface FormData {
  nome: string;
  categoriaId: string;
  fabricante: string;
  modelo: string;
  numeroSerie: string;
  patrimonio: string;
  zabbixHostId: string;
  status: string;
  localizacaoId: string;
  responsavelId: string;
  fornecedorId: string;
  dataCompra: string;
  garantiaAte: string;
  observacoes: string;
}

interface ApiErrorResponse {
  message?: string;
  mensagem?: string;
  errors?: Array<{
    campo?: string;
    mensagem?: string;
    message?: string;
  }>;
}

function formatarDataParaInput(valor: string | null | undefined): string {
  return valor ? valor.slice(0, 10) : "";
}

function criarEstadoInicial(equipamento?: Equipamento): FormData {
  return {
    nome: equipamento?.nome ?? "",
    categoriaId: equipamento?.categoriaId?.toString() ?? "",
    fabricante: equipamento?.fabricante ?? "",
    modelo: equipamento?.modelo ?? "",
    numeroSerie: equipamento?.numeroSerie ?? "",
    patrimonio: equipamento?.patrimonio ?? "",
    zabbixHostId: equipamento?.zabbixHostId ?? "",
    status: equipamento?.status ?? "Disponível",
    localizacaoId: equipamento?.localizacaoId?.toString() ?? "",
    responsavelId: equipamento?.responsavelId?.toString() ?? "",
    fornecedorId: equipamento?.fornecedorId?.toString() ?? "",
    dataCompra: formatarDataParaInput(equipamento?.dataCompra),
    garantiaAte: formatarDataParaInput(equipamento?.garantiaAte),
    observacoes: equipamento?.observacoes ?? "",
  };
}

function obterMensagemErro(error: unknown, mensagemPadrao: string): string {
  if (!isAxiosError<ApiErrorResponse>(error)) {
    return mensagemPadrao;
  }

  const resposta = error.response?.data;
  const primeiroErro = resposta?.errors?.[0];

  return (
    primeiroErro?.mensagem ??
    primeiroErro?.message ??
    resposta?.message ??
    resposta?.mensagem ??
    mensagemPadrao
  );
}

export function EquipmentForm({
  onSuccess,
  onCancel,
  modo,
  equipamento,
}: EquipmentFormProps) {
  const {
    autenticado,
    carregando: carregandoAuth,
    carregandoPermissoes,
    erroPermissoes,
    temPermissao,
    temTodasPermissoes,
  } = useAuth();

  const permissoesProntas =
    autenticado && !carregandoAuth && !carregandoPermissoes && !erroPermissoes;

  const podeSalvar =
    permissoesProntas &&
    temTodasPermissoes(
      "equipamentos.visualizar",
      modo === "editar" ? "equipamentos.editar" : "equipamentos.criar",
    );

  const podeVerEmpresas =
    permissoesProntas && temPermissao("empresas.visualizar");

  const [formData, setFormData] = useState<FormData>(() =>
    criarEstadoInicial(equipamento),
  );

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [localizacoes, setLocalizacoes] = useState<LocalizacaoOption[]>([]);
  const [colaboradores, setColaboradores] = useState<ColaboradorOption[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [hostsZabbix, setHostsZabbix] = useState<ZabbixHost[]>([]);

  const [carregandoDados, setCarregandoDados] = useState(true);
  const [carregandoEmpresas, setCarregandoEmpresas] = useState(true);
  const [erroEmpresas, setErroEmpresas] = useState("");

  const [salvando, setSalvando] = useState(false);
  const salvandoRef = useRef(false);

  useEffect(() => {
    setFormData(criarEstadoInicial(equipamento));
  }, [equipamento, modo]);

  useEffect(() => {
    if (!podeSalvar) {
      return;
    }

    let ativo = true;

    async function carregar<T>(
      consulta: () => Promise<T>,
      aplicar: (dados: T) => void,
      mensagem: string,
    ) {
      try {
        const dados = await consulta();

        if (ativo) {
          aplicar(dados);
        }
      } catch (error) {
        if (ativo) {
          toast.error(obterMensagemErro(error, mensagem));
        }
      }
    }

    async function carregarOpcoes() {
      setCarregandoDados(true);

      await Promise.all([
        carregar(
          () => categoriaService.listarAtivas(),
          (dados) => setCategorias(Array.isArray(dados) ? dados : []),
          "Não foi possível carregar as categorias.",
        ),

        carregar(
          () => localizacaoService.listar(),
          (dados) => {
            const lista = Array.isArray(dados) ? dados : [];

            setLocalizacoes(
              lista.map((localizacao) => ({
                id: localizacao.id,
                nome: localizacao.nome,
              })),
            );
          },
          "Não foi possível carregar as localizações.",
        ),

        carregar(
          () => colaboradorService.listar(),
          (dados) => {
            const lista = Array.isArray(dados) ? dados : [];

            setColaboradores(
              lista
                .filter((colaborador) => colaborador.ativo !== false)
                .map((colaborador) => ({
                  id: colaborador.id,
                  nome: colaborador.nome,
                  ativo: colaborador.ativo,
                })),
            );
          },
          "Não foi possível carregar os colaboradores.",
        ),

        carregar(
          () => zabbixService.listarHosts(),
          (dados) => setHostsZabbix(dados),
          "Não foi possível carregar os computadores do Zabbix.",
        ),
      ]);

      if (ativo) {
        setCarregandoDados(false);
      }
    }

    void carregarOpcoes();

    return () => {
      ativo = false;
    };
  }, [podeSalvar]);

  useEffect(() => {
    if (!podeSalvar || !podeVerEmpresas) {
      setEmpresas([]);
      setErroEmpresas("");
      setCarregandoEmpresas(false);
      return;
    }

    let ativo = true;

    async function carregarEmpresas() {
      setCarregandoEmpresas(true);
      setErroEmpresas("");

      try {
        const dados = await empresaService.listarAtivas();

        if (ativo) {
          setEmpresas(Array.isArray(dados) ? dados : []);
        }
      } catch (error) {
        if (ativo) {
          setEmpresas([]);
          setErroEmpresas(
            obterMensagemErro(
              error,
              "Não foi possível carregar os fornecedores.",
            ),
          );
        }
      } finally {
        if (ativo) {
          setCarregandoEmpresas(false);
        }
      }
    }

    void carregarEmpresas();

    return () => {
      ativo = false;
    };
  }, [podeSalvar, podeVerEmpresas]);

  const podeAlterarFornecedor =
    podeVerEmpresas && !carregandoEmpresas && !erroEmpresas;

  // Sem acesso à lista, preserva o fornecedor original na edição.
  const fornecedorEfetivo = podeAlterarFornecedor
    ? formData.fornecedorId
    : modo === "editar"
      ? (equipamento?.fornecedorId?.toString() ?? "")
      : "";

  function handleChange(campo: keyof FormData, valor: string) {
    if (campo === "fornecedorId" && !podeAlterarFornecedor) {
      return;
    }

    setFormData((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: valor,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (salvandoRef.current || carregandoDados || carregandoEmpresas) {
      return;
    }

    if (!podeSalvar) {
      toast.error("Você não possui permissão para salvar este equipamento.");
      return;
    }

    if (modo === "editar" && !equipamento) {
      toast.error("Equipamento não informado para edição.");
      return;
    }

    if (formData.nome.trim().length < 3) {
      toast.error("O nome deve possuir pelo menos 3 caracteres.");
      return;
    }

    const categoriaId = Number(formData.categoriaId);

    if (!Number.isSafeInteger(categoriaId) || categoriaId <= 0) {
      toast.error("Selecione uma categoria válida.");
      return;
    }

    const localizacaoId =
      formData.localizacaoId === "" ? null : Number(formData.localizacaoId);

    const responsavelId =
      formData.responsavelId === "" ? null : Number(formData.responsavelId);

    const fornecedorId =
      fornecedorEfetivo === "" ? null : Number(fornecedorEfetivo);

    if (
      localizacaoId !== null &&
      (!Number.isSafeInteger(localizacaoId) || localizacaoId <= 0)
    ) {
      toast.error("Selecione uma localização válida.");
      return;
    }

    if (
      responsavelId !== null &&
      (!Number.isSafeInteger(responsavelId) || responsavelId <= 0)
    ) {
      toast.error("Selecione um responsável válido.");
      return;
    }

    if (
      fornecedorId !== null &&
      (!Number.isSafeInteger(fornecedorId) || fornecedorId <= 0)
    ) {
      toast.error("Selecione um fornecedor válido.");
      return;
    }

    if (
      formData.dataCompra &&
      formData.garantiaAte &&
      formData.garantiaAte < formData.dataCompra
    ) {
      toast.error("A data da garantia não pode ser anterior à data da compra.");
      return;
    }

    if (formData.garantiaAte && fornecedorId === null) {
      toast.error(
        podeAlterarFornecedor
          ? "Selecione o fornecedor responsável pela garantia."
          : "Para informar uma garantia, é necessário ter um fornecedor vinculado. Solicite a vinculação a um usuário autorizado.",
      );
      return;
    }

    const dados: CriarEquipamentoData = {
      nome: formData.nome.trim(),
      categoriaId,
      fabricante: formData.fabricante.trim() || null,
      modelo: formData.modelo.trim() || null,
      numeroSerie: formData.numeroSerie.trim() || null,
      patrimonio: formData.patrimonio.trim() || null,
      zabbixHostId: formData.zabbixHostId.trim() || null,
      status: formData.status.trim(),
      localizacaoId,
      responsavelId,
      fornecedorId,
      dataCompra: formData.dataCompra || null,
      garantiaAte: formData.garantiaAte || null,
      observacoes: formData.observacoes.trim() || null,
    };

    salvandoRef.current = true;
    setSalvando(true);

    try {
      if (modo === "editar" && equipamento) {
        await equipamentoService.atualizar(equipamento.id, dados);
        toast.success("Equipamento atualizado com sucesso.");
      } else {
        await equipamentoService.criar(dados);
        toast.success("Equipamento cadastrado com sucesso.");
      }

      onSuccess();
    } catch (error) {
      toast.error(
        obterMensagemErro(
          error,
          modo === "editar"
            ? "Não foi possível atualizar o equipamento."
            : "Não foi possível cadastrar o equipamento.",
        ),
      );
    } finally {
      salvandoRef.current = false;
      setSalvando(false);
    }
  }

  const categoriasDisponiveis =
    equipamento?.categoria &&
    !categorias.some((categoria) => categoria.id === equipamento.categoria?.id)
      ? [equipamento.categoria, ...categorias]
      : categorias;

  const empresasDisponiveis =
    equipamento?.fornecedor &&
    !empresas.some((empresa) => empresa.id === equipamento.fornecedor?.id)
      ? [equipamento.fornecedor, ...empresas]
      : empresas;

  const fornecedorForaDaLista =
    fornecedorEfetivo !== "" &&
    !empresasDisponiveis.some(
      (empresa) => String(empresa.id) === fornecedorEfetivo,
    );

  const formularioDesabilitado =
    salvando || carregandoDados || carregandoEmpresas || !podeSalvar;

  if (carregandoAuth || carregandoPermissoes) {
    return (
      <p className="py-6 text-center text-sm text-slate-500">
        Verificando permissões...
      </p>
    );
  }

  if (!podeSalvar) {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600">
          {erroPermissoes
            ? "Não foi possível verificar suas permissões."
            : "Você não possui permissão para esta operação."}
        </p>

        <Button type="button" variant="secondary" onClick={onCancel}>
          Fechar
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome"
        required
        value={formData.nome}
        disabled={formularioDesabilitado}
        onChange={(event) => handleChange("nome", event.target.value)}
      />

      <Select
        label="Categoria"
        required
        value={formData.categoriaId}
        disabled={formularioDesabilitado}
        onChange={(event) => handleChange("categoriaId", event.target.value)}
      >
        <option value="">
          {carregandoDados
            ? "Carregando categorias..."
            : "Selecione uma categoria"}
        </option>

        {categoriasDisponiveis.map((categoria) => (
          <option key={categoria.id} value={String(categoria.id)}>
            {categoria.nome}
            {!categoria.ativo ? " (desativada)" : ""}
          </option>
        ))}
      </Select>

      <Input
        label="Fabricante"
        value={formData.fabricante}
        disabled={formularioDesabilitado}
        onChange={(event) => handleChange("fabricante", event.target.value)}
      />

      <Input
        label="Modelo"
        value={formData.modelo}
        disabled={formularioDesabilitado}
        onChange={(event) => handleChange("modelo", event.target.value)}
      />

      <Input
        label="Número de série"
        value={formData.numeroSerie}
        disabled={formularioDesabilitado}
        onChange={(event) => handleChange("numeroSerie", event.target.value)}
      />

      <Input
        label="Patrimônio"
        value={formData.patrimonio}
        disabled={formularioDesabilitado}
        onChange={(event) => handleChange("patrimonio", event.target.value)}
      />

      <Select
        label="Computador no Zabbix"
        value={formData.zabbixHostId}
        disabled={formularioDesabilitado}
        onChange={(event) => handleChange("zabbixHostId", event.target.value)}
      >
        <option value="">
          {carregandoDados
            ? "Carregando computadores..."
            : "Sem vínculo com o Zabbix"}
        </option>

        {formData.zabbixHostId &&
          !hostsZabbix.some(
            (host) => host.hostid === formData.zabbixHostId,
          ) && (
            <option value={formData.zabbixHostId}>
              Vínculo atual — {formData.zabbixHostId}
            </option>
          )}

        {hostsZabbix.map((host) => (
          <option key={host.hostid} value={host.hostid}>
            {host.nome}
            {host.ips.length > 0 ? ` — ${host.ips.join(", ")}` : " — sem IP"}
          </option>
        ))}
      </Select>

      <Select
        label="Status"
        required
        value={formData.status}
        disabled={formularioDesabilitado}
        onChange={(event) => handleChange("status", event.target.value)}
      >
        {[
          ...new Set([
            "Disponível",
            "Em uso",
            "Em manutenção",
            "Reservado",
            "Baixado",
            formData.status,
          ]),
        ].map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </Select>

      <Input
        label="Data da compra"
        type="date"
        value={formData.dataCompra}
        disabled={formularioDesabilitado}
        onChange={(event) => handleChange("dataCompra", event.target.value)}
      />

      <Input
        label="Garantia até"
        type="date"
        value={formData.garantiaAte}
        min={formData.dataCompra || undefined}
        disabled={formularioDesabilitado}
        onChange={(event) => handleChange("garantiaAte", event.target.value)}
      />

      <div className="space-y-2">
        {podeVerEmpresas ? (
          <Select
            label="Fornecedor da garantia"
            value={fornecedorEfetivo}
            disabled={formularioDesabilitado || !podeAlterarFornecedor}
            onChange={(event) =>
              handleChange("fornecedorId", event.target.value)
            }
          >
            <option value="">
              {carregandoEmpresas
                ? "Carregando fornecedores..."
                : "Sem fornecedor"}
            </option>

            {fornecedorForaDaLista && (
              <option value={fornecedorEfetivo}>
                Fornecedor vinculado — ID {fornecedorEfetivo}
              </option>
            )}

            {empresasDisponiveis.map((empresa) => (
              <option key={empresa.id} value={String(empresa.id)}>
                {empresa.nome}
                {!empresa.ativo ? " (desativada)" : ""}
              </option>
            ))}
          </Select>
        ) : (
          <Select label="Fornecedor da garantia" value="" disabled>
            <option value="">
              {fornecedorEfetivo
                ? "Fornecedor vinculado — acesso restrito"
                : "Sem fornecedor"}
            </option>
          </Select>
        )}

        {!podeVerEmpresas && (
          <p className="text-xs text-slate-500">
            Você não possui permissão para consultar fornecedores.
            {modo === "editar" && " O vínculo atual será preservado."}
          </p>
        )}

        {erroEmpresas && (
          <p role="alert" className="text-xs text-red-600">
            {erroEmpresas} Feche e abra o formulário para tentar novamente.
            {modo === "editar" && " O vínculo atual será preservado."}
          </p>
        )}
      </div>

      <Select
        label="Localização"
        value={formData.localizacaoId}
        disabled={formularioDesabilitado}
        onChange={(event) => handleChange("localizacaoId", event.target.value)}
      >
        <option value="">
          {carregandoDados ? "Carregando localizações..." : "Sem localização"}
        </option>

        {formData.localizacaoId &&
          !localizacoes.some(
            (localizacao) => String(localizacao.id) === formData.localizacaoId,
          ) && (
            <option value={formData.localizacaoId}>
              Localização atual — ID {formData.localizacaoId}
            </option>
          )}

        {localizacoes.map((localizacao) => (
          <option key={localizacao.id} value={String(localizacao.id)}>
            {localizacao.nome}
          </option>
        ))}
      </Select>

      <Select
        label="Responsável"
        value={formData.responsavelId}
        disabled={formularioDesabilitado}
        onChange={(event) => handleChange("responsavelId", event.target.value)}
      >
        <option value="">
          {carregandoDados ? "Carregando colaboradores..." : "Sem responsável"}
        </option>

        {formData.responsavelId &&
          !colaboradores.some(
            (colaborador) => String(colaborador.id) === formData.responsavelId,
          ) && (
            <option value={formData.responsavelId}>
              Responsável atual — ID {formData.responsavelId}
            </option>
          )}

        {colaboradores.map((colaborador) => (
          <option key={colaborador.id} value={String(colaborador.id)}>
            {colaborador.nome}
          </option>
        ))}
      </Select>

      <Input
        label="Observações"
        value={formData.observacoes}
        disabled={formularioDesabilitado}
        onChange={(event) => handleChange("observacoes", event.target.value)}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={salvando}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          loading={salvando}
          disabled={formularioDesabilitado}
        >
          {modo === "editar" ? "Atualizar" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
