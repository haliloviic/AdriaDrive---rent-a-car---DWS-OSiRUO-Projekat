import { createContext, useContext, useMemo, useState } from "react";
import { korisniciApi } from "../services/bazaApi.js";
import { kreirajId } from "../utils/formatiranje.js";

const KontekstAutentikacije = createContext(null);
const KLJUC_SESIJE = "adria-drive-korisnik";

// U sesiju spremamo samo podatke koji su potrebni za UI i autorizaciju.
function napraviKorisnikaSesije(korisnik) {
  return {
    id: korisnik.id,
    ime: korisnik.ime,
    email: korisnik.email,
    uloga: korisnik.uloga,
  };
}

function procitajSpremljenogKorisnika() {
  try {
    const spremljeno = localStorage.getItem(KLJUC_SESIJE);
    return spremljeno ? JSON.parse(spremljeno) : null;
  } catch {
    localStorage.removeItem(KLJUC_SESIJE);
    return null;
  }
}

export function PruzalacAutentikacije({ children }) {
  const [korisnik, postaviKorisnika] = useState(procitajSpremljenogKorisnika);

  const spremiKorisnika = (sljedeciKorisnik) => {
    postaviKorisnika(sljedeciKorisnik);
    localStorage.setItem(KLJUC_SESIJE, JSON.stringify(sljedeciKorisnik));
  };

  const prijava = async ({ email, lozinka }) => {
    const pronadjeniKorisnici = await korisniciApi.pronadjiPoEmailu(email.trim().toLowerCase());
    const pronadjeniKorisnik = pronadjeniKorisnici.find(
      (kandidat) => kandidat.lozinka === lozinka,
    );

    if (!pronadjeniKorisnik) {
      throw new Error("Email ili lozinka nisu ispravni.");
    }

    const korisnikSesije = napraviKorisnikaSesije(pronadjeniKorisnik);
    spremiKorisnika(korisnikSesije);
    return korisnikSesije;
  };

  const registracija = async ({ ime, email, lozinka }) => {
    const normalizovanEmail = email.trim().toLowerCase();
    const postojeciKorisnici = await korisniciApi.pronadjiPoEmailu(normalizovanEmail);

    if (postojeciKorisnici.length > 0) {
      throw new Error("Korisnik sa ovim emailom već postoji.");
    }

    const kreiraniKorisnik = await korisniciApi.kreiraj({
      id: kreirajId("u"),
      ime: ime.trim(),
      email: normalizovanEmail,
      lozinka,
      uloga: "gost",
      kreirano: new Date().toISOString(),
    });

    const korisnikSesije = napraviKorisnikaSesije(kreiraniKorisnik);
    spremiKorisnika(korisnikSesije);
    return korisnikSesije;
  };

  const odjava = () => {
    localStorage.removeItem(KLJUC_SESIJE);
    postaviKorisnika(null);
  };

  const vrijednost = useMemo(
    () => ({
      korisnik,
      prijavljen: Boolean(korisnik),
      adminJe: korisnik?.uloga === "admin",
      prijava,
      registracija,
      odjava,
    }),
    [korisnik],
  );

  return (
    <KontekstAutentikacije.Provider value={vrijednost}>
      {children}
    </KontekstAutentikacije.Provider>
  );
}

export function useAutentikacija() {
  const kontekst = useContext(KontekstAutentikacije);

  if (!kontekst) {
    throw new Error("useAutentikacija mora biti korišten unutar PruzalacAutentikacije komponente.");
  }

  return kontekst;
}
