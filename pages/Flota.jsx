import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import Ucitaj from "../components/Ucitaj.jsx";
import KarticaVozila from "../components/KarticaVozila.jsx";
import { useDohvat } from "../hooks/useDohvat.js";
import { vozilaApi } from "../services/bazaApi.js";
import { formatirajCijenu, normalizujTekst } from "../utils/formatiranje.js";

const popularniModeli = [
  "Volkswagen Golf",
  "BMW 5 Series",
  "Mercedes C-Class",
  "Toyota Corolla",
  "Skoda Octavia",
  "Renault Clio",
  "Tesla Model Y",
  "Audi A6",
  "Peugeot 3008",
  "Ford Focus",
];

export default function Flota() {
  const navigacija = useNavigate();
  const { podaci: vozila = [], ucitavanje, greska } = useDohvat(() => vozilaApi.dohvatiSve(), []);
  const [filteri, postaviFiltere] = useState({
    pretraga: "",
    maksimalnaCijena: 220,
    gorivo: "",
    transmisija: "",
    sortiranje: "cijena-rastuce",
  });

  const najvecaCijenaFlote = useMemo(() => {
    const cijene = (vozila || []).map((vozilo) => Number(vozilo.cijenaPoDanu));
    return Math.max(220, ...cijene);
  }, [vozila]);

  const opcijeModela = useMemo(() => {
    const lokalniModeli = (vozila || []).map((vozilo) => vozilo.naziv);
    return Array.from(new Set([...lokalniModeli, ...popularniModeli]));
  }, [vozila]);

  const filtriranaVozila = useMemo(() => {
    const trazeniPojam = normalizujTekst(filteri.pretraga);
    const maksimalnaCijena = Number(filteri.maksimalnaCijena) || najvecaCijenaFlote;

    const rezultat = (vozila || []).filter((vozilo) => {
      const tekstZaPretragu = normalizujTekst(`${vozilo.naziv} ${vozilo.marka} ${vozilo.model}`);
      const odgovaraPretrazi = !trazeniPojam || tekstZaPretragu.includes(trazeniPojam);
      const odgovaraCijeni = Number(vozilo.cijenaPoDanu) <= maksimalnaCijena;
      const odgovaraGorivu = !filteri.gorivo || vozilo.gorivo === filteri.gorivo;
      const odgovaraTransmisiji = !filteri.transmisija || vozilo.transmisija === filteri.transmisija;

      return odgovaraPretrazi && odgovaraCijeni && odgovaraGorivu && odgovaraTransmisiji;
    });

    return [...rezultat].sort((prvo, drugo) => {
      if (filteri.sortiranje === "cijena-opadajuce") return drugo.cijenaPoDanu - prvo.cijenaPoDanu;
      if (filteri.sortiranje === "naziv") return prvo.naziv.localeCompare(drugo.naziv);
      return prvo.cijenaPoDanu - drugo.cijenaPoDanu;
    });
  }, [vozila, filteri, najvecaCijenaFlote]);

  const promijeniFilter = (dogadjaj) => {
    const { name, value } = dogadjaj.target;
    postaviFiltere((trenutni) => ({ ...trenutni, [name]: value }));
  };

  const posaljiPretragu = (dogadjaj) => {
    dogadjaj.preventDefault();

    // Ako model nije u bazi, korisnik ide na posebnu 404 stranicu za traženi model.
    const trazeniPojam = normalizujTekst(filteri.pretraga);
    if (!trazeniPojam) return;

    const postojiModel = (vozila || []).some((vozilo) =>
      normalizujTekst(`${vozilo.naziv} ${vozilo.marka} ${vozilo.model}`).includes(trazeniPojam),
    );

    if (!postojiModel) {
      navigacija(`/vozila/model/${encodeURIComponent(filteri.pretraga.trim())}`);
    }
  };

  return (
    <section className="page-section">
      <div className="content-shell">
        <div className="page-heading">
          <span className="eyebrow">Flota vozila</span>
          <h1>Pronađi vozilo po cijeni, modelu ili namjeni</h1>
          <p>
            Filtriraj vozila, pretraži konkretan model i izaberi opciju koja odgovara planu putovanja.
          </p>
        </div>

        <form className="filter-panel glass-panel" onSubmit={posaljiPretragu}>
          <div className="filter-title">
            <Filter size={19} aria-hidden="true" />
            <strong>Filteri pretrage</strong>
          </div>

          <label className="form-field">
            <span>Naziv ili model</span>
            <div className="input-with-icon">
              <Search size={17} aria-hidden="true" />
              <input
                list="opcije-modela"
                name="pretraga"
                placeholder="npr. Golf, BMW, Tesla..."
                type="search"
                value={filteri.pretraga}
                onChange={promijeniFilter}
              />
              <datalist id="opcije-modela">
                {opcijeModela.map((model) => (
                  <option key={model} value={model} />
                ))}
              </datalist>
            </div>
          </label>

          <label className="form-field">
            <span>Maksimalna cijena: {formatirajCijenu(filteri.maksimalnaCijena)}</span>
            <input
              max={najvecaCijenaFlote}
              min="40"
              name="maksimalnaCijena"
              step="5"
              type="range"
              value={filteri.maksimalnaCijena}
              onChange={promijeniFilter}
            />
          </label>

          <label className="form-field">
            <span>Gorivo</span>
            <select name="gorivo" value={filteri.gorivo} onChange={promijeniFilter}>
              <option value="">Sva goriva</option>
              <option value="Dizel">Dizel</option>
              <option value="Benzin">Benzin</option>
              <option value="Hibrid">Hibrid</option>
              <option value="Električni">Električni</option>
            </select>
          </label>

          <label className="form-field">
            <span>Transmisija</span>
            <select name="transmisija" value={filteri.transmisija} onChange={promijeniFilter}>
              <option value="">Sve transmisije</option>
              <option value="Automatik">Automatik</option>
              <option value="Manuelni">Manuelni</option>
            </select>
          </label>

          <label className="form-field">
            <span>Sortiranje</span>
            <select name="sortiranje" value={filteri.sortiranje} onChange={promijeniFilter}>
              <option value="cijena-rastuce">Cijena rastuće</option>
              <option value="cijena-opadajuce">Cijena opadajuće</option>
              <option value="naziv">Naziv A-Z</option>
            </select>
          </label>

          <button className="btn btn-primary filter-submit" type="submit">
            <SlidersHorizontal size={17} aria-hidden="true" />
            Pronađi model
          </button>
        </form>

        {ucitavanje && <Ucitaj />}
        {greska && <p className="status-message error">Servis trenutno nije dostupan. Pokušaj ponovo nakon osvježavanja stranice.</p>}

        {!ucitavanje && !greska && (
          <>
            <div className="result-bar">
              <strong>{filtriranaVozila.length}</strong>
              <span>vozila odgovara odabranim filterima</span>
            </div>

            {filtriranaVozila.length > 0 ? (
              <div className="mreza-vozila">
                {filtriranaVozila.map((vozilo) => (
                  <KarticaVozila key={vozilo.id} vozilo={vozilo} />
                ))}
              </div>
            ) : (
              <div className="empty-state glass-panel">
                <h2>Model nije pronađen u dostupnoj floti</h2>
                <p>Pretraga može otvoriti posebnu 404 stranicu za model koji trenutno nije u floti.</p>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => navigacija(`/vozila/model/${encodeURIComponent(filteri.pretraga || "nepoznat model")}`)}
                >
                  Otvori 404 rezultat
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
