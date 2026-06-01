export const emailObrazac = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export function formatirajCijenu(vrijednost) {
  return `${Number(vrijednost || 0).toLocaleString("bs-BA")} KM`;
}

export function normalizujTekst(vrijednost) {
  return String(vrijednost || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function kreirajId(prefiks) {
  if (window.crypto?.randomUUID) {
    return `${prefiks}-${window.crypto.randomUUID()}`;
  }

  return `${prefiks}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function brojDanaNajma(datumPreuzimanja, datumPovrata) {
  if (!datumPreuzimanja || !datumPovrata) return 0;

  const pocetak = new Date(datumPreuzimanja);
  const kraj = new Date(datumPovrata);
  const razlika = kraj.getTime() - pocetak.getTime();

  if (Number.isNaN(razlika) || razlika <= 0) return 0;

  return Math.ceil(razlika / (1000 * 60 * 60 * 24));
}
