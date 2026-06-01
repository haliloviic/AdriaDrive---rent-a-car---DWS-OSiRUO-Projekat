import { Navigate, useLocation } from "react-router-dom";
import { useAutentikacija } from "../context/KontekstAutentikacije.jsx";

export default function ZasticenaRuta({ children, uloge }) {
  const { korisnik } = useAutentikacija();
  const lokacija = useLocation();

  if (!korisnik) {
    return <Navigate to="/prijava" replace state={{ from: lokacija }} />;
  }

  if (uloge?.length && !uloge.includes(korisnik.uloga)) {
    return <Navigate to="/zabranjeno" replace />;
  }

  return children;
}
