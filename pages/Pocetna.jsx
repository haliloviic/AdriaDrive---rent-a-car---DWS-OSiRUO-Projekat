import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, CalendarCheck2, ShieldCheck, Sparkles } from "lucide-react";
import Ucitaj from "../components/Ucitaj.jsx";
import KarticaVozila from "../components/KarticaVozila.jsx";
import { useAutentikacija } from "../context/KontekstAutentikacije.jsx";
import { useDohvat } from "../hooks/useDohvat.js";
import { vozilaApi } from "../services/bazaApi.js";

const uvodnaSlika =
  "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1800&q=82";

export default function Pocetna() {
  const { adminJe } = useAutentikacija();
  const { podaci: vozila = [], ucitavanje } = useDohvat(() => vozilaApi.dohvatiSve(), []);
  const istaknutaVozila = (vozila || []).filter((vozilo) => vozilo.dostupno).slice(0, 3);

  return (
    <>
      <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.46)), url(${uvodnaSlika})` }}>
        <div className="content-shell hero-content">
          <span className="hero-kicker">
            <Sparkles size={17} aria-hidden="true" />
            Rent a car Sarajevo
          </span>
          <h1>AdriaDrive Rent</h1>
          <p>
            Premium i pristupačna vozila za gradske obaveze, poslovne dolaske i putovanja kroz Bosnu i Hercegovinu.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary btn-large" to="/vozila">
              Pregled flote
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            {!adminJe && (
              <Link className="btn btn-glass btn-large" to="/rezervacije">
                Brza rezervacija
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="quick-band">
        <div className="content-shell quick-grid">
          <div>
            <strong>24/7 preuzimanje</strong>
            <span>Aerodrom, centar i hotelske lokacije.</span>
          </div>
          <div>
            <strong>Transparentne cijene</strong>
            <span>Dnevna cijena je jasno prikazana uz svako vozilo.</span>
          </div>
          <div>
            <strong>Direktna podrška</strong>
            <span>Upiti i odgovori ostaju vezani za korisnički profil.</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="content-shell section-heading split-heading">
          <div>
            <span className="eyebrow">Dostupna flota</span>
            <h2>Vozila spremna za najam</h2>
          </div>
          <Link className="text-link" to="/vozila">
            Sva vozila
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>

        <div className="content-shell">
          {ucitavanje ? (
            <Ucitaj />
          ) : (
            <div className="mreza-vozila">
              {istaknutaVozila.map((vozilo) => (
                <KarticaVozila key={vozilo.id} vozilo={vozilo} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section feature-band">
        <div className="content-shell feature-grid">
          <div className="feature-item">
            <ShieldCheck size={26} aria-hidden="true" />
            <h3>Provjerena vozila</h3>
            <p>Svako vozilo ima podatke o motoru, gorivu, transmisiji, godištu i dnevnoj cijeni.</p>
          </div>
          <div className="feature-item">
            <CalendarCheck2 size={26} aria-hidden="true" />
            <h3>Rezervacije online</h3>
            <p>Gost korisnici šalju zahtjev za termin, lokaciju preuzimanja i trajanje najma.</p>
          </div>
          <div className="feature-item">
            <BadgeCheck size={26} aria-hidden="true" />
            <h3>Uloge i pristup</h3>
            <p>Admin upravlja flotom i korisničkim upitima, dok Gost rezerviše dostupna vozila.</p>
          </div>
        </div>
      </section>
    </>
  );
}
