import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import GreskaPolja from "../components/GreskaPolja.jsx";
import { useAutentikacija } from "../context/KontekstAutentikacije.jsx";
import { useObavijesti } from "../context/KontekstObavijesti.jsx";
import { useObrazac } from "../hooks/useObrazac.js";
import { emailObrazac } from "../utils/formatiranje.js";

const pocetnaRegistracija = {
  ime: "",
  email: "",
  lozinka: "",
  potvrdaLozinke: "",
};

function validirajRegistraciju(vrijednosti) {
  const greske = {};

  if (vrijednosti.ime.trim().length < 2) greske.ime = "Ime mora imati najmanje 2 karaktera.";
  if (!emailObrazac.test(vrijednosti.email)) greske.email = "Unesi ispravan email.";
  if (vrijednosti.lozinka.length < 6) greske.lozinka = "Lozinka mora imati najmanje 6 karaktera.";
  if (vrijednosti.potvrdaLozinke !== vrijednosti.lozinka) greske.potvrdaLozinke = "Lozinke se ne poklapaju.";

  return greske;
}

export default function Registracija() {
  const { registracija } = useAutentikacija();
  const obavijesti = useObavijesti();
  const navigacija = useNavigate();
  const [slanje, postaviSlanje] = useState(false);
  const obrazac = useObrazac(pocetnaRegistracija, validirajRegistraciju);

  const posaljiRegistraciju = async (dogadjaj) => {
    dogadjaj.preventDefault();

    if (!obrazac.validirajSve()) return;

    postaviSlanje(true);

    try {
      const korisnik = await registracija(obrazac.vrijednosti);
      obavijesti.uspjeh(`Profil je kreiran. Dobrodošli, ${korisnik.ime}.`);
      navigacija("/vozila", { replace: true });
    } catch (trenutnaGreska) {
      obrazac.postaviGreske({ obrazac: trenutnaGreska.message });
    } finally {
      postaviSlanje(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-shell register-shell">
        <div className="auth-copy">
          <span className="eyebrow">Registracija</span>
          <h1>Kreiraj Gost profil</h1>
          <p>Registrovani Gost korisnik može pristupiti stranici za rezervacije i slati zahtjeve za najam vozila.</p>
        </div>

        <form className="glass-panel app-form auth-form" onSubmit={posaljiRegistraciju} noValidate>
          <label className="form-field">
            <span>Ime i prezime</span>
            <input name="ime" value={obrazac.vrijednosti.ime} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja} />
            <GreskaPolja poruka={obrazac.greske.ime} />
          </label>

          <label className="form-field">
            <span>Email</span>
            <input name="email" type="email" value={obrazac.vrijednosti.email} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja} />
            <GreskaPolja poruka={obrazac.greske.email} />
          </label>

          <div className="form-row">
            <label className="form-field">
              <span>Lozinka</span>
              <input name="lozinka" type="password" value={obrazac.vrijednosti.lozinka} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja} />
              <GreskaPolja poruka={obrazac.greske.lozinka} />
            </label>
            <label className="form-field">
              <span>Potvrda lozinke</span>
              <input name="potvrdaLozinke" type="password" value={obrazac.vrijednosti.potvrdaLozinke} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja} />
              <GreskaPolja poruka={obrazac.greske.potvrdaLozinke} />
            </label>
          </div>

          <GreskaPolja poruka={obrazac.greske.obrazac} />

          <button className="btn btn-primary btn-large" disabled={slanje} type="submit">
            <UserPlus size={18} aria-hidden="true" />
            {slanje ? "Kreiranje..." : "Registruj se"}
          </button>

          <p className="form-note">
            Već imaš profil? <Link to="/prijava">Prijavi se</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
