export const BAZA_URL = import.meta.env.VITE_BAZA_URL || "http://localhost:4000";

// Centralna funkcija za sve REST zahtjeve prema json-server bazi.
async function posaljiZahtjev(putanja, opcije = {}) {
  const odgovor = await fetch(`${BAZA_URL}${putanja}`, {
    headers: {
      "Content-Type": "application/json",
      ...(opcije.headers || {}),
    },
    ...opcije,
  });

  const tekst = await odgovor.text();
  const podaci = tekst ? JSON.parse(tekst) : null;

  if (!odgovor.ok) {
    throw new Error(podaci?.poruka || "Zahtjev prema bazi nije uspješno završen.");
  }

  return podaci;
}

export const vozilaApi = {
  dohvatiSve: () => posaljiZahtjev("/vozila"),
  dohvatiPoId: (id) => posaljiZahtjev(`/vozila/${id}`),
  kreiraj: (vozilo) =>
    posaljiZahtjev("/vozila", {
      method: "POST",
      body: JSON.stringify(vozilo),
    }),
  azuriraj: (id, vozilo) =>
    posaljiZahtjev(`/vozila/${id}`, {
      method: "PUT",
      body: JSON.stringify(vozilo),
    }),
  obrisi: (id) =>
    posaljiZahtjev(`/vozila/${id}`, {
      method: "DELETE",
    }),
};

export const korisniciApi = {
  pronadjiPoEmailu: (email) => posaljiZahtjev(`/korisnici?email=${encodeURIComponent(email)}`),
  kreiraj: (korisnik) =>
    posaljiZahtjev("/korisnici", {
      method: "POST",
      body: JSON.stringify(korisnik),
    }),
};

export const rezervacijeApi = {
  dohvatiSve: () => posaljiZahtjev("/rezervacije"),
  kreiraj: (rezervacija) =>
    posaljiZahtjev("/rezervacije", {
      method: "POST",
      body: JSON.stringify(rezervacija),
    }),
  azuriraj: (id, rezervacija) =>
    posaljiZahtjev(`/rezervacije/${id}`, {
      method: "PUT",
      body: JSON.stringify(rezervacija),
    }),
};

export const porukeApi = {
  dohvatiSve: () => posaljiZahtjev("/poruke"),
  dohvatiZaKorisnika: (korisnikId) => posaljiZahtjev(`/poruke?korisnikId=${encodeURIComponent(korisnikId)}`),
  kreiraj: (poruka) =>
    posaljiZahtjev("/poruke", {
      method: "POST",
      body: JSON.stringify(poruka),
    }),
  azuriraj: (id, poruka) =>
    posaljiZahtjev(`/poruke/${id}`, {
      method: "PUT",
      body: JSON.stringify(poruka),
    }),
};
