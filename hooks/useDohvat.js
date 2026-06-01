import { useCallback, useEffect, useState } from "react";

export function useDohvat(funkcijaDohvata, zavisnosti = []) {
  const [podaci, postaviPodatke] = useState(null);
  const [ucitavanje, postaviUcitavanje] = useState(true);
  const [greska, postaviGresku] = useState(null);

  const osvjezi = useCallback(async () => {
    postaviUcitavanje(true);
    postaviGresku(null);

    try {
      const rezultat = await funkcijaDohvata();
      postaviPodatke(rezultat);
      return rezultat;
    } catch (trenutnaGreska) {
      postaviGresku(trenutnaGreska);
      return null;
    } finally {
      postaviUcitavanje(false);
    }
  }, zavisnosti);

  useEffect(() => {
    let aktivno = true;

    // Ovaj flag sprječava ažuriranje stanja ako korisnik napusti stranicu prije kraja dohvata.
    const ucitaj = async () => {
      postaviUcitavanje(true);
      postaviGresku(null);

      try {
        const rezultat = await funkcijaDohvata();

        if (aktivno) {
          postaviPodatke(rezultat);
        }
      } catch (trenutnaGreska) {
        if (aktivno) {
          postaviGresku(trenutnaGreska);
        }
      } finally {
        if (aktivno) {
          postaviUcitavanje(false);
        }
      }
    };

    ucitaj();

    return () => {
      aktivno = false;
    };
  }, zavisnosti);

  return { podaci, postaviPodatke, ucitavanje, greska, osvjezi };
}
