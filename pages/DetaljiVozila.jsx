import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Fuel, Gauge, Settings, Users } from "lucide-react";
import Ucitaj from "../components/Ucitaj.jsx";
import { useAutentikacija } from "../context/KontekstAutentikacije.jsx";
import { useDohvat } from "../hooks/useDohvat.js";
import { vozilaApi } from "../services/bazaApi.js";
import { formatirajCijenu } from "../utils/formatiranje.js";
import NijePronadjeno from "./NijePronadjeno.jsx";

export default function DetaljiVozila() {
  const { id } = useParams();
  const { adminJe } = useAutentikacija();
  const { podaci: vozilo, ucitavanje, greska } = useDohvat(() => vozilaApi.dohvatiPoId(id), [id]);

  if (ucitavanje) return <Ucitaj tekst="Učitavanje vozila..." />;

  if (greska || !vozilo) {
    return (
      <NijePronadjeno
        oznaka="404 vozilo"
        naslov="Vozilo nije pronađeno"
        poruka="Traženo vozilo trenutno nije dostupno u floti."
      />
    );
  }

  return (
    <section className="page-section">
      <div className="content-shell details-grid">
        <div className="details-media glass-panel">
          <img src={vozilo.slika} alt={vozilo.naziv} />
        </div>

        <div className="details-content">
          <Link className="text-link" to="/vozila">
            <ArrowLeft size={17} aria-hidden="true" />
            Nazad na vozila
          </Link>
          <span className="eyebrow">{vozilo.kategorija}</span>
          <h1>{vozilo.naziv}</h1>
          <p>{vozilo.opis}</p>

          <div className="price-panel glass-panel">
            <span>Cijena po danu</span>
            <strong>{formatirajCijenu(vozilo.cijenaPoDanu)}</strong>
            <small>{vozilo.dostupno ? "Dostupno za online rezervaciju" : "Trenutno zauzeto"}</small>
          </div>

          <div className="details-specs">
            <span>
              <CalendarDays size={18} aria-hidden="true" />
              Godište: {vozilo.godiste}
            </span>
            <span>
              <Gauge size={18} aria-hidden="true" />
              Motor: {vozilo.motor}
            </span>
            <span>
              <Settings size={18} aria-hidden="true" />
              Transmisija: {vozilo.transmisija}
            </span>
            <span>
              <Fuel size={18} aria-hidden="true" />
              Gorivo: {vozilo.gorivo}
            </span>
            <span>
              <Users size={18} aria-hidden="true" />
              Sjedišta: {vozilo.sjedista}
            </span>
          </div>

          {!adminJe && (
            <Link
              className={`btn btn-primary btn-large ${!vozilo.dostupno ? "disabled" : ""}`}
              to={vozilo.dostupno ? `/rezervacije?vozilo=${vozilo.id}` : "#"}
              aria-disabled={!vozilo.dostupno}
            >
              Rezerviši vozilo
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
