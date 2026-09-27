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

- **~3 900 cartes** (joueurs + versions) de IE1 à GO Galaxy, chargées depuis **Supabase**
- Note globale **OVR** style FIFA (44–94), 6 stats, catégories Legendary / Top / Advanced / Growing / Common
- Supertechniques réelles de chaque jeu, portraits zukan
- Section **Joueurs** (`#/jugadores`) : recherche avec filtres, navigation jeu → équipes → effectif
- **FR / EN / ES** · thème clair / sombre

### Base de données

Générée par des scripts (sources : zukan, wiki Fandom, Strikers 2013 / Xtreme) — voir `docs/plan-base-jugadores.md` :

```bash
python3 tools/db/fetch.py   # téléchargement (cache tools/.cache/db/)
python3 tools/db/build.py   # cartes → supabase/seed.sql + build/review.csv
```

Un push sur `main` qui modifie `supabase/` recharge la base (workflow `db-load.yml`, secret `SUPABASE_DB_URL`).

---

## Stack

React 19 · TypeScript · Vite 6 · Tailwind CSS 3 · Supabase · Vercel Analytics · PostHog (optionnel, `VITE_PUBLIC_POSTHOG_KEY`)

---

## Auteur

**Thomas Lekieffre**

- [GitHub](https://github.com/thomaslekieffre)
- [X / Twitter](https://x.com/thomasdev59)
- [Soutenir le projet](https://paypal.me/tlekieffredev)

---

## Licence & disclaimer

Projet fan gratuit. *Inazuma Eleven* © Level-5. Aucune affiliation, endorsement ou revendication de propriété intellectuelle.
