# Visitor System

## Projekti kirjeldus

Visitor System on veebirakendus ettevõtte külastajate haldamiseks. Süsteem võimaldab registreerida külastajaid, hallata külastusi, määrata uksekaarte ning jälgida külastuste staatust.

Rakendus on loodud kasutades React frontend'i, Node.js + Express backend'i ning Prisma ORM-i andmebaasiga suhtlemiseks.

---

## Kasutatud tehnoloogiad

### Frontend

* React
* React Router
* JavaScript (ES6+)
* Fetch API

### Backend

* Node.js
* Express.js
* Prisma ORM
* JWT autentimine
* bcrypt

### Andmebaas

* PostgreSQL

### API testimine

* Postman Collection

---

## Kasutajarollid

### Registratuur

Registratuuri kasutaja saab:

* Vaadata külalisi
* Lisada uusi külalisi
* Vaadata külastusi
* Lisada uusi külastusi
* Lõpetada külastusi
* Vaadata uksekaarte
* Vaadata ülevaate lehte

Registratuuri kasutaja ei saa:

* Kustutada andmeid

### Administraator

Administraator saab:

* Hallata kõiki andmeid
* Lisada uusi kirjeid
* Kustutada kirjeid
* Hallata uksekaarte
* Vaadata süsteemi ülevaadet

---

## Funktsionaalsused

### Autentimine ja autoriseerimine

* Kasutaja registreerimine
* Kasutaja sisselogimine
* JWT tokenitel põhinev autentimine
* Privaatmarsruudid
* Rollipõhine autoriseerimine

### Külaliste haldus

* Külaliste lisamine
* Külaliste kuvamine
* Külaliste kustutamine (administraator)

### Külastuste haldus

* Külastuse registreerimine
* Külastuse lõpetamine
* Külastuste kuvamine
* Külastuse kustutamine (administraator)

### Uksekaartide haldus

* Uksekaartide kuvamine
* Uksekaartide määramine külalistele
* Vabade kaartide kuvamine

### Ülevaate leht

* Viimati lahkunud külalised
* Viimati kaardi saanud külalised
* Vabad uksekaardid

---

## API Endpoints

### Autentimine

| Meetod | Endpoint           |
| ------ | ------------------ |
| POST   | /api/auth/register |
| POST   | /api/auth/login    |

### Külalised

| Meetod | Endpoint        |
| ------ | --------------- |
| GET    | /api/guests     |
| POST   | /api/guests     |
| DELETE | /api/guests/:id |

### Külastused

| Meetod | Endpoint               |
| ------ | ---------------------- |
| GET    | /api/visits            |
| POST   | /api/visits            |
| PUT    | /api/visits/:id/finish |
| DELETE | /api/visits/:id        |

### Uksekaardid

| Meetod | Endpoint                    |
| ------ | --------------------------- |
| GET    | /api/cards                  |
| PUT    | /api/cards/:id/assign-guest |
| PUT    | /api/cards/:id/free         |

---

## Projekti käivitamine

### Backend

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm start
```

Backend töötab aadressil:

```text
http://localhost:5000
```

### Frontend

```bash
npm install
npm run dev
```

Frontend töötab aadressil:

```text
http://localhost:5173
```

---

## Testimine

Rakenduse API testimiseks on loodud Postman Collection.

Testitud funktsionaalsused:

* registreerimine
* sisselogimine
* JWT autentimine
* külaliste CRUD
* külastuste CRUD
* uksekaartide haldus

---

## Autor

Triin Piip ja Johanna Jõerand
