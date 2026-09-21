export interface DefinicaoPermissao {
  chave: string;
  nome: string;
}

export interface GrupoPermissoes {
  chave: string;
  nome: string;
  permissoes: DefinicaoPermissao[];
}

function crud(chave: string, nome: string): GrupoPermissoes {
  return {
    chave,
    nome,
    permissoes: [
      { chave: `${chave}.visualizar`, nome: "Visualizar" },
      { chave: `${chave}.criar`, nome: "Cadastrar" },
      { chave: `${chave}.editar`, nome: "Editar" },
      { chave: `${chave}.excluir`, nome: "Excluir" },
    ],
  };
}

export const GRUPOS_PERMISSOES: GrupoPermissoes[] = [
  {
    chave: "dashboard",
    nome: "Dashboard",
    permissoes: [
      { chave: "dashboard.visualizar", nome: "Visualizar indicadores" },
    ],
  },

  crud("equipamentos", "Equipamentos"),
  crud("hardware", "Hardware"),

  {
    chave: "fotos",
    nome: "Fotos dos equipamentos",
    permissoes: [
      { chave: "fotos.visualizar", nome: "Visualizar" },
      { chave: "fotos.editar", nome: "Adicionar, excluir e definir principal" },
    ],
  },

  {
    chave: "pecas",
    nome: "Peças da reserva",
    permissoes: [
      { chave: "pecas.visualizar", nome: "Consultar peças" },
      {
        chave: "pecas.movimentar",
        nome: "Instalar, trocar e retirar peças",
      },
    ],
  },

  {
    chave: "manutencoes",
    nome: "Manutenções",
    permissoes: [
      { chave: "manutencoes.visualizar", nome: "Visualizar" },
      { chave: "manutencoes.abrir", nome: "Abrir atendimento" },
      { chave: "manutencoes.finalizar", nome: "Finalizar atendimento" },
    ],
  },

  {
    chave: "movimentacoes",
    nome: "Histórico e movimentações",
    permissoes: [
      { chave: "movimentacoes.visualizar", nome: "Visualizar histórico" },
      { chave: "movimentacoes.registrar", nome: "Registrar movimentação" },
    ],
  },

  crud("categorias", "Categorias"),
  crud("empresas", "Empresas"),
  crud("colaboradores", "Colaboradores"),
  crud("localizacoes", "Localizações"),

  {
    chave: "configuracoes",
    nome: "Configuração dos tipos e campos de hardware",
    permissoes: [
      { chave: "configuracoes.visualizar", nome: "Visualizar" },
      {
        chave: "configuracoes.editar",
        nome: "Cadastrar, editar e excluir tipos e campos",
      },
    ],
  },

  {
    chave: "zabbix",
    nome: "Zabbix",
    permissoes: [{ chave: "zabbix.visualizar", nome: "Consultar hosts e IPs" }],
  },
];

export const TODAS_PERMISSOES = GRUPOS_PERMISSOES.flatMap((grupo) =>
  grupo.permissoes.map((permissao) => permissao.chave),
);

const permissoesValidas = new Set(TODAS_PERMISSOES);

export function ehPermissaoValida(chave: string): boolean {
  return permissoesValidas.has(chave);
}
