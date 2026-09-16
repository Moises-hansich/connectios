type Grupo = "TODOS" | "COMPUTADORES" | "PERIFERICOS" | "PECAS" | "OUTROS";
const categoriasPorGrupo = {
  COMPUTADORES: [
    "computador",
    "computadores",
    "desktop",
    "desktops",
    "notebook",
    "notebooks",
    "servidor",
    "servidores",
    "all in one",
  ],

  PERIFERICOS: [
    "monitor",
    "monitores",
    "teclado",
    "teclados",
    "mouse",
    "mouses",
    "impressora",
    "impressoras",
    "scanner",
    "scanners",
    "webcam",
    "webcams",
    "headset",
    "headsets",
    "tv",
    "televisao",
    "televisores",
    "projetor",
    "projetores",
  ],

  PECAS: [
    "memoria",
    "memorias",
    "memoria ram",
    "memorias ram",
    "ram",
    "ssd",
    "ssds",
    "hd",
    "hds",
    "hdd",
    "hdds",
    "processador",
    "processadores",
    "placa de video",
    "placas de video",
    "placa mae",
    "placas mae",
    "fonte",
    "fontes",
    "cooler",
    "coolers",
    "armazenamento",
  ],
};

export function normalizarTexto(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, " ");
}

export function obterGrupo(categoria: string): Exclude<Grupo, "TODOS"> {
  const nome = normalizarTexto(categoria);

  if (categoriasPorGrupo.COMPUTADORES.includes(nome)) {
    return "COMPUTADORES";
  }

  if (categoriasPorGrupo.PERIFERICOS.includes(nome)) {
    return "PERIFERICOS";
  }

  if (categoriasPorGrupo.PECAS.includes(nome)) {
    return "PECAS";
  }

  return "OUTROS";
}
