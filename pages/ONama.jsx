import { Award, Clock, MessageSquareReply, UsersRound } from "lucide-react";

export default function ONama() {
  return (
    <section className="page-section">
      <div className="content-shell about-layout">
        <div className="page-heading">
          <span className="eyebrow">O nama</span>
          <h1>Pouzdan rent a car za grad, posao i putovanja</h1>
          <p>
            AdriaDrive nudi preglednu flotu, jasne cijene i brzu komunikaciju sa timom za najam vozila.
          </p>
        </div>

        <div className="about-copy">
          <p>
            Fokus je na jednostavnom procesu: izaberi vozilo, pošalji rezervaciju i dogovori preuzimanje bez nepotrebnih koraka.
          </p>
          <p>
            Tim prati dostupnost vozila, obrađuje rezervacije i odgovara korisnicima kroz isti servis, tako da se svaki upit može pratiti od slanja do odgovora.
          </p>
        </div>

        <div className="feature-grid about-feature-grid">
          <div className="feature-item">
            <UsersRound size={26} aria-hidden="true" />
            <h3>Korisnici</h3>
            <p>Gost pregleda vozila, šalje rezervacije i prima odgovor administracije na svoje upite.</p>
          </div>
          <div className="feature-item">
            <Clock size={26} aria-hidden="true" />
            <h3>Dostupnost</h3>
            <p>Flota se uređuje kroz admin panel, pa korisnik vidi aktuelne cijene i status vozila.</p>
          </div>
          <div className="feature-item">
            <MessageSquareReply size={26} aria-hidden="true" />
            <h3>Komunikacija</h3>
            <p>Admin može odgovoriti na poruku, a korisnik dobija odgovor pri sljedećoj prijavi.</p>
          </div>
          <div className="feature-item">
            <Award size={26} aria-hidden="true" />
            <h3>Usluga</h3>
            <p>Za najam duži od 5 dana automatski se obračunava popust od 20 KM.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
