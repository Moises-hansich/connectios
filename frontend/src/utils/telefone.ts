export function somenteNumerosTelefone(valor: string): string {
  return valor.replace(/\D/g, "").slice(0, 11);
}

export function formatarTelefone(valor: string): string {
  const numeros = somenteNumerosTelefone(valor);

  if (numeros.length === 0) {
    return "";
  }

  if (numeros.length <= 2) {
    return `(${numeros}`;
  }

  const ddd = numeros.slice(0, 2);
  const numero = numeros.slice(2);

  if (numero.length <= 4) {
    return `(${ddd}) ${numero}`;
  }

  if (numeros.length <= 10) {
    return `(${ddd}) ${numero.slice(0, 4)}-${numero.slice(4)}`;
  }

  return `(${ddd}) ${numero.slice(0, 5)}-${numero.slice(5)}`;
}

export function telefoneValido(valor: string): boolean {
  const quantidade = somenteNumerosTelefone(valor).length;

  return quantidade === 10 || quantidade === 11;
}
