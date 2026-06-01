import { useMemo, useState } from "react";
import { CarFront, Lock, MapPin, Power, Route, Unlock } from "lucide-react";
import Ucitaj from "../components/Ucitaj.jsx";
import { useObavijesti } from "../context/KontekstObavijesti.jsx";
import { useDohvat } from "../hooks/useDohvat.js";
import { rezervacijeApi } from "../services/bazaApi.js";
import { normalizujTekst } from "../utils/formatiranje.js";

function rezervacijaJeRentana(rezervacija) {
  const status = normalizujTekst(rezervacija.status);
  return Boolean(rezervacija.rentanjeAktivno) || status.includes("potvrd") || status.includes("aktiv");
}

function tekstKontrole(rezervacija) {
  if (rezervacija.softverskiUgaseno) return "Softverski ugaseno";
  if (rezervacija.zakljucano) return "Zakljucano";
  return "Aktivno";
}

export default function VehInfo() {
  const obavijesti = useObavijesti();
  const [kontrolaSlanjeId, postaviKontrolaSlanjeId] = useState("");
  const {
    podaci: rezervacije,
    postaviPodatke: postaviRezervacije,
    ucitavanje,
    greska,
  } = useDohvat(rezervacijeApi.dohvatiSve, []);

  const rentanaVozila = useMemo(
    () => (rezervacije || []).filter((rezervacija) => rezervacijaJeRentana(rezervacija)),
    [rezervacije],
  );

  const promijeniKontroluVozila = async (rezervacija, polje, vrijednost) => {
    const kontrolaId = `${rezervacija.id}-${polje}`;
    postaviKontrolaSlanjeId(kontrolaId);

    try {
      // Kontrole su simulacija softverskog upravljanja i ostaju trajno zapisane u json-server bazi.
      const azuriranaRezervacija = await rezervacijeApi.azuriraj(rezervacija.id, {
        ...rezervacija,
        [polje]: vrijednost,
        zadnjaKontrola: new Date().toISOString(),
      });

      postaviRezervacije((trenutneRezervacije = []) =>
        trenutneRezervacije.map((trenutnaRezervacija) =>
          trenutnaRezervacija.id === azuriranaRezervacija.id ? azuriranaRezervacija : trenutnaRezervacija,
        ),
      );
      obavijesti.uspjeh("Status vozila je azuriran.");
    } catch (trenutnaGreska) {
      obavijesti.greska(trenutnaGreska.message);
    } finally {
      postaviKontrolaSlanjeId("");
    }
  };

  return (
    <section className="page-section veh-info-page">
      <div className="content-shell">
        <div className="page-heading admin-heading">
          <span className="eyebrow">Veh Info</span>
          <h1>Lokacije i softverske kontrole rentanih vozila</h1>
          <p>Pregled aktivnih rentanja, predjene kilometraze i sigurnosnih kontrola vozila.</p>
        </div>

        <div className="admin-stat-grid">
          <div className="glass-panel admin-stat">
            <span>Rentana vozila</span>
            <strong>{rentanaVozila.length}</strong>
          </div>
          <div className="glass-panel admin-stat">
            <span>Zakljucana</span>
            <strong>{rentanaVozila.filter((rezervacija) => rezervacija.zakljucano).length}</strong>
          </div>
          <div className="glass-panel admin-stat">
            <span>Softverski ugasena</span>
            <strong>{rentanaVozila.filter((rezervacija) => rezervacija.softverskiUgaseno).length}</strong>
          </div>
        </div>

        {ucitavanje && <Ucitaj tekst="Ucitavanje rentanih vozila..." />}
        {greska && <p className="status-message error">Nije moguce ucitati podatke o rentanim vozilima.</p>}

        {!ucitavanje && !greska && rentanaVozila.length === 0 && (
          <div className="glass-panel empty-state">
            <CarFront size={28} aria-hidden="true" />
            <h2>Nema trenutno potvrdjenih rentanja</h2>
            <p>Kada admin potvrdi rezervaciju, vozilo se automatski prikazuje u ovom pregledu.</p>
          </div>
        )}

        {!ucitavanje && !greska && rentanaVozila.length > 0 && (
          <div className="veh-info-grid">
            {rentanaVozila.map((rezervacija) => (
              <article className="glass-panel veh-info-card" key={rezervacija.id}>
                <div className="veh-info-top">
                  <div>
                    <span className="eyebrow">{tekstKontrole(rezervacija)}</span>
                    <h2>{rezervacija.nazivVozila}</h2>
                    <p>{rezervacija.imeIPrezime}</p>
                  </div>
                  <span className={`control-status ${rezervacija.softverskiUgaseno || rezervacija.zakljucano ? "warning" : "active"}`}>
                    {tekstKontrole(rezervacija)}
                  </span>
                </div>

                <div className="veh-info-metrics">
                  <div>
                    <MapPin size={18} aria-hidden="true" />
                    <span>Lokacija</span>
                    <strong>{rezervacija.lokacijaVozila || rezervacija.lokacijaPreuzimanja || "Lokacija nije unesena"}</strong>
                  </div>
                  <div>
                    <Route size={18} aria-hidden="true" />
                    <span>Predjeno od rentanja</span>
                    <strong>{Number(rezervacija.predjenaKilometraza || 0).toLocaleString("bs-BA")} km</strong>
                  </div>
                </div>

                <div className="veh-info-meta">
                  <span>Preuzimanje: {rezervacija.datumPreuzimanja}</span>
                  <span>Povrat: {rezervacija.datumPovrata}</span>
                  {rezervacija.zadnjaKontrola && <span>Zadnja kontrola: {new Date(rezervacija.zadnjaKontrola).toLocaleString("bs-BA")}</span>}
                </div>

                <div className="veh-control-actions">
                  <button
                    className="btn btn-outline"
                    disabled={kontrolaSlanjeId === `${rezervacija.id}-zakljucano`}
                    type="button"
                    onClick={() => promijeniKontroluVozila(rezervacija, "zakljucano", !rezervacija.zakljucano)}
                  >
                    {rezervacija.zakljucano ? <Unlock size={17} aria-hidden="true" /> : <Lock size={17} aria-hidden="true" />}
                    {rezervacija.zakljucano ? "Otkljucaj" : "Zakljucaj"}
                  </button>
                  <button
                    className="btn btn-primary"
                    disabled={kontrolaSlanjeId === `${rezervacija.id}-softverskiUgaseno`}
                    type="button"
                    onClick={() => promijeniKontroluVozila(rezervacija, "softverskiUgaseno", !rezervacija.softverskiUgaseno)}
                  >
                    <Power size={17} aria-hidden="true" />
                    {rezervacija.softverskiUgaseno ? "Aktiviraj vozilo" : "Softverski ugasi"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
