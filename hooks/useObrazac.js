import { useState } from "react";

export function useObrazac(pocetneVrijednosti, validiraj) {
  const [vrijednosti, postaviVrijednosti] = useState(pocetneVrijednosti);
  const [greske, postaviGreske] = useState({});
  const [dodirnuto, postaviDodirnuto] = useState({});

  const pokreniValidaciju = (sljedeceVrijednosti = vrijednosti) => {
    const sljedeceGreske = validiraj ? validiraj(sljedeceVrijednosti) : {};
    postaviGreske(sljedeceGreske);
    return sljedeceGreske;
  };

  const promjenaPolja = (dogadjaj) => {
    const { name, value, type, checked } = dogadjaj.target;
    const sljedeceVrijednosti = {
      ...vrijednosti,
      [name]: type === "checkbox" ? checked : value,
    };

    postaviVrijednosti(sljedeceVrijednosti);

    if (dodirnuto[name]) {
      pokreniValidaciju(sljedeceVrijednosti);
    }
  };

  const napustanjePolja = (dogadjaj) => {
    const { name } = dogadjaj.target;
    postaviDodirnuto((trenutno) => ({ ...trenutno, [name]: true }));
    pokreniValidaciju(vrijednosti);
  };

  const validirajSve = () => {
    const sljedeceGreske = pokreniValidaciju(vrijednosti);
    postaviDodirnuto(
      Object.keys(vrijednosti).reduce(
        (rezultat, kljuc) => ({
          ...rezultat,
          [kljuc]: true,
        }),
        {},
      ),
    );
    return Object.keys(sljedeceGreske).length === 0;
  };

  const resetuj = (sljedeceVrijednosti = pocetneVrijednosti) => {
    postaviVrijednosti(sljedeceVrijednosti);
    postaviGreske({});
    postaviDodirnuto({});
  };

  return {
    vrijednosti,
    postaviVrijednosti,
    greske,
    postaviGreske,
    dodirnuto,
    promjenaPolja,
    napustanjePolja,
    validirajSve,
    resetuj,
  };
}
