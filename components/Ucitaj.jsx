export default function Ucitaj({ tekst = "Učitavanje podataka..." }) {
  return (
    <div className="loading-wrap" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{tekst}</span>
    </div>
  );
}
