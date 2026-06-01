import { Link } from "react-router-dom";
import { CalendarDays, Fuel, Gauge, Settings, Users } from "lucide-react";
import { useAutentikacija } from "../context/KontekstAutentikacije.jsx";
import { formatirajCijenu } from "../utils/formatiranje.js";

export default function KarticaVozila({ vozilo, dodatneAkcije }) {
  const { adminJe } = useAutentikacija();

  return (
    <article className="kartica-vozila">
      <div className="slika-vozila">
        <img src={vozilo.slika} alt={vozilo.naziv} />
        <span className={`dostupnost ${vozilo.dostupno ? "dostupno" : "nedostupno"}`}>
          {vozilo.dostupno ? "Dostupno" : "Zauzeto"}
        </span>
      </div>

      <div className="tijelo-vozila">
        <div className="red-naslova-vozila">
          <div>
            <span className="eyebrow">{vozilo.kategorija}</span>
            <h3>{vozilo.naziv}</h3>
          </div>
          <strong>{formatirajCijenu(vozilo.cijenaPoDanu)}</strong>
        </div>

        <p>{vozilo.opis}</p>

        <div className="spec-grid">
          <span>
            <CalendarDays size={15} aria-hidden="true" />
            {vozilo.godiste}
          </span>
          <span>
            <Gauge size={15} aria-hidden="true" />
            {vozilo.motor}
          </span>
          <span>
            <Settings size={15} aria-hidden="true" />
            {vozilo.transmisija}
          </span>
          <span>
            <Fuel size={15} aria-hidden="true" />
            {vozilo.gorivo}
          </span>
          <span>
            <Users size={15} aria-hidden="true" />
            {vozilo.sjedista} sjedišta
          </span>
        </div>

        <div className="akcije-vozila">
          <Link className="btn btn-outline" to={`/vozila/${vozilo.id}`}>
            Detalji
          </Link>
          {!adminJe && (
            <Link
              className={`btn btn-primary ${!vozilo.dostupno ? "disabled" : ""}`}
              to={vozilo.dostupno ? `/rezervacije?vozilo=${vozilo.id}` : "#"}
              aria-disabled={!vozilo.dostupno}
            >
              Rezerviši
            </Link>
          )}
          {dodatneAkcije}
        </div>
      </div>
    </article>
  );
}
