# Preventiva — Proposta (React + Vite)

Versione React + Vite della proposta. Contenuto, testi, stili e comportamento
sono identici ai file `.dc.html` originali (conservati nella cartella come
riferimento).

## Comandi

```bash
npm install      # una volta
npm run dev      # sviluppo su http://localhost:5173
npm run build    # build di produzione in dist/
npm run preview  # anteprima della build
```

## Struttura

| File | Corrisponde a |
| --- | --- |
| `src/pages/Proposta.jsx` | `Proposta.dc.html` (rotta `/`) |
| `src/pages/Mockup.jsx` | `Mockup.dc.html` (rotta `/mockup`) |
| `src/lib/Hover.jsx` | l'attributo `style-hover` del runtime `.dc` |
| `src/index.css` | il blocco `<style>` dell'`<helmet>` |
| `public/assets/` | le immagini (`assets/` originale) |

I link tra le due pagine usano `react-router-dom` con URL puliti (`/` e
`/mockup`). Su hosting statico serve un rewrite verso `index.html`: sono già
inclusi `public/_redirects` (Netlify) e `vercel.json` (Vercel).

### Props del cliente

`Proposta` accetta `companyName`, `problemLine`, `companyLogo` (come i vecchi
`data-props`). Senza props usa i valori segnaposto di default.

## File originali

`Proposta.dc.html`, `Mockup.dc.html` e `support.js` non vengono più usati
dall'app ma restano come backup.
