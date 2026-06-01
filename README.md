# AdriaDrive Rent a Car

AdriaDrive je React rent a car aplikacija sa javnom flotom vozila, registracijom, prijavom, Gost rezervacijama, Admin panelom i json-server bazom. Tema koristi crno-bijelu paletu, naglašen glass morphism, sans-serif tipografiju i diskretne CSS animacije.

## Članovi tima: 


| Ahmed Halilović
| Bakir Efendić
| Mustafa Drapić

## Tech stack

- React 18.x
- React Router v6
- Vite 6.x
- Node.js 24.x u ovom okruženju; projekt je kompatibilan sa Node 18+
- json-server 0.17.x
- CSS varijable i custom responsive CSS
- lucide-react ikone

## Arhitektura

```text
Browser
  |
  | React Router v6
  v
React aplikacija
  |-- KontekstAutentikacije + localStorage sesija
  |-- ZasticenaRuta za Admin i Gost rute
  |-- useDohvat / useObrazac custom hookovi
  |
  | REST zahtjevi
  v
json-server :4000
  |-- korisnici
  |-- vozila
  |-- rezervacije
  |-- poruke
  v
data/db.json
```

## Paleta i fontovi

- Crna: `#050505`, `#0d0d0f`, `#18181b`
- Bijela/siva: `#ffffff`, `#f4f4f5`, `#d4d4d8`
- Glass površine: `rgba(255, 255, 255, 0.72)` uz blur
- Heading font: Space Grotesk
- Body font: Inter

## Korisničke uloge

- Admin: pristup rutama `/admin` i `/veh-info`, pregled vozila, dodavanje, uređivanje i brisanje vozila, potvrda rezervacija, pregled rentanih vozila, lokacija, predjene kilometraze, softversko gasenje i zakljucavanje vozila, pregled poruka i slanje odgovora korisnicima. Admin nema opciju rezervisanja vozila.
- Gost: pristup zaštićenoj ruti `/rezervacije`, slanje rezervacija, pregled flote i detalja vozila, slanje upita i primanje admin odgovora pri sljedećoj prijavi.
- Neprijavljen korisnik: javne stranice, flota, detalji vozila, kontakt, prijava i registracija. Zaštićene akcije vode na prijavu.

Popust: ako Gost rentanje odabere na više od 5 dana, sistem automatski obračunava 20 KM popusta i sprema taj popust u rezervaciju.

Demo nalozi:

- Admin: `admin@adriadrive.ba` / `admin123`
- Gost: `gost@adriadrive.ba` / `gost123`

## Obavezne stranice

- Landing page: `/`
- O nama: `/o-nama`
- Prijava: `/prijava`
- Registracija: `/registracija`
- Kontakt + Google Maps iframe: `/kontakt`
- Dodatna stranica 1, flota vozila: `/vozila`
- Dodatna stranica 2, rezervacije: `/rezervacije`
- Admin dashboard: `/admin`
- Admin Veh Info: `/veh-info`
- 404 stranica za nepostojeće rute i nepostojeći model vozila

## Lokalno pokretanje

1. Instalirati Node.js 18 ili noviji.
2. Instalirati dependencies:

```bash
npm install
```

3. U prvom terminalu pokrenuti bazu:

```bash
npm run server
```

4. U drugom terminalu pokrenuti React aplikaciju:

```bash
npm run dev
```

5. Otvoriti aplikaciju:

```text
http://127.0.0.1:5173
```

Alternativa za oba servisa odjednom:

```bash
npm run dev:all
```

## Production build

```bash
npm run build
npm run preview
```

## Produkcijski URL

GCP Cloud Run URL: dodati nakon deploymenta, npr. `https://adriadrive-rent-xxxxx.a.run.app`

## Snimci ekrana

Snimci se nalaze u folderu `outputs/screenshots`:

- Landing: `outputs/screenshots/landing.png`
- Prijava: `outputs/screenshots/prijava.png`
- Admin panel: `outputs/screenshots/admin.png`
- Mobilni prikaz: `outputs/screenshots/mobilni-prikaz.png`
- 404 model: `outputs/screenshots/model-404.png`
- GCP Cloud Run konzola: dodati nakon deploymenta na GCP Cloud Run


