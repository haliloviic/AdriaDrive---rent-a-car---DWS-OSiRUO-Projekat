import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { PruzalacAutentikacije } from "./context/KontekstAutentikacije.jsx";
import { PruzalacObavijesti } from "./context/KontekstObavijesti.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <PruzalacAutentikacije>
        <PruzalacObavijesti>
          <App />
        </PruzalacObavijesti>
      </PruzalacAutentikacije>
    </BrowserRouter>
  </React.StrictMode>,
);
