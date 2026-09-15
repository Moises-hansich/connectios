import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import { Select } from "../Select";
import { Button } from "../Button";
import { Input } from "../Input";

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
  if (!valor) {
    return "";
  }

  return valor.slice(0, 10);
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
  const [formData, setFormData] = useState<FormData>(() =>
    criarEstadoInicial(equipamento),
  );

  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [localizacoes, setLocalizacoes] = useState<LocalizacaoOption[]>([]);

  const [colaboradores, setColaboradores] = useState<ColaboradorOption[]>([]);

  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  const [hostsZabbix, setHostsZabbix] = useState<ZabbixHost[]>([]);

  const [carregandoHostsZabbix, setCarregandoHostsZabbix] = useState(true);

  const [carregandoCategorias, setCarregandoCategorias] = useState(true);

  const [carregandoLocalizacoes, setCarregandoLocalizacoes] = useState(true);

  const [carregandoColaboradores, setCarregandoColaboradores] = useState(true);

  const [carregandoEmpresas, setCarregandoEmpresas] = useState(true);

  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setFormData(criarEstadoInicial(equipamento));
  }, [equipamento]);

  useEffect(() => {
    async function carregarCategorias() {
      try {
        setCarregandoCategorias(true);

        const dados = await categoriaService.listarAtivas();

        setCategorias(Array.isArray(dados) ? dados : []);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);

        setCategorias([]);

        toast.error(
          obterMensagemErro(error, "Não foi possível carregar as categorias."),
        );
      } finally {
        setCarregandoCategorias(false);
      }
    }

    void carregarCategorias();
  }, []);

  useEffect(() => {
    async function carregarLocalizacoes() {
      try {
        setCarregandoLocalizacoes(true);

        const dados = await localizacaoService.listar();

        const lista = Array.isArray(dados) ? dados : [];

        setLocalizacoes(
          lista.map((localizacao) => ({
            id: localizacao.id,
            nome: localizacao.nome,
          })),
        );
      } catch (error) {
        console.error("Erro ao carregar localizações:", error);

        setLocalizacoes([]);

        toast.error(
          obterMensagemErro(
            error,
            "Não foi possível carregar as localizações.",
          ),
        );
      } finally {
        setCarregandoLocalizacoes(false);
      }
    }

    void carregarLocalizacoes();
  }, []);

  useEffect(() => {
    async function carregarColaboradores() {
      try {
        setCarregandoColaboradores(true);

        const dados = await colaboradorService.listar();

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
      } catch (error) {
        console.error("Erro ao carregar colaboradores:", error);

        setColaboradores([]);

        toast.error(
          obterMensagemErro(
            error,
            "Não foi possível carregar os colaboradores.",
          ),
        );
      } finally {
        setCarregandoColaboradores(false);
      }
    }

    void carregarColaboradores();
  }, []);

  useEffect(() => {
    async function carregarEmpresas() {
      try {
        setCarregandoEmpresas(true);

        const dados = await empresaService.listarAtivas();

        setEmpresas(Array.isArray(dados) ? dados : []);
      } catch (error) {
        console.error("Erro ao carregar fornecedores:", error);

        setEmpresas([]);

        toast.error(
          obterMensagemErro(
            error,
            "Não foi possível carregar os fornecedores.",
          ),
        );
      } finally {
        setCarregandoEmpresas(false);
      }
    }

    void carregarEmpresas();
  }, []);

  useEffect(() => {
    async function carregarHostsZabbix() {
      try {
        setCarregandoHostsZabbix(true);

        const hosts = await zabbixService.listarHosts();

        setHostsZabbix(hosts);
      } catch (error) {
        console.error("Erro ao carregar hosts do Zabbix:", error);

        setHostsZabbix([]);

        toast.error(
          obterMensagemErro(
            error,
            "Não foi possível carregar os computadores do Zabbix.",
          ),
        );
      } finally {
        setCarregandoHostsZabbix(false);
      }
    }

    void carregarHostsZabbix();
  }, []);

  function handleChange(campo: keyof FormData, valor: string) {
    setFormData((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: valor,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (salvando) {
      return;
    }

    if (formData.nome.trim().length < 3) {
      toast.error("O nome deve possuir pelo menos 3 caracteres.");

      return;
    }

    const categoriaId = Number.parseInt(formData.categoriaId, 10);

    if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
      toast.error("Selecione uma categoria válida.");

      return;
    }

    const localizacaoId =
      formData.localizacaoId === ""
        ? null
        : Number.parseInt(formData.localizacaoId, 10);

    const responsavelId =
      formData.responsavelId === ""
        ? null
        : Number.parseInt(formData.responsavelId, 10);

    const fornecedorId =
      formData.fornecedorId === ""
        ? null
        : Number.parseInt(formData.fornecedorId, 10);

    if (
      localizacaoId !== null &&
      (!Number.isInteger(localizacaoId) || localizacaoId <= 0)
    ) {
      toast.error("Selecione uma localização válida.");

      return;
    }

    if (
      responsavelId !== null &&
      (!Number.isInteger(responsavelId) || responsavelId <= 0)
    ) {
      toast.error("Selecione um responsável válido.");

      return;
    }

    if (
      fornecedorId !== null &&
      (!Number.isInteger(fornecedorId) || fornecedorId <= 0)
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
      toast.error("Selecione o fornecedor responsável pela garantia.");

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

    try {
      setSalvando(true);

      if (modo === "editar" && equipamento) {
        await equipamentoService.atualizar(equipamento.id, dados);

        toast.success("Equipamento atualizado com sucesso.");
      } else {
        await equipamentoService.criar(dados);

        toast.success("Equipamento cadastrado com sucesso.");
      }

      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar equipamento:", error);

      toast.error(
        obterMensagemErro(
          error,
          modo === "editar"
            ? "Não foi possível atualizar o equipamento."
            : "Não foi possível cadastrar o equipamento.",
        ),
      );
    } finally {
      setSalvando(false);
    }
  }

  const categoriasDisponiveis =
    equipamento?.categoria &&
    !categorias.some((categoria) => categoria.id === equipamento.categoria?.id)
      ? [equipamento.categoria, ...categorias]
      : categorias;

  /*
   * Caso a empresa tenha sido desativada depois de
   * ser vinculada ao equipamento, ela continua
   * aparecendo durante a edição.
   */
  const empresasDisponiveis =
    equipamento?.fornecedor &&
    !empresas.some((empresa) => empresa.id === equipamento.fornecedor?.id)
      ? [equipamento.fornecedor, ...empresas]
      : empresas;

  const carregandoDados =
    carregandoCategorias ||
    carregandoLocalizacoes ||
    carregandoColaboradores ||
    carregandoEmpresas ||
    carregandoHostsZabbix;

  const formularioDesabilitado = salvando || carregandoDados;

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
          {carregandoCategorias
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
          {carregandoHostsZabbix
            ? "Carregando computadores..."
            : "Sem vínculo com o Zabbix"}
        </option>

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
        <option value="Disponível">Disponível</option>

        <option value="Em uso">Em uso</option>

        <option value="Em manutenção">Em manutenção</option>

        <option value="Reservado">Reservado</option>

        <option value="Baixado">Baixado</option>
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

      <Select
        label="Fornecedor da garantia"
        value={formData.fornecedorId}
        disabled={formularioDesabilitado}
        onChange={(event) => handleChange("fornecedorId", event.target.value)}
      >
        <option value="">
          {carregandoEmpresas ? "Carregando fornecedores..." : "Sem fornecedor"}
        </option>

        {empresasDisponiveis.map((empresa) => (
          <option key={empresa.id} value={String(empresa.id)}>
            {empresa.nome}
            {!empresa.ativo ? " (desativada)" : ""}
          </option>
        ))}
      </Select>

      <Select
        label="Localização"
        value={formData.localizacaoId}
        disabled={formularioDesabilitado}
        onChange={(event) => handleChange("localizacaoId", event.target.value)}
      >
        <option value="">
          {carregandoLocalizacoes
            ? "Carregando localizações..."
            : "Sem localização"}
        </option>

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
          {carregandoColaboradores
            ? "Carregando colaboradores..."
            : "Sem responsável"}
        </option>

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
