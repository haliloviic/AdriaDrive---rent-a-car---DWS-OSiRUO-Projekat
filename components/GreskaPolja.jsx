export default function GreskaPolja({ poruka }) {
  if (!poruka) return null;

  return <p className="field-error">{poruka}</p>;
}
