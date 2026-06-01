import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarCheck2, Calculator, MapPin } from "lucide-react";
import GreskaPolja from "../components/GreskaPolja.jsx";
import Ucitaj from "../components/Ucitaj.jsx";
import { useAutentikacija } from "../context/KontekstAutentikacije.jsx";
import { useObavijesti } from "../context/KontekstObavijesti.jsx";
import { useDohvat } from "../hooks/useDohvat.js";
import { useObrazac } from "../hooks/useObrazac.js";
import { rezervacijeApi, vozilaApi } from "../services/bazaApi.js";
import { brojDanaNajma, emailObrazac, formatirajCijenu, kreirajId } from "../utils/formatiranje.js";

const pocetnaRezervacija = {
  voziloId: "",
  imeIPrezime: "",
  email: "",
  telefon: "",
  lokacijaPreuzimanja: "Sarajevo - poslovnica Centar",
  datumPreuzimanja: "",
  datumPovrata: "",
};

function validirajRezervaciju(vrijednosti) {
  const greske = {};

  if (!vrijednosti.voziloId) greske.voziloId = "Odaberi vozilo za rezervaciju.";
  if (vrijednosti.imeIPrezime.trim().length < 2) greske.imeIPrezime = "Ime mora imati najmanje 2 karaktera.";
  if (!emailObrazac.test(vrijednosti.email)) greske.email = "Unesi ispravan email.";
  if (vrijednosti.telefon.trim().length < 7) greske.telefon = "Unesi broj telefona.";
  if (!vrijednosti.lokacijaPreuzimanja) greske.lokacijaPreuzimanja = "Odaberi lokaciju preuzimanja.";
  if (!vrijednosti.datumPreuzimanja) greske.datumPreuzimanja = "Odaberi datum preuzimanja.";
  if (!vrijednosti.datumPovrata) greske.datumPovrata = "Odaberi datum povrata.";

  if (
    vrijednosti.datumPreuzimanja &&
    vrijednosti.datumPovrata &&
    brojDanaNajma(vrijednosti.datumPreuzimanja, vrijednosti.datumPovrata) <= 0
  ) {
    greske.datumPovrata = "Datum povrata mora biti nakon datuma preuzimanja.";
  }

  return greske;
}

export default function Rezervacija() {
  const [parametriPretrage] = useSearchParams();
  const { korisnik } = useAutentikacija();
  const obavijesti = useObavijesti();
  const [slanje, postaviSlanje] = useState(false);
  const { podaci: vozila = [], ucitavanje, greska } = useDohvat(() => vozilaApi.dohvatiSve(), []);
  const voziloIzUrl = parametriPretrage.get("vozilo") || "";

  const obrazac = useObrazac(
    {
      ...pocetnaRezervacija,
      voziloId: voziloIzUrl,
      imeIPrezime: korisnik?.ime || "",
      email: korisnik?.email || "",
    },
    validirajRezervaciju,
  );

  useEffect(() => {
    obrazac.resetuj({
      ...pocetnaRezervacija,
      voziloId: voziloIzUrl,
      imeIPrezime: korisnik?.ime || "",
      email: korisnik?.email || "",
    });
  }, [voziloIzUrl, korisnik?.email, korisnik?.ime]);

  const dostupnaVozila = useMemo(() => (vozila || []).filter((vozilo) => vozilo.dostupno), [vozila]);
  const odabranoVozilo = dostupnaVozila.find((vozilo) => vozilo.id === obrazac.vrijednosti.voziloId);
  const brojDana = brojDanaNajma(obrazac.vrijednosti.datumPreuzimanja, obrazac.vrijednosti.datumPovrata);
  const osnovnaCijena = odabranoVozilo ? brojDana * Number(odabranoVozilo.cijenaPoDanu) : 0;
  const popust = brojDana > 5 ? 20 : 0;
  const ukupno = Math.max(osnovnaCijena - popust, 0);

  const posaljiRezervaciju = async (dogadjaj) => {
    dogadjaj.preventDefault();

    if (!obrazac.validirajSve() || !odabranoVozilo) return;

    postaviSlanje(true);

    try {
      await rezervacijeApi.kreiraj({
        id: kreirajId("r"),
        korisnikId: korisnik.id,
        voziloId: odabranoVozilo.id,
        nazivVozila: odabranoVozilo.naziv,
        imeIPrezime: obrazac.vrijednosti.imeIPrezime.trim(),
        email: obrazac.vrijednosti.email.trim().toLowerCase(),
        telefon: obrazac.vrijednosti.telefon.trim(),
        lokacijaPreuzimanja: obrazac.vrijednosti.lokacijaPreuzimanja,
        datumPreuzimanja: obrazac.vrijednosti.datumPreuzimanja,
        datumPovrata: obrazac.vrijednosti.datumPovrata,
        brojDana,
        popust,
        ukupno,
        status: "na čekanju",
        kreirano: new Date().toISOString(),
      });
      obavijesti.uspjeh("Rezervacija je poslana. Tim će potvrditi termin preuzimanja.");
      obrazac.resetuj({
        ...pocetnaRezervacija,
        imeIPrezime: korisnik?.ime || "",
        email: korisnik?.email || "",
      });
    } catch (trenutnaGreska) {
      obavijesti.greska(trenutnaGreska.message);
    } finally {
      postaviSlanje(false);
    }
  };

  return (
    <section className="page-section">
      <div className="content-shell mreza-rezervacije">
        <div className="page-heading">
          <span className="eyebrow">Gost rezervacija</span>
          <h1>Rezerviši vozilo iz aktivne flote</h1>
          <p>Za najam duži od 5 dana automatski se obračunava 20 KM popusta.</p>
        </div>

        <form className="glass-panel app-form" onSubmit={posaljiRezervaciju} noValidate>
          {ucitavanje && <Ucitaj tekst="Učitavanje dostupnih vozila..." />}
          {greska && <p className="status-message error">Nije moguće učitati vozila.</p>}

          {!ucitavanje && (
            <>
              <label className="form-field">
                <span>Vozilo</span>
                <select name="voziloId" value={obrazac.vrijednosti.voziloId} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja}>
                  <option value="">Odaberi vozilo</option>
                  {dostupnaVozila.map((vozilo) => (
                    <option key={vozilo.id} value={vozilo.id}>
                      {vozilo.naziv} - {formatirajCijenu(vozilo.cijenaPoDanu)} / dan
                    </option>
                  ))}
                </select>
                <GreskaPolja poruka={obrazac.greske.voziloId} />
              </label>

              <div className="form-row">
                <label className="form-field">
                  <span>Ime i prezime</span>
                  <input name="imeIPrezime" value={obrazac.vrijednosti.imeIPrezime} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja} />
                  <GreskaPolja poruka={obrazac.greske.imeIPrezime} />
                </label>
                <label className="form-field">
                  <span>Email</span>
                  <input name="email" type="email" value={obrazac.vrijednosti.email} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja} />
                  <GreskaPolja poruka={obrazac.greske.email} />
                </label>
              </div>

              <div className="form-row">
                <label className="form-field">
                  <span>Telefon</span>
                  <input name="telefon" placeholder="+387 61 000 000" value={obrazac.vrijednosti.telefon} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja} />
                  <GreskaPolja poruka={obrazac.greske.telefon} />
                </label>
                <label className="form-field">
                  <span>Lokacija</span>
                  <select name="lokacijaPreuzimanja" value={obrazac.vrijednosti.lokacijaPreuzimanja} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja}>
                    <option value="Sarajevo - poslovnica Centar">Sarajevo - poslovnica Centar</option>
                    <option value="Sarajevo International Airport">Sarajevo International Airport</option>
                    <option value="Mostar - partnerska lokacija">Mostar - partnerska lokacija</option>
                    <option value="Tuzla - partnerska lokacija">Tuzla - partnerska lokacija</option>
                  </select>
                  <GreskaPolja poruka={obrazac.greske.lokacijaPreuzimanja} />
                </label>
              </div>

              <div className="form-row">
                <label className="form-field">
                  <span>Datum preuzimanja</span>
                  <input name="datumPreuzimanja" type="date" value={obrazac.vrijednosti.datumPreuzimanja} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja} />
                  <GreskaPolja poruka={obrazac.greske.datumPreuzimanja} />
                </label>
                <label className="form-field">
                  <span>Datum povrata</span>
                  <input name="datumPovrata" type="date" value={obrazac.vrijednosti.datumPovrata} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja} />
                  <GreskaPolja poruka={obrazac.greske.datumPovrata} />
                </label>
              </div>

              <button className="btn btn-primary btn-large" disabled={slanje} type="submit">
                <CalendarCheck2 size={18} aria-hidden="true" />
                {slanje ? "Slanje..." : "Pošalji rezervaciju"}
              </button>
            </>
          )}
        </form>

        <aside className="sazetak-rezervacije glass-panel">
          <div className="summary-icon">
            <Calculator size={25} aria-hidden="true" />
          </div>
          <span className="eyebrow">Procjena najma</span>
          <h2>{odabranoVozilo ? odabranoVozilo.naziv : "Odaberi vozilo"}</h2>
          <div className="summary-lines">
            <span>
              <strong>{brojDana}</strong>
              dana
            </span>
            <span>
              <strong>{odabranoVozilo ? formatirajCijenu(odabranoVozilo.cijenaPoDanu) : "0 KM"}</strong>
              po danu
            </span>
            <span>
              <strong>{formatirajCijenu(popust)}</strong>
              popust
            </span>
            <span>
              <strong>{formatirajCijenu(ukupno)}</strong>
              ukupno
            </span>
          </div>
          <p>
            <MapPin size={16} aria-hidden="true" />
            Preuzimanje: {obrazac.vrijednosti.lokacijaPreuzimanja}
          </p>
        </aside>
      </div>
    </section>
  );
}
