import { useEffect, useState } from "react";
import { CalendarCheck2, CheckCircle2, Edit3, Inbox, MessageSquareReply, Plus, Save, Trash2, X } from "lucide-react";
import GreskaPolja from "../components/GreskaPolja.jsx";
import Ucitaj from "../components/Ucitaj.jsx";
import { useObavijesti } from "../context/KontekstObavijesti.jsx";
import { useObrazac } from "../hooks/useObrazac.js";
import { porukeApi, rezervacijeApi, vozilaApi } from "../services/bazaApi.js";
import { formatirajCijenu, kreirajId, normalizujTekst } from "../utils/formatiranje.js";

const praznoVozilo = {
  naziv: "",
  marka: "",
  model: "",
  kategorija: "Economy",
  godiste: "2024",
  motor: "",
  transmisija: "Automatik",
  gorivo: "Benzin",
  sjedista: "5",
  cijenaPoDanu: "80",
  dostupno: true,
  slika: "",
  opis: "",
};

function validirajVozilo(vrijednosti) {
  const greske = {};

  if (vrijednosti.naziv.trim().length < 2) greske.naziv = "Naziv vozila je obavezan.";
  if (vrijednosti.marka.trim().length < 2) greske.marka = "Unesi proizvođača.";
  if (vrijednosti.model.trim().length < 1) greske.model = "Unesi model.";
  if (!vrijednosti.motor.trim()) greske.motor = "Unesi motor.";
  if (!vrijednosti.slika.trim()) greske.slika = "Unesi URL slike vozila.";
  if (Number(vrijednosti.godiste) < 1995 || Number(vrijednosti.godiste) > 2030) greske.godiste = "Godište mora biti između 1995 i 2030.";
  if (Number(vrijednosti.sjedista) < 2 || Number(vrijednosti.sjedista) > 9) greske.sjedista = "Broj sjedišta mora biti 2-9.";
  if (Number(vrijednosti.cijenaPoDanu) < 30) greske.cijenaPoDanu = "Cijena mora biti najmanje 30 KM.";
  if (vrijednosti.opis.trim().length < 20) greske.opis = "Opis mora imati najmanje 20 karaktera.";

  return greske;
}

function pripremiVozilo(vrijednosti, id) {
  return {
    id,
    naziv: vrijednosti.naziv.trim(),
    marka: vrijednosti.marka.trim(),
    model: vrijednosti.model.trim(),
    kategorija: vrijednosti.kategorija,
    godiste: Number(vrijednosti.godiste),
    motor: vrijednosti.motor.trim(),
    transmisija: vrijednosti.transmisija,
    gorivo: vrijednosti.gorivo,
    sjedista: Number(vrijednosti.sjedista),
    cijenaPoDanu: Number(vrijednosti.cijenaPoDanu),
    dostupno: Boolean(vrijednosti.dostupno),
    slika: vrijednosti.slika.trim(),
    opis: vrijednosti.opis.trim(),
  };
}

function rezervacijaJePotvrdjena(rezervacija) {
  const status = normalizujTekst(rezervacija.status);
  return Boolean(rezervacija.rentanjeAktivno) || status.includes("potvrd") || status.includes("aktiv");
}

export default function AdminPanel() {
  const obavijesti = useObavijesti();
  const [aktivnaSekcija, postaviAktivnuSekciju] = useState("vozila");
  const [vozila, postaviVozila] = useState([]);
  const [rezervacije, postaviRezervacije] = useState([]);
  const [poruke, postaviPoruke] = useState([]);
  const [ucitavanje, postaviUcitavanje] = useState(true);
  const [spremanje, postaviSpremanje] = useState(false);
  const [odgovori, postaviOdgovore] = useState({});
  const [odgovorSlanjeId, postaviOdgovorSlanjeId] = useState("");
  const [potvrdaSlanjeId, postaviPotvrdaSlanjeId] = useState("");
  const [voziloZaUredjivanje, postaviVoziloZaUredjivanje] = useState(null);
  const obrazac = useObrazac(praznoVozilo, validirajVozilo);

  // Admin panel istovremeno učitava sve kolekcije koje prikazuje u tabovima.
  const ucitajAdminPodatke = async () => {
    postaviUcitavanje(true);

    try {
      const [podaciVozila, podaciRezervacija, podaciPoruka] = await Promise.all([
        vozilaApi.dohvatiSve(),
        rezervacijeApi.dohvatiSve(),
        porukeApi.dohvatiSve(),
      ]);
      postaviVozila(podaciVozila);
      postaviRezervacije(podaciRezervacija);
      postaviPoruke(podaciPoruka);
      postaviOdgovore(
        podaciPoruka.reduce(
          (rezultat, poruka) => ({
            ...rezultat,
            [poruka.id]: poruka.odgovor || "",
          }),
          {},
        ),
      );
    } catch (trenutnaGreska) {
      obavijesti.greska(trenutnaGreska.message);
    } finally {
      postaviUcitavanje(false);
    }
  };

  useEffect(() => {
    ucitajAdminPodatke();
  }, []);

  useEffect(() => {
    if (voziloZaUredjivanje) {
      obrazac.resetuj({
        ...voziloZaUredjivanje,
        godiste: String(voziloZaUredjivanje.godiste),
        sjedista: String(voziloZaUredjivanje.sjedista),
        cijenaPoDanu: String(voziloZaUredjivanje.cijenaPoDanu),
      });
    } else {
      obrazac.resetuj(praznoVozilo);
    }
  }, [voziloZaUredjivanje]);

  const posaljiVozilo = async (dogadjaj) => {
    dogadjaj.preventDefault();

    // Ista forma se koristi za dodavanje i uređivanje; stanje `voziloZaUredjivanje` odlučuje koji REST poziv ide.
    if (!obrazac.validirajSve()) return;

    postaviSpremanje(true);

    try {
      if (voziloZaUredjivanje) {
        const pripremljenoVozilo = pripremiVozilo(obrazac.vrijednosti, voziloZaUredjivanje.id);
        const azuriranoVozilo = await vozilaApi.azuriraj(voziloZaUredjivanje.id, pripremljenoVozilo);
        postaviVozila((trenutnaVozila) =>
          trenutnaVozila.map((vozilo) => (vozilo.id === azuriranoVozilo.id ? azuriranoVozilo : vozilo)),
        );
        obavijesti.uspjeh("Vozilo je uspješno uređeno.");
      } else {
        const pripremljenoVozilo = pripremiVozilo(obrazac.vrijednosti, kreirajId("v"));
        const kreiranoVozilo = await vozilaApi.kreiraj(pripremljenoVozilo);
        postaviVozila((trenutnaVozila) => [kreiranoVozilo, ...trenutnaVozila]);
        obavijesti.uspjeh("Vozilo je dodano u flotu.");
      }

      postaviVoziloZaUredjivanje(null);
      obrazac.resetuj(praznoVozilo);
    } catch (trenutnaGreska) {
      obavijesti.greska(trenutnaGreska.message);
    } finally {
      postaviSpremanje(false);
    }
  };

  const obrisiVozilo = async (vozilo) => {
    const potvrda = window.confirm(`Obrisati vozilo ${vozilo.naziv}?`);
    if (!potvrda) return;

    try {
      await vozilaApi.obrisi(vozilo.id);
      postaviVozila((trenutnaVozila) => trenutnaVozila.filter((stavka) => stavka.id !== vozilo.id));
      obavijesti.uspjeh("Vozilo je obrisano iz flote.");
    } catch (trenutnaGreska) {
      obavijesti.greska(trenutnaGreska.message);
    }
  };

  const potvrdiRezervaciju = async (rezervacija) => {
    postaviPotvrdaSlanjeId(rezervacija.id);

    try {
      // Potvrdom se rezervacija pretvara u aktivno rentanje koje Veh Info moze pratiti.
      const azuriranaRezervacija = await rezervacijeApi.azuriraj(rezervacija.id, {
        ...rezervacija,
        status: "potvrdjena",
        rentanjeAktivno: true,
        potvrdjeno: rezervacija.potvrdjeno || new Date().toISOString(),
        lokacijaVozila: rezervacija.lokacijaVozila || rezervacija.lokacijaPreuzimanja || "Lokacija nije unesena",
        predjenaKilometraza: Number(rezervacija.predjenaKilometraza || 0),
        zakljucano: Boolean(rezervacija.zakljucano),
        softverskiUgaseno: Boolean(rezervacija.softverskiUgaseno),
        zadnjaKontrola: rezervacija.zadnjaKontrola || null,
      });

      postaviRezervacije((trenutneRezervacije) =>
        trenutneRezervacije.map((trenutnaRezervacija) =>
          trenutnaRezervacija.id === azuriranaRezervacija.id ? azuriranaRezervacija : trenutnaRezervacija,
        ),
      );
      obavijesti.uspjeh("Rezervacija je potvrdjena i prebacena u Veh Info.");
    } catch (trenutnaGreska) {
      obavijesti.greska(trenutnaGreska.message);
    } finally {
      postaviPotvrdaSlanjeId("");
    }
  };

  const promijeniOdgovor = (porukaId, tekst) => {
    postaviOdgovore((trenutniOdgovori) => ({
      ...trenutniOdgovori,
      [porukaId]: tekst,
    }));
  };

  const posaljiOdgovor = async (poruka) => {
    const odgovor = (odgovori[poruka.id] || "").trim();

    if (odgovor.length < 5) {
      obavijesti.greska("Odgovor mora imati najmanje 5 karaktera.");
      return;
    }

    postaviOdgovorSlanjeId(poruka.id);

    try {
      const azuriranaPoruka = await porukeApi.azuriraj(poruka.id, {
        ...poruka,
        odgovor,
        odgovoreno: new Date().toISOString(),
        odgovorProcitan: false,
      });
      postaviPoruke((trenutnePoruke) =>
        trenutnePoruke.map((trenutnaPoruka) =>
          trenutnaPoruka.id === azuriranaPoruka.id ? azuriranaPoruka : trenutnaPoruka,
        ),
      );
      obavijesti.uspjeh("Odgovor je poslan korisniku.");
    } catch (trenutnaGreska) {
      obavijesti.greska(trenutnaGreska.message);
    } finally {
      postaviOdgovorSlanjeId("");
    }
  };

  return (
    <section className="page-section admin-page">
      <div className="content-shell">
        <div className="page-heading admin-heading">
          <span className="eyebrow">Admin panel</span>
          <h1>Dashboard za flotu, rezervacije i korisničke upite</h1>
          <p>Pregledaj operacije najma, ažuriraj vozila i odgovori korisnicima iz jednog radnog panela.</p>
        </div>

        <div className="admin-stat-grid">
          <div className="glass-panel admin-stat">
            <span>Vozila</span>
            <strong>{vozila.length}</strong>
          </div>
          <div className="glass-panel admin-stat">
            <span>Rezervacije</span>
            <strong>{rezervacije.length}</strong>
          </div>
          <div className="glass-panel admin-stat">
            <span>Upiti</span>
            <strong>{poruke.length}</strong>
          </div>
        </div>

        <div className="tab-list" role="tablist" aria-label="Admin sekcije">
          <button className={aktivnaSekcija === "vozila" ? "active" : ""} type="button" onClick={() => postaviAktivnuSekciju("vozila")}>
            Flota
          </button>
          <button className={aktivnaSekcija === "rezervacije" ? "active" : ""} type="button" onClick={() => postaviAktivnuSekciju("rezervacije")}>
            Rezervacije
          </button>
          <button className={aktivnaSekcija === "poruke" ? "active" : ""} type="button" onClick={() => postaviAktivnuSekciju("poruke")}>
            Poruke
          </button>
        </div>

        {ucitavanje ? (
          <Ucitaj />
        ) : (
          <>
            {aktivnaSekcija === "vozila" && (
              <div className="admin-layout">
                <form className="glass-panel app-form admin-form" onSubmit={posaljiVozilo} noValidate>
                  <div className="form-heading">
                    <Plus size={20} aria-hidden="true" />
                    <h2>{voziloZaUredjivanje ? "Uredi vozilo" : "Dodaj vozilo u flotu"}</h2>
                  </div>

                  <div className="form-row">
                    <label className="form-field">
                      <span>Naziv vozila</span>
                      <input name="naziv" value={obrazac.vrijednosti.naziv} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja} />
                      <GreskaPolja poruka={obrazac.greske.naziv} />
                    </label>
                    <label className="form-field">
                      <span>Proizvođač</span>
                      <input name="marka" value={obrazac.vrijednosti.marka} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja} />
                      <GreskaPolja poruka={obrazac.greske.marka} />
                    </label>
                  </div>

                  <div className="form-row">
                    <label className="form-field">
                      <span>Model</span>
                      <input name="model" value={obrazac.vrijednosti.model} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja} />
                      <GreskaPolja poruka={obrazac.greske.model} />
                    </label>
                    <label className="form-field">
                      <span>Kategorija</span>
                      <select name="kategorija" value={obrazac.vrijednosti.kategorija} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja}>
                        <option value="Economy">Economy</option>
                        <option value="Compact">Compact</option>
                        <option value="Business">Business</option>
                        <option value="Premium">Premium</option>
                        <option value="Family">Family</option>
                        <option value="SUV">SUV</option>
                        <option value="Electric">Electric</option>
                      </select>
                    </label>
                  </div>

                  <div className="form-row">
                    <label className="form-field">
                      <span>Godište</span>
                      <input name="godiste" type="number" value={obrazac.vrijednosti.godiste} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja} />
                      <GreskaPolja poruka={obrazac.greske.godiste} />
                    </label>
                    <label className="form-field">
                      <span>Motor</span>
                      <input name="motor" value={obrazac.vrijednosti.motor} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja} />
                      <GreskaPolja poruka={obrazac.greske.motor} />
                    </label>
                  </div>

                  <div className="form-row">
                    <label className="form-field">
                      <span>Transmisija</span>
                      <select name="transmisija" value={obrazac.vrijednosti.transmisija} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja}>
                        <option value="Automatik">Automatik</option>
                        <option value="Manuelni">Manuelni</option>
                      </select>
                    </label>
                    <label className="form-field">
                      <span>Gorivo</span>
                      <select name="gorivo" value={obrazac.vrijednosti.gorivo} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja}>
                        <option value="Benzin">Benzin</option>
                        <option value="Dizel">Dizel</option>
                        <option value="Hibrid">Hibrid</option>
                        <option value="Električni">Električni</option>
                      </select>
                    </label>
                  </div>

                  <div className="form-row">
                    <label className="form-field">
                      <span>Sjedišta</span>
                      <input name="sjedista" type="number" value={obrazac.vrijednosti.sjedista} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja} />
                      <GreskaPolja poruka={obrazac.greske.sjedista} />
                    </label>
                    <label className="form-field">
                      <span>Cijena po danu</span>
                      <input name="cijenaPoDanu" type="number" value={obrazac.vrijednosti.cijenaPoDanu} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja} />
                      <GreskaPolja poruka={obrazac.greske.cijenaPoDanu} />
                    </label>
                  </div>

                  <label className="form-field">
                    <span>URL slike</span>
                    <input name="slika" value={obrazac.vrijednosti.slika} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja} />
                    <GreskaPolja poruka={obrazac.greske.slika} />
                  </label>

                  <label className="form-field">
                    <span>Opis vozila</span>
                    <textarea name="opis" rows="4" value={obrazac.vrijednosti.opis} onBlur={obrazac.napustanjePolja} onChange={obrazac.promjenaPolja} />
                    <GreskaPolja poruka={obrazac.greske.opis} />
                  </label>

                  <label className="switch-field">
                    <input name="dostupno" type="checkbox" checked={obrazac.vrijednosti.dostupno} onChange={obrazac.promjenaPolja} />
                    <span>Dostupno za rentanje</span>
                  </label>

                  <div className="form-actions">
                    <button className="btn btn-primary" disabled={spremanje} type="submit">
                      <Save size={17} aria-hidden="true" />
                      {spremanje ? "Spremanje..." : voziloZaUredjivanje ? "Spremi izmjene" : "Dodaj vozilo"}
                    </button>
                    {voziloZaUredjivanje && (
                      <button className="btn btn-ghost" type="button" onClick={() => postaviVoziloZaUredjivanje(null)}>
                        <X size={17} aria-hidden="true" />
                        Odustani
                      </button>
                    )}
                  </div>
                </form>

                <div className="admin-list">
                  {vozila.map((vozilo) => (
                    <article className="admin-red-vozila glass-panel" key={vozilo.id}>
                      <img src={vozilo.slika} alt={vozilo.naziv} />
                      <div>
                        <span className="eyebrow">{vozilo.kategorija}</span>
                        <h3>{vozilo.naziv}</h3>
                        <p>
                          {vozilo.godiste} - {vozilo.motor} - {vozilo.transmisija} - {vozilo.gorivo}
                        </p>
                        <strong>{formatirajCijenu(vozilo.cijenaPoDanu)} / dan</strong>
                      </div>
                      <div className="row-actions">
                        <button className="icon-btn" title="Uredi vozilo" type="button" onClick={() => postaviVoziloZaUredjivanje(vozilo)}>
                          <Edit3 size={17} aria-hidden="true" />
                        </button>
                        <button className="icon-btn danger" title="Obriši vozilo" type="button" onClick={() => obrisiVozilo(vozilo)}>
                          <Trash2 size={17} aria-hidden="true" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {aktivnaSekcija === "rezervacije" && (
              <div className="data-list">
                {rezervacije.map((rezervacija) => (
                  <article className="data-row glass-panel" key={rezervacija.id}>
                    <CalendarCheck2 size={22} aria-hidden="true" />
                    <div>
                      <h3>{rezervacija.nazivVozila}</h3>
                      <p>
                        {rezervacija.imeIPrezime} - {rezervacija.email} - {rezervacija.telefon}
                      </p>
                      <span>
                        {rezervacija.datumPreuzimanja} do {rezervacija.datumPovrata}, {rezervacija.brojDana} dana,
                        popust {formatirajCijenu(rezervacija.popust || 0)}, ukupno {formatirajCijenu(rezervacija.ukupno)}
                      </span>
                    </div>
                    <div className="reservation-actions">
                      <strong>{rezervacija.status}</strong>
                      {!rezervacijaJePotvrdjena(rezervacija) && (
                        <button
                          className="btn btn-primary btn-small"
                          disabled={potvrdaSlanjeId === rezervacija.id}
                          type="button"
                          onClick={() => potvrdiRezervaciju(rezervacija)}
                        >
                          <CheckCircle2 size={16} aria-hidden="true" />
                          {potvrdaSlanjeId === rezervacija.id ? "Potvrda..." : "Potvrdi"}
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}

            {aktivnaSekcija === "poruke" && (
              <div className="data-list">
                {poruke.map((poruka) => (
                  <article className="data-row data-row-expanded glass-panel" key={poruka.id}>
                    <Inbox size={22} aria-hidden="true" />
                    <div>
                      <h3>{poruka.predmet}</h3>
                      <p>
                        {poruka.ime} - {poruka.email}
                      </p>
                      <span>{poruka.poruka}</span>
                      {poruka.odgovor && (
                        <div className="admin-odgovor">
                          <span>Poslan odgovor</span>
                          <p>{poruka.odgovor}</p>
                        </div>
                      )}
                      <label className="form-field odgovor-admina">
                        <span>Odgovor korisniku</span>
                        <textarea
                          name={`odgovor-${poruka.id}`}
                          rows="3"
                          value={odgovori[poruka.id] || ""}
                          onChange={(dogadjaj) => promijeniOdgovor(poruka.id, dogadjaj.target.value)}
                        />
                      </label>
                      <button
                        className="btn btn-primary"
                        disabled={odgovorSlanjeId === poruka.id}
                        type="button"
                        onClick={() => posaljiOdgovor(poruka)}
                      >
                        <MessageSquareReply size={17} aria-hidden="true" />
                        {odgovorSlanjeId === poruka.id ? "Slanje..." : "Pošalji odgovor"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
