import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { CarFront, LogOut, Menu, ShieldCheck, UserCircle, X } from "lucide-react";
import { useAutentikacija } from "../context/KontekstAutentikacije.jsx";

const stavkeNavigacije = [
  { to: "/", labela: "Početna" },
  { to: "/vozila", labela: "Vozila" },
  { to: "/rezervacije", labela: "Rezervacija" },
  { to: "/o-nama", labela: "O nama" },
  { to: "/kontakt", labela: "Kontakt" },
];

export default function Navigacija() {
  const [meniOtvoren, postaviMeniOtvoren] = useState(false);
  const { korisnik, adminJe, odjava } = useAutentikacija();
  const navigacija = useNavigate();
  const adminSakriveneRute = ["/rezervacije", "/o-nama", "/kontakt"];
  const vidljiveStavke = stavkeNavigacije.filter(
    (stavka) => !adminJe || !adminSakriveneRute.includes(stavka.to),
  );

  const odjaviKorisnika = () => {
    odjava();
    postaviMeniOtvoren(false);
    navigacija("/");
  };

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Glavna navigacija">
        <Link className="brand" to="/" onClick={() => postaviMeniOtvoren(false)}>
          <span className="brand-mark">
            <CarFront size={22} aria-hidden="true" />
          </span>
          <span>AdriaDrive</span>
        </Link>

        <button
          aria-label={meniOtvoren ? "Zatvori meni" : "Otvori meni"}
          className="nav-toggle"
          type="button"
          onClick={() => postaviMeniOtvoren((trenutno) => !trenutno)}
        >
          {meniOtvoren ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>

        <div className={`nav-menu ${meniOtvoren ? "is-open" : ""}`}>
          <div className="nav-links">
            {vidljiveStavke.map((stavka) => (
              <NavLink
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                key={stavka.to}
                to={stavka.to}
                onClick={() => postaviMeniOtvoren(false)}
              >
                {stavka.labela}
              </NavLink>
            ))}
            {adminJe && (
              <>
                <NavLink
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  to="/veh-info"
                  onClick={() => postaviMeniOtvoren(false)}
                >
                  Veh Info
                </NavLink>
                <NavLink
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  to="/admin"
                  onClick={() => postaviMeniOtvoren(false)}
                >
                  Admin
                </NavLink>
              </>
            )}
          </div>

          <div className="nav-actions">
            {korisnik ? (
              <>
                <span className="role-pill">
                  {adminJe ? <ShieldCheck size={15} aria-hidden="true" /> : <UserCircle size={15} aria-hidden="true" />}
                  {adminJe ? "Admin" : "Gost"}
                </span>
                <button className="btn btn-ghost btn-small" type="button" onClick={odjaviKorisnika}>
                  <LogOut size={16} aria-hidden="true" />
                  Odjava
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-ghost btn-small" to="/prijava" onClick={() => postaviMeniOtvoren(false)}>
                  Prijava
                </Link>
                <Link className="btn btn-primary btn-small" to="/registracija" onClick={() => postaviMeniOtvoren(false)}>
                  Registracija
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
