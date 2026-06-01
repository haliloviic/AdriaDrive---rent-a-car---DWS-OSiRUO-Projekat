import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navigacija from "./components/Navigacija.jsx";
import Podnozje from "./components/Podnozje.jsx";
import ZasticenaRuta from "./components/ZasticenaRuta.jsx";
import Pocetna from "./pages/Pocetna.jsx";
import Flota from "./pages/Flota.jsx";
import DetaljiVozila from "./pages/DetaljiVozila.jsx";
import PretragaVozila from "./pages/PretragaVozila.jsx";
import Rezervacija from "./pages/Rezervacija.jsx";
import ONama from "./pages/ONama.jsx";
import Kontakt from "./pages/Kontakt.jsx";
import Prijava from "./pages/Prijava.jsx";
import Registracija from "./pages/Registracija.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import VehInfo from "./pages/VehInfo.jsx";
import ZabranjenPristup from "./pages/ZabranjenPristup.jsx";
import NijePronadjeno from "./pages/NijePronadjeno.jsx";
import ObavijestiKorisnika from "./components/ObavijestiKorisnika.jsx";

function VratiNaVrh() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <div className="app-shell">
      <VratiNaVrh />
      <ObavijestiKorisnika />
      <Navigacija />
      <main>
        <Routes>
          <Route path="/" element={<Pocetna />} />
          <Route path="/vozila" element={<Flota />} />
          <Route path="/vozila/model/:upit" element={<PretragaVozila />} />
          <Route path="/vozila/:id" element={<DetaljiVozila />} />
          <Route
            path="/rezervacije"
            element={
              <ZasticenaRuta uloge={["gost"]}>
                <Rezervacija />
              </ZasticenaRuta>
            }
          />
          <Route path="/o-nama" element={<ONama />} />
          <Route path="/kontakt" element={<Kontakt />} />
          <Route path="/prijava" element={<Prijava />} />
          <Route path="/registracija" element={<Registracija />} />
          <Route
            path="/admin"
            element={
              <ZasticenaRuta uloge={["admin"]}>
                <AdminPanel />
              </ZasticenaRuta>
            }
          />
          <Route
            path="/veh-info"
            element={
              <ZasticenaRuta uloge={["admin"]}>
                <VehInfo />
              </ZasticenaRuta>
            }
          />
          <Route path="/zabranjeno" element={<ZabranjenPristup />} />
          <Route path="*" element={<NijePronadjeno />} />
        </Routes>
      </main>
      <Podnozje />
    </div>
  );
}
