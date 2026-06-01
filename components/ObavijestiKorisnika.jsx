import { useEffect } from "react";
import { useAutentikacija } from "../context/KontekstAutentikacije.jsx";
import { useObavijesti } from "../context/KontekstObavijesti.jsx";
import { porukeApi } from "../services/bazaApi.js";

export default function ObavijestiKorisnika() {
  const { korisnik } = useAutentikacija();
  const obavijesti = useObavijesti();

  useEffect(() => {
    if (!korisnik || korisnik.uloga !== "gost") return;

    let aktivno = true;

    const prikaziOdgovore = async () => {
      const poruke = await porukeApi.dohvatiZaKorisnika(korisnik.id);
      const neprocitaniOdgovori = poruke.filter((poruka) => poruka.odgovor && !poruka.odgovorProcitan);

      if (!aktivno || neprocitaniOdgovori.length === 0) return;

      neprocitaniOdgovori.forEach((poruka) => {
        obavijesti.info(`Odgovor administracije za "${poruka.predmet}": ${poruka.odgovor}`);
      });

      await Promise.all(
        neprocitaniOdgovori.map((poruka) =>
          porukeApi.azuriraj(poruka.id, {
            ...poruka,
            odgovorProcitan: true,
          }),
        ),
      );
    };

    prikaziOdgovore().catch((greska) => {
      if (aktivno) obavijesti.greska(greska.message);
    });

    return () => {
      aktivno = false;
    };
  }, [korisnik?.id, korisnik?.uloga]);

  return null;
}
