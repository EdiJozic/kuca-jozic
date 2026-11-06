# React + TypeScript + Vite

## Uređivanje sadržaja

Administracija je dostupna na `/admin/`. Sadržaj web-stranice pohranjuje se u
`public/data/places.json`, `public/data/info.json`, `public/data/services.json` i
`public/data/notices.json` (na stranici su dostupni kao `/data/*.json`);
fotografije prenesene kroz CMS spremaju se u `public/images/uploads/`. Izmjene se
spremaju kao GitHub commit na granu `main`, nakon čega Netlify objavljuje novu
verziju.

Za prijavu u CMS potrebno je jednom postaviti GitHub OAuth aplikaciju i Netlify
OAuth pružatelja. To **ne koristi Netlify Identity**:

1. U GitHubu otvorite **Settings → Developer settings → OAuth Apps** i kreirajte
   OAuth aplikaciju. Callback URL postavite na
   `https://api.netlify.com/auth/done`.
2. U Netlifyju otvorite **Project configuration → Security → OAuth**, dodajte
   pružatelja GitHub te unesite Client ID i Client Secret iz GitHuba.
3. Otvorite `/admin/` na objavljenoj Netlify stranici i prijavite se GitHub
   računom koji ima pravo pisanja u repozitorij.

Wi-Fi podaci uneseni u CMS objavljuju se u javnom JSON-u i dostupni su svakom
posjetitelju stranice. Unesite ih samo ako je to namjerno.

## NOVASOL availability

The availability calendar loads dates for property `CCC667` through the Netlify
Function at `/.netlify/functions/novasol-availability`. Responses are cached for
five minutes. The function uses NOVASOL's public but undocumented availability
endpoint, which NOVASOL may change. `npm run dev` proxies the endpoint during
local development; `netlify dev` can also be used to run the Netlify Function
locally.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
