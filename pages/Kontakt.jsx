import { useEffect, useState } from "react";
import { Mail, MapPin, MessageSquareReply, Send, Smartphone } from "lucide-react";
import GreskaPolja from "../components/GreskaPolja.jsx";
import { useAutentikacija } from "../context/KontekstAutentikacije.jsx";
import { useObavijesti } from "../context/KontekstObavijesti.jsx";
import { useObrazac } from "../hooks/useObrazac.js";
import { porukeApi } from "../services/bazaApi.js";
import { emailObrazac, kreirajId } from "../utils/formatiranje.js";

const pocetnaPoruka = {
  ime: "",
  email: "",
  predmet: "",
  poruka: "",
};

function validirajPoruku(vrijednosti) {
  const greske = {};

  if (vrijednosti.ime.trim().length < 2) greske.ime = "Ime mora imati najmanje 2 karaktera.";
  if (!emailObrazac.test(vrijednosti.email)) greske.email = "Unesi ispravan email.";
  if (vrijednosti.predmet.trim().length < 3) greske.predmet = "Predmet mora imati najmanje 3 karaktera.";
  if (vrijednosti.poruka.trim().length < 12) greske.poruka = "Poruka mora imati najmanje 12 karaktera.";

  return greske;
}

export default function Kontakt() {
  const { korisnik } = useAutentikacija();
  const obavijesti = useObavijesti();
  const [slanje, postaviSlanje] = useState(false);
  const [mojePoruke, postaviMojePoruke] = useState([]);
  const obrazac = useObrazac(
    {
      ...pocetnaPoruka,
      ime: korisnik?.ime || "",
      email: korisnik?.email || "",
    },
    validirajPoruku,
  );

  const ucitajMojePoruke = async () => {
    if (!korisnik || korisnik.uloga !== "gost") return;
    const poruke = await porukeApi.dohvatiZaKorisnika(korisnik.id);
    postaviMojePoruke(poruke.reverse());
  };

  useEffect(() => {
    obrazac.resetuj({
      ...pocetnaPoruka,
      ime: korisnik?.ime || "",
      email: korisnik?.email || "",
    });
    ucitajMojePoruke().catch((greska) => obavijesti.greska(greska.message));
  }, [korisnik?.id]);

  const posaljiPoruku = async (dogadjaj) => {
    dogadjaj.preventDefault();

    if (!obrazac.validirajSve()) return;

    postaviSlanje(true);

    try {
      await porukeApi.kreiraj({
        id: kreirajId("p"),
        korisnikId: korisnik?.uloga === "gost" ? korisnik.id : null,
        ime: obrazac.vrijednosti.ime.trim(),
        email: obrazac.vrijednosti.email.trim().toLowerCase(),
        predmet: obrazac.vrijednosti.predmet.trim(),
        poruka: obrazac.vrijednosti.poruka.trim(),
        odgovor: "",
        odgovoreno: "",
        odgovorProcitan: false,
        kreirano: new Date().toISOString(),
      });
      obavijesti.uspjeh("Poruka je poslana. Odgovor će se prikazati u tvom profilu nakon admin odgovora.");
      obrazac.resetuj({
        ...pocetnaPoruka,
        ime: korisnik?.ime || "",
        email: korisnik?.email || "",
      });
      await ucitajMojePoruke();
    } catch (trenutnaGreska) {
      obavijesti.greska(trenutnaGreska.message);
    } finally {
      postaviSlanje(false);
    }
  };

  return (
    <section className="page-section">
      <div className="content-shell mreza-kontakta">
        <div>
          <div className="page-heading">
            <span className="eyebrow">Kontakt</span>
            <h1>Pošalji upit ili pronađi poslovnicu</h1>
            <p>Piši timu za dostupnost, produženje najma, preuzimanje vozila ili posebne zahtjeve.</p>
          </div>

          <div className="kontakt-podaci">
            <span>
              <MapPin size={18} aria-hidden="true" />
              Obala Kulina bana 18, Sarajevo
            </span>
            <span>
              <Smartphone size={18} aria-hidden="true" />
              +387 33 555 800
            </span>
            <span>
              <Mail size={18} aria-hidden="true" />
              info@adriadrive.ba
            </span>
          </div>
        </div>

        <form className="glass-panel app-form" onSubmit={posaljiPoruku} noValidate>
          <label className="form-field">
            <span>Ime</span>
            <input name="ime" value={obrazac.vrijednosti.ime} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja} />
            <GreskaPolja poruka={obrazac.greske.ime} />
          </label>

          <label className="form-field">
            <span>Email</span>
            <input name="email" type="email" value={obrazac.vrijednosti.email} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja} />
            <GreskaPolja poruka={obrazac.greske.email} />
          </label>

          <label className="form-field">
            <span>Predmet</span>
            <input name="predmet" value={obrazac.vrijednosti.predmet} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja} />
            <GreskaPolja poruka={obrazac.greske.predmet} />
          </label>

          <label className="form-field">
            <span>Poruka</span>
            <textarea name="poruka" rows="5" value={obrazac.vrijednosti.poruka} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja} />
            <GreskaPolja poruka={obrazac.greske.poruka} />
          </label>

          <button className="btn btn-primary btn-large" disabled={slanje} type="submit">
            <Send size={18} aria-hidden="true" />
            {slanje ? "Slanje..." : "Pošalji poruku"}
          </button>
        </form>

        {korisnik?.uloga === "gost" && (
          <div className="glass-panel korisnicke-poruke">
            <div className="form-heading">
              <MessageSquareReply size={20} aria-hidden="true" />
              <h2>Moji upiti</h2>
            </div>
            {mojePoruke.length === 0 ? (
              <p>Još nema poslanih upita.</p>
            ) : (
              mojePoruke.map((poruka) => (
                <article className="poruka-klijenta" key={poruka.id}>
                  <strong>{poruka.predmet}</strong>
                  <p>{poruka.poruka}</p>
                  {poruka.odgovor ? (
                    <div className="admin-odgovor">
                      <span>Odgovor administracije</span>
                      <p>{poruka.odgovor}</p>
                    </div>
                  ) : (
                    <small>Odgovor još nije poslan.</small>
                  )}
                </article>
              ))
            )}
          </div>
        )}

        <div className="map-panel glass-panel">
          <iframe
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=Sarajevo%20Bascarsija&output=embed"
            title="Google Maps lokacija AdriaDrive poslovnice u Sarajevu"
          />
        </div>
      </div>
    </section>
  );
}
