import { createContext, useContext, useMemo, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { kreirajId } from "../utils/formatiranje.js";

const KontekstObavijesti = createContext(null);

export function PruzalacObavijesti({ children }) {
  const [obavijesti, postaviObavijesti] = useState([]);

  const ukloniObavijest = (id) => {
    postaviObavijesti((trenutne) => trenutne.filter((obavijest) => obavijest.id !== id));
  };

  const dodajObavijest = (tekst, tip = "uspjeh") => {
    const id = kreirajId("obavijest");
    postaviObavijesti((trenutne) => [...trenutne, { id, tekst, tip }]);
    window.setTimeout(() => ukloniObavijest(id), 4200);
  };

  const vrijednost = useMemo(
    () => ({
      uspjeh: (tekst) => dodajObavijest(tekst, "uspjeh"),
      greska: (tekst) => dodajObavijest(tekst, "greska"),
      info: (tekst) => dodajObavijest(tekst, "info"),
    }),
    [],
  );

  return (
    <KontekstObavijesti.Provider value={vrijednost}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {obavijesti.map((obavijest) => {
          const Ikona = obavijest.tip === "greska" ? XCircle : obavijest.tip === "info" ? Info : CheckCircle2;

          return (
            <div className={`toast toast-${obavijest.tip}`} key={obavijest.id}>
              <Ikona size={18} aria-hidden="true" />
              <span>{obavijest.tekst}</span>
              <button
                aria-label="Zatvori notifikaciju"
                className="toast-close"
                type="button"
                onClick={() => ukloniObavijest(obavijest.id)}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </KontekstObavijesti.Provider>
  );
}

export function useObavijesti() {
  const kontekst = useContext(KontekstObavijesti);

  if (!kontekst) {
    throw new Error("useObavijesti mora biti korišten unutar PruzalacObavijesti komponente.");
  }

  return kontekst;
}
