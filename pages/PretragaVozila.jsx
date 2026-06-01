import { useMemo } from "react";
import { useParams } from "react-router-dom";
import Ucitaj from "../components/Ucitaj.jsx";
import KarticaVozila from "../components/KarticaVozila.jsx";
import { useDohvat } from "../hooks/useDohvat.js";
import { vozilaApi } from "../services/bazaApi.js";
import { normalizujTekst } from "../utils/formatiranje.js";
import NijePronadjeno from "./NijePronadjeno.jsx";

export default function PretragaVozila() {
  const { upit = "" } = useParams();
  const citljivUpit = decodeURIComponent(upit).replace(/-/g, " ");
  const { podaci: vozila = [], ucitavanje, greska } = useDohvat(() => vozilaApi.dohvatiSve(), []);

  const pronadjenaVozila = useMemo(() => {
    const trazeniPojam = normalizujTekst(citljivUpit);
    return (vozila || []).filter((vozilo) =>
      normalizujTekst(`${vozilo.naziv} ${vozilo.marka} ${vozilo.model}`).includes(trazeniPojam),
    );
  }, [vozila, citljivUpit]);

  if (ucitavanje) return <Ucitaj tekst="Tražimo model u floti..." />;

  if (greska || pronadjenaVozila.length === 0) {
    return (
      <NijePronadjeno
        oznaka="404 model"
        naslov={`Model "${citljivUpit}" nije pronađen`}
        poruka="Taj model trenutno nije u AdriaDrive floti. Vrati se na listu vozila i izaberi jedan od dostupnih modela."
      />
    );
  }

  return (
    <section className="page-section">
      <div className="content-shell">
        <div className="page-heading">
          <span className="eyebrow">Rezultat pretrage</span>
          <h1>Pronađeni modeli za "{citljivUpit}"</h1>
        </div>
        <div className="mreza-vozila">
          {pronadjenaVozila.map((vozilo) => (
            <KarticaVozila key={vozilo.id} vozilo={vozilo} />
          ))}
        </div>
      </div>
    </section>
  );
}
