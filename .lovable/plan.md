## Corrections ciblées — commit 732960c

Modifications limitées à 4–5 fichiers frontend. Aucune nouvelle page, aucun backend, aucun panier, aucune authentification.

### 1. Lint — `src/components/product/ProductCard.tsx`

Supprimer les deux lignes vides superflues introduites lignes 194–195 (juste après `<article ...>`). C'est l'unique warning Prettier restant.

### 2. Effet de bord pendant le rendu — `src/components/product/PromotionCountdown.tsx`

Retirer entièrement `queueMicrotask(onExpire)` exécuté pendant le rendu. Le remplacer par un `useEffect` piloté par l'état d'expiration :

- Un `useEffect([endsAt])` réinitialise `firedRef.current = false`.
- Un `useEffect([remaining.expired, onExpire])` déclenche `onExpire` une fois, uniquement quand `remaining.expired` devient vrai.
- Le rendu retourne simplement `null` quand `remaining.expired`, sans autre effet.

### 3. Heure SSR cohérente — sans singleton global mutable

**Contrainte SSR (multi-requêtes) :** aucun `currentTs`, `listeners` ou `intervalId` ne doit vivre au niveau du module. Chaque requête SSR doit avoir son propre `NowStore` isolé, sinon l'heure d'une requête pourrait fuiter dans une autre.

**Architecture :**

- `src/routes/__root.tsx`
  - Ajouter `loader: () => ({ initialNow: Date.now() })`. TanStack sérialise la valeur : SSR et hydratation partagent exactement le même timestamp.
  - Dans `RootComponent`, lire `Route.useLoaderData().initialNow` et envelopper `<Outlet />` dans `<NowProvider initialNow={initialNow}>`.

- `src/lib/now-store.ts` — refonte complète, sans état module-level :
  - `createNowStore(initialNow: number)` retourne une instance fermée contenant ses propres `currentTs`, `listeners: Set<Listener>`, `intervalId`, plus les méthodes `subscribe`, `getSnapshot`, `getServerSnapshot`. `getServerSnapshot` renvoie l'`initialNow` capturé par la closure. `getSnapshot` renvoie `currentTs` (seedé à `initialNow`).
  - `NowContext = createContext<NowStore | null>(null)`.
  - `NowProvider({ initialNow, children })` :
    - `const storeRef = useRef<NowStore | null>(null); if (!storeRef.current) storeRef.current = createNowStore(initialNow);` — garantit une instance stable par arbre React, jamais partagée entre requêtes.
    - `useEffect` monte le `setInterval(() => { store.currentTs = Date.now(); store.listeners.forEach(l => l()); }, 1000)` **uniquement côté client**, et le nettoie au démontage (`clearInterval`, `store.intervalId = null`).
    - Fournit `storeRef.current` via `NowContext.Provider`.
  - `useNow()` lit le store depuis le contexte et appelle `useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)`. Jette une erreur explicite si utilisé hors `NowProvider`.

- `src/components/product/ProductPrice.tsx` et `src/components/product/ProductCard.tsx`
  - Suppression de la branche « `nowTs === 0` → faire confiance au fixture ». `useNow()` renvoie désormais toujours une valeur valide (SSR + client), donc `isPromotionActive(promo, new Date(nowTs))` (qui vérifie `startsAt`, `endsAt`, et `salePrice < regularPrice`) est utilisé uniformément.

- `src/components/product/PromotionCountdown.tsx`
  - Suppression de la branche `nowTs === 0` et du placeholder « Offre à durée limitée ». Le compte à rebours réel s'affiche immédiatement au SSR à partir de `initialNow`.

Résultat : une promo expirée n'apparaît ni dans le HTML SSR ni côté client, un seul `Date.now()` par requête, aucune fuite d'état entre deux requêtes SSR concurrentes, ticker démarré uniquement dans un `useEffect` et nettoyé au démontage.

### 4. Tests obligatoires (Playwright + curl, `/tmp/browser/lmm/`)

- **Cas A — promo active (SSR)** : `curl http://localhost:8080/`. Vérifier dans le HTML brut la présence, pour Calvin Klein, de `450 DT`, `line-through`, `>Promo<`, et `Offre valable encore`.
- **Cas B — promo expirée (SSR)** : passer temporairement `PROMO_END` à une date passée via `sed`, forcer un redémarrage du dev server (le cache HMR de Vite peut retarder la mise à jour du module fixture, cf. run précédent), `curl`, puis vérifier l'absence de `line-through`, `>Promo<`, `%`, `Offre valable encore` et la présence du prix normal `610 DT`. Restauration systématique du fixture en fin de script.
- **Cas C — expiration après hydratation** : `page.clock.install(BEFORE)` + `page.clock.resume()` → snapshot promo active → `page.clock.setFixedTime(AFTER)` → snapshot promo disparue, prix normal restauré. Vérifier via un écouteur console qu'aucun warning React n'est émis. Compter `onExpire` en injectant un wrapper `onExpire` de test dans une route de test isolée **ou** en interceptant les rendus du composant existant via un `data-*` attribute — attendu = 1.

### 5. Validation finale

Exécution réelle et rapport intégral :

- `npm run lint` (attendu : 0 erreur, 6 warnings Fast Refresh préexistants).
- `npm run build` après le lint.
- Résultats exacts des trois cas de test.
- Méthode SSR : `__root` loader → `initialNow` → `NowProvider` → `createNowStore` (instance par arbre React) → `useNow`.
- Nombre d'appels `onExpire`.
- Confirmation « aucun `queueMicrotask` pendant le rendu ».
- Confirmation « aucun état temporel mutable au niveau module (`currentTs`/`listeners`/`intervalId`) ».
- Fichiers modifiés (attendu : `ProductCard.tsx`, `PromotionCountdown.tsx`, `ProductPrice.tsx`, `now-store.ts`, `__root.tsx`).
- Confirmation « aucune nouvelle page, aucun backend, aucun panier, aucune authentification ».
