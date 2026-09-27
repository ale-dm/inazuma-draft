# Inazuma Draft — FFI 6-0

> Draft ton **Inazuma Japan**. Remporte le **FFI**.

Fan game inspiré de *Inazuma Eleven* — draft 11 joueurs, compose ton équipe, simule le tournoi FFI (Liocott Island).

**Fan project — non affilié Level-5.**

---

## Jouer

```bash
npm install
npm run dev
```

→ [http://localhost:5173](http://localhost:5173)

Build prod : `npm run build` · preview : `npm run preview`

Déploiement live : [ffi-6-0.vercel.app](https://ffi-6-0.vercel.app)

---

## Modes

| Mode | Description |
|------|-------------|
| **Classic** | Stats Victory Road + note 42–99 visibles |
| **Mémoire** | Pas de stats — draft de mémoire pure |

---

## Règles

### Draft (11 rounds)
- Chaque round : **roll une équipe + un jeu** (ex. Raimon IE1, Little Gigantes IE3) → pick **un joueur** de ce roster uniquement
- **3 relances au total** sur tout le draft (pas par round)
- Postes stricts (GK / DF / MF / FW), placement auto sur le terrain

### Notes & stats (Classic)
- 3 stats par poste (noms **Victory Road**), note pondérée **42–99**
- GK : Pression, Arrêt, Physique · DF : Pression, Physique, Agilité · MF : Contrôle, Agilité, Intelligence · FW : Frappe, Agilité, Contrôle
- Power équipe = somme des 11 notes

### Lineup
- Compose tes 11 joueurs
- Formations : **4-3-3** · **4-4-2** · **3-5-2** · **4-2-3-1**
- Chaque joueur sur un slot compatible avec son poste

### Tournoi FFI
- Tableau **tiré au sort** parmi tous les pools draft (tous jeux)
- **Poule A** : 4 matchs vs équipes aléatoires · top 2 qualifié
- **Poule B** : 5 équipes IA (sim en arrière-plan)
- Bracket classique : 1er A vs 2e B · 2e A vs 1er B → finale
- **Égalité en KO** (demis + finale) → tirs au but (TAB)
- Sim : power rating + éléments + RNG

---

## Contenu

- **~2525 joueurs** · **~101 pools jouables** (IE1 → GO3)
- Données : [zukan.inazuma.jp](https://zukan.inazuma.jp) (Lv50) + stats IE3 Fandom lv99 conservées
- Rosters canon : `src/data/canonical-rosters.ts`
- Dédup automatique des doublons zukan (même perso listé plusieurs fois dans un pool)
- Portraits joueurs (zukan + fallbacks)
- **FR / EN / ES** · thème clair / sombre

### Scripts data (dossier `scripts/`, gitignored)

| Commande | Rôle |
|----------|------|
| `npm run data:zukan` | Regénère joueurs / pools / images depuis zukan |
| `npm run data:rebuild` | Rebuild DB legacy IE3 |
| `npm run data:audit` | Audit rosters vs canon |

---

## Stack

React 19 · TypeScript · Vite 6 · Tailwind CSS 3 · Vercel Analytics · PostHog (optionnel, `VITE_PUBLIC_POSTHOG_KEY`)

---

## Auteur

**Thomas Lekieffre**

- [GitHub](https://github.com/thomaslekieffre)
- [X / Twitter](https://x.com/thomasdev59)
- [Soutenir le projet](https://paypal.me/tlekieffredev)

---

## Licence & disclaimer

Projet fan gratuit. *Inazuma Eleven* © Level-5. Aucune affiliation, endorsement ou revendication de propriété intellectuelle.
