import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import GreskaPolja from "../components/GreskaPolja.jsx";
import { useAutentikacija } from "../context/KontekstAutentikacije.jsx";
import { useObavijesti } from "../context/KontekstObavijesti.jsx";
import { useObrazac } from "../hooks/useObrazac.js";
import { emailObrazac } from "../utils/formatiranje.js";

const pocetnaPrijava = {
  email: "",
  lozinka: "",
};

function validirajPrijavu(vrijednosti) {
  const greske = {};

  if (!emailObrazac.test(vrijednosti.email)) greske.email = "Unesi ispravan email.";
  if (!vrijednosti.lozinka) greske.lozinka = "Lozinka je obavezna.";

  return greske;
}

export default function Prijava() {
  const { prijava } = useAutentikacija();
  const obavijesti = useObavijesti();
  const navigacija = useNavigate();
  const lokacija = useLocation();
  const [slanje, postaviSlanje] = useState(false);
  const obrazac = useObrazac(pocetnaPrijava, validirajPrijavu);

  const rutaNakonPrijave = lokacija.state?.from?.pathname || "/vozila";

  const posaljiPrijavu = async (dogadjaj) => {
    dogadjaj.preventDefault();

    if (!obrazac.validirajSve()) return;

    postaviSlanje(true);

    try {
      const korisnik = await prijava(obrazac.vrijednosti);
      obavijesti.uspjeh(`Dobrodošli, ${korisnik.ime}.`);
      navigacija(korisnik.uloga === "admin" ? "/admin" : rutaNakonPrijave, { replace: true });
    } catch (trenutnaGreska) {
      obrazac.postaviGreske({ obrazac: trenutnaGreska.message });
    } finally {
      postaviSlanje(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-shell">
        <div className="auth-copy">
          <span className="eyebrow">Prijava</span>
          <h1>Uđi u svoj AdriaDrive profil</h1>
          <p>Admin upravlja flotom i upitima, a Gost šalje rezervacije i prima odgovore administracije.</p>
          <div className="demo-access">
            <strong>Pristupni podaci</strong>
            <span>admin@adriadrive.ba / admin123</span>
            <span>gost@adriadrive.ba / gost123</span>
          </div>
        </div>

        <form className="glass-panel app-form auth-form" onSubmit={posaljiPrijavu} noValidate>
          <label className="form-field">
            <span>Email</span>
            <input name="email" type="email" value={obrazac.vrijednosti.email} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja} />
            <GreskaPolja poruka={obrazac.greske.email} />
          </label>

          <label className="form-field">
            <span>Lozinka</span>
            <input name="lozinka" type="password" value={obrazac.vrijednosti.lozinka} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja} />
            <GreskaPolja poruka={obrazac.greske.lozinka} />
          </label>

          <GreskaPolja poruka={obrazac.greske.obrazac} />

          <button className="btn btn-primary btn-large" disabled={slanje} type="submit">
            <LogIn size={18} aria-hidden="true" />
            {slanje ? "Provjera..." : "Prijavi se"}
          </button>

          <p className="form-note">
            Nemaš profil? <Link to="/registracija">Registruj se</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
