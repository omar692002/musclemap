# MuscleMap — Guide complet & dossier de soutenance (FR)

> **Pour qui ?** Un membre du jury de PFA, un développeur qui rejoint le projet, et **toi**, le
> propriétaire du projet, qui n'a pas codé depuis longtemps et veut **comprendre chaque choix**
> sans relire le code.
>
> **Comment lire ce document ?** Il est écrit pour quelqu'un qui a oublié le jargon. Chaque fois
> qu'un terme technique apparaît, il y a un encadré :
>
> > 💡 **En clair :** l'explication en français simple, avec une analogie.
>
> **État du projet :** Sprint d'évolution PFA terminé (EM1–EM12) + migration du catalogue (EM13).
> Frontend **en ligne** sur GitHub Pages ; backend + base **déployés** sur Render (voir
> [Partie 10](#partie-10--déploiement)).
>
> **Démo (frontend) :** https://omar692002.github.io/musclemap/
> **API (backend) :** https://musclemap-q65o.onrender.com/api/v1/meta

---

## Sommaire

- [Résumé en une page](#résumé-en-une-page)
- [Le problème résolu & la motivation](#le-problème-résolu--la-motivation)
- [Partie 1 — L'architecture expliquée simplement](#partie-1--larchitecture-expliquée-simplement)
  - [1.1 Les trois briques](#11-les-trois-briques)
  - [1.2 Le schéma « Clean Architecture » du frontend](#12-le-schéma--clean-architecture--du-frontend)
  - [1.3 Le « dual-path » et le « chemin hors-ligne »](#13-le--dual-path--et-le--chemin-hors-ligne-)
  - [1.4 « Bundled JSON », « catalogue », « taxonomie » : le vocabulaire](#14--bundled-json---catalogue---taxonomie--le-vocabulaire)
- [Partie 2 — D'où viennent les données ?](#partie-2--doù-viennent-les-données-)
- [Partie 3 — Fichier par fichier (frontend)](#partie-3--fichier-par-fichier-frontend)
- [Partie 4 — Classe par classe (backend)](#partie-4--classe-par-classe-backend)
- [Partie 5 — L'i18n (les langues) expliquée](#partie-5--li18n-les-langues-expliquée)
- [Partie 6 — L'authentification de A à Z](#partie-6--lauthentification-de-a-à-z)
- [Partie 7 — Les variables d'environnement](#partie-7--les-variables-denvironnement)
- [Partie 8 — La base de données](#partie-8--la-base-de-données)
- [Partie 9 — L'API avec exemples Postman](#partie-9--lapi-avec-exemples-postman)
- [Partie 10 — Déploiement](#partie-10--déploiement)
  - [10.1 État réel aujourd'hui](#101-état-réel-aujourdhui)
  - [10.2 C'est quoi un « Blueprint » Render ?](#102-cest-quoi-un--blueprint--render-)
  - [10.3 Déployer le backend + la base sur Render](#103-déployer-le-backend--la-base-sur-render)
  - [10.4 Déployer frontend + backend sur une VM Azure](#104-déployer-frontend--backend-sur-une-vm-azure)
  - [10.5 Spécifications de la VM & checklist des livrables](#105-spécifications-de-la-vm--checklist-des-livrables)
- [Annexe — Questions probables du jury](#annexe--questions-probables-du-jury)

---

## Résumé en une page

**MuscleMap** est une application de fitness « mobile-first ». Sa particularité, son **avantage
unique**, c'est la **visualisation des muscles** : pour chaque exercice, elle montre *exactement*
quels muscles (jusqu'à la portion individuelle d'un muscle, sur un modèle 3D que l'on fait tourner)
sont sollicités comme **primaire**, **secondaire** ou **stabilisateur**.

Autour de ça : un catalogue de 873 exercices (chacun avec une vidéo), une carte 3D du corps, un
générateur de programmes, un suivi des séances, des graphiques de progression, une « intelligence
musculaire » (volume/récupération), une plateforme de contenu pour coachs, un espace admin, et un
système d'abonnement FREE/PREMIUM.

| Dimension | Choix | Justification en une ligne |
|---|---|---|
| **Frontend** (l'app) | React 19 + TypeScript + Vite + Tailwind v4, **PWA** | Un seul code → site web + app installable → app mobile plus tard |
| **Backend** (le serveur) | Spring Boot 3.3 (Java 17), architecture en couches | Standard de l'industrie ; le « vrai backend » exigé académiquement |
| **Base de données** | PostgreSQL 16, schéma géré par **Flyway** | Schéma versionné et reproductible, zéro surprise |
| **Authentification** | **JWT** (HS256) + **BCrypt** + **Google** | Pas de session serveur (= ça scale) ; on garde le login Google du propriétaire |
| **Hébergement frontend** | GitHub Pages (fichiers statiques) | Gratuit, déploiement à chaque `push`, aucun serveur nécessaire |
| **Hébergement backend** | Render (Docker), portable vers Azure | Gratuit maintenant ; la même image tourne sur Azure plus tard |

> 💡 **PWA = Progressive Web App.** C'est un site web qui peut s'**installer** comme une vraie
> application (icône sur le téléphone, plein écran) et qui **fonctionne hors-ligne**. Techniquement
> c'est juste des fichiers (HTML/CSS/JS), donc c'est gratuit à héberger.

**L'idée d'architecture la plus importante à retenir :** l'interface (l'UI) ne parle **jamais**
directement à une source de données. Elle parle à des **interfaces** (des contrats). C'est ce qui
permet à la *même* application de fonctionner soit hors-ligne (données embarquées), soit branchée
sur le vrai serveur, **sans changer une seule ligne d'UI**. C'est le principe du « dual-path »
expliqué en [1.3](#13-le--dual-path--et-le--chemin-hors-ligne-).

---

## Le problème résolu & la motivation

### Le problème
La plupart des gens qui s'entraînent **ne savent pas vraiment quels muscles travaille un
exercice**, ni *combien* chaque muscle est sollicité. Résultat : déséquilibres (on muscle le
visible — pectoraux, biceps — et on néglige le reste), programmes redondants, et aucun retour
chiffré sur le volume par muscle. MuscleMap rend l'effort musculaire **visible**, **génère des
programmes équilibrés**, et **suit le volume hebdomadaire par groupe musculaire**.

### La motivation commerciale (probablement discutée en soutenance)
Le **frère du propriétaire est un coach sportif professionnel** avec une communauté fidèle. Ce
n'est pas un utilisateur hypothétique : c'est un **canal de distribution** réel. Le coach peut :
- **mettre en ligne ses propres vidéos de démonstration** (donc **aucun risque de copyright**, et
  un contenu que les concurrents ne peuvent pas copier) ;
- **publier** des démos techniques, des cours, des programmes complets ;
- marquer du contenu **premium** : le serveur **bloque** l'accès aux non-abonnés (vraie réponse
  `402 Payment Required`). C'est ce qui transforme son audience en **abonnés payants**.

Thèse commerciale : **coach de confiance + audience captive + contenu original + vraie barrière
d'abonnement = plateforme monétisable dès le jour 1**.

---

## Partie 1 — L'architecture expliquée simplement

### 1.1 Les trois briques

L'application a **trois briques** qui se parlent :

```
┌─────────────────────────┐      HTTPS / JSON       ┌──────────────────────────┐
│  1. FRONTEND (l'app)     │  ───────────────────▶   │  2. BACKEND (le serveur) │
│  React, dans le          │   « donne-moi mes       │  Spring Boot (Java)      │
│  navigateur du téléphone │     séances »           │                          │
│                          │   ◀───────────────────  │                          │
└─────────────────────────┘   « voici tes séances »  └────────────┬─────────────┘
                                                                   │ JDBC (SQL)
                                                                   ▼
                                                       ┌──────────────────────────┐
                                                       │  3. BASE DE DONNÉES       │
                                                       │  PostgreSQL               │
                                                       └──────────────────────────┘
```

| Brique | Techno | Rôle |
|---|---|---|
| **Frontend** | React (PWA) | Toute l'interface, le modèle 3D, l'algorithme de génération de programme, le cache hors-ligne. Parle au backend en HTTPS/JSON. |
| **Backend** | Spring Boot 3 | Identité & rôles, sauvegarde des données utilisateur (profils, séances, poids, abonnements), contenu coach + blocage premium, admin, catalogue en lecture seule. **Sans état** (stateless). |
| **Base** | PostgreSQL 16 | Stockage durable. Schéma versionné par **Flyway**. |

> 💡 **« Sans état » / stateless.** Le serveur ne se souvient de rien entre deux requêtes (pas de
> « session » en mémoire). Chaque requête arrive avec son **jeton** (JWT) qui prouve qui tu es.
> Avantage : on peut lancer 10 copies du serveur, n'importe laquelle peut répondre → ça « scale ».

### 1.2 Le schéma « Clean Architecture » du frontend

Tu as demandé un schéma qui montre **quel module dépend de quel module**. Le frontend suit la
**Clean Architecture** : un cœur pur au centre (`domain`), des sources de données concrètes
(`data`), et une UI (`features` + `components`) tout autour. **La règle d'or : les flèches de
dépendance pointent vers le centre.** L'UI dépend du `domain`, jamais l'inverse.

```mermaid
flowchart TD
    subgraph OUTER["UI (couche externe)"]
        FEAT["features/<br/>(une dossier par écran :<br/>workouts, exercises, map, program...)"]
        COMP["components/<br/>(boutons, barres, cartes partagés)"]
        APP["App.tsx + main.tsx<br/>(coquille + point de montage)"]
    end

    subgraph MID["Injection & configuration"]
        CTX["context/<br/>RepositoryContext<br/>(injecte les repos dans l'UI)"]
        CFG["config/<br/>(routes, i18n, réglages,<br/>auth.config, dataSource.config)"]
    end

    subgraph DATA["data/ (implémentations concrètes)"]
        FACT["repositoryFactory.ts<br/>(LE point de décision<br/>statique vs API)"]
        STATIC["static/<br/>StaticExerciseRepository<br/>(lit le JSON embarqué)"]
        API["api/<br/>ApiExerciseRepository<br/>(appelle le backend)"]
    end

    subgraph CORE["domain/ (cœur pur, zéro React, zéro fetch)"]
        IREPO["repositories/<br/>IExerciseRepository<br/>IMuscleRepository<br/>(les CONTRATS)"]
        MODELS["models/ (Exercise, Muscle...)<br/>enums/ (MuscleGroup...)"]
    end

    FEAT --> COMP
    FEAT --> CTX
    APP --> CTX
    FEAT -.dépend du contrat.-> IREPO
    CTX --> FACT
    FACT -->|si VITE_API_BASE_URL défini| API
    FACT -->|sinon| STATIC
    API -. se replie sur .-> STATIC
    STATIC -.implémente.-> IREPO
    API -.implémente.-> IREPO
    IREPO --> MODELS
    FEAT --> CFG
    DATA --> CFG
```

**Comment lire ce schéma (pour la soutenance) :**

1. Un écran dans `features/` **ne sait pas** d'où viennent les exercices. Il connaît seulement le
   **contrat** `IExerciseRepository` (« je peux te donner `getAll()`, `getById()`,
   `findByMuscleGroup()` »).
2. `RepositoryContext` (dans `context/`) **injecte** une implémentation concrète dans l'UI. C'est
   ce qu'on appelle l'**injection de dépendances**.
3. `repositoryFactory.ts` est **le seul endroit** qui décide quelle implémentation utiliser :
   - si la variable `VITE_API_BASE_URL` est définie → `ApiExerciseRepository` (parle au backend) ;
   - sinon → `StaticExerciseRepository` (lit le JSON embarqué).
4. Même branché sur l'API, si le réseau échoue, `ApiExerciseRepository` **se replie** automatiquement
   sur le statique. L'app ne tombe jamais en panne.

> 💡 **« Repository » (dépôt).** En Clean Architecture, un *repository* est un objet dont le seul
> métier est d'**aller chercher / sauvegarder des données**. On parle à son **interface** (le
> contrat, préfixé `I` comme `IExerciseRepository`), pas à sa version concrète. Analogie : une prise
> électrique murale. Tu branches n'importe quel appareil (concret) sur la même prise (le contrat) ;
> l'appareil ne sait pas si l'électricité vient d'un barrage ou d'un panneau solaire.
>
> 💡 **« RepositoryContext ».** « Context » est un mécanisme **React** pour partager une valeur dans
> tout l'arbre des composants sans la passer de main en main. Ici il transporte les repositories
> jusqu'à chaque écran. C'est le « câblage » de l'injection de dépendances côté React.
>
> 💡 **« repositoryFactory » (fabrique de repositories).** Une *factory* est un objet qui
> **fabrique** d'autres objets. Celui-ci choisit, **une seule fois au démarrage**, la bonne
> implémentation (statique ou API) et l'expose au reste de l'app. C'est ce qu'on appelle la
> **« composition root »** : l'unique endroit où l'on assemble les pièces concrètes. Pourquoi le
> centraliser ? Pour que le choix « hors-ligne vs en-ligne » se change à **un seul endroit**.

### 1.3 Le « dual-path » et le « chemin hors-ligne »

C'est le point que tu n'avais pas compris. Voilà clairement.

**« Dual-path » = double chemin.** Chaque fonctionnalité qui a besoin de données peut fonctionner
de **deux manières**, et c'est décidé par **une seule variable** `VITE_API_BASE_URL` :

| Chemin | Quand ? | Les exercices viennent de… | Tes séances/poids viennent de… |
|---|---|---|---|
| **Chemin EN-LIGNE** | `VITE_API_BASE_URL` est défini | l'**API** (PostgreSQL) | l'**API** (PostgreSQL) |
| **Chemin HORS-LIGNE** | `VITE_API_BASE_URL` est vide | le **JSON embarqué** dans l'app | le **localStorage** du navigateur |

> 💡 **« Chemin hors-ligne ».** C'est simplement le mode où l'app **n'a pas de serveur**. Sur la
> démo GitHub Pages, il n'y a **aucun backend allumé**. Donc :
> - les 873 exercices sont lus depuis un fichier JSON **livré à l'intérieur de l'app** (voir
>   « bundled JSON » ci-dessous) ;
> - tes données personnelles (séances, poids) sont sauvegardées dans le **localStorage** (la petite
>   mémoire du navigateur, propre à ton appareil).
>
> Résultat : la démo marche **toute seule**, sans serveur, gratuitement, même dans l'avion.

**Pourquoi c'est malin ?** Parce que le jour où on allume le backend, on n'a **rien à réécrire** :
on définit `VITE_API_BASE_URL`, et toute l'app bascule du chemin hors-ligne au chemin en-ligne.
L'UI ne voit pas la différence (elle parle toujours au même contrat `IExerciseRepository`).

> 💡 **localStorage.** Un petit coffre de stockage (~5 Mo) intégré à chaque navigateur. Les données
> y restent même si tu fermes l'onglet, mais elles sont **locales à cet appareil** (elles ne se
> synchronisent pas entre ton téléphone et ton PC). C'est parfait pour un mode hors-ligne ou invité.

### 1.4 « Bundled JSON », « catalogue », « taxonomie » : le vocabulaire

- 💡 **« Bundled JSON » = JSON embarqué.** « To bundle » = empaqueter. Quand Vite construit l'app,
  il **empaquette** le fichier `exercises.json` (873 exercices) **dans** le code JavaScript livré au
  navigateur. Donc le fichier voyage *avec* l'app — pas besoin d'aller le chercher sur un serveur.
  C'est ça, un fichier « bundled ».
- 💡 **« Catalogue ».** L'ensemble des données de référence **en lecture seule** : les 873
  exercices + les muscles + qui travaille quoi. Par opposition aux **données utilisateur** (tes
  séances, ton poids) qui, elles, sont en lecture/écriture.
- 💡 **« Taxonomie ».** Une **classification**. Ici, notre liste organisée de muscles (14 groupes,
  chaque groupe ayant des muscles, chaque muscle pouvant avoir des « têtes »/portions, ex. les 3
  portions du deltoïde). C'est *notre* vocabulaire propre, indépendant de la source externe.
- 💡 **« Normaliser ».** Transformer des données « brutes » et désordonnées (venues d'une source
  externe) vers **notre** format propre. Exemple : la source écrit `"body only"` pour le poids du
  corps ; on le normalise en `Equipment.BODYWEIGHT`. Le code qui fait ça s'appelle le
  **`ExerciseNormalizer`** (il existe en double : une version frontend et une version backend, gardées
  identiques par un test).

---

## Partie 2 — D'où viennent les données ?

Tu as demandé : qu'est-ce qu'on a téléchargé ? Qu'est-ce qui est lu depuis internet ? D'où viennent
les vidéos ? Voici la réponse complète et honnête, source par source.

### 2.1 Les 873 exercices — *téléchargés une fois, embarqués*
- **Source :** le projet open-source **`yuhonas/free-exercise-db`** sur GitHub (base de données
  d'exercices libre, domaine public).
- **Ce qu'on a fait :** on a **téléchargé** son fichier JSON et on l'a **commité dans notre dépôt**.
  Côté frontend il est dans `frontend/src/data/static/source/` ; côté backend, la copie est dans
  `backend/src/main/resources/catalog/exercises.json`. Donc il ne dépend de personne à l'exécution.
- **Format brut d'un exercice :**
  ```json
  { "name": "3/4 Sit-Up", "force": "pull", "level": "beginner",
    "primaryMuscles": ["abdominals"], "secondaryMuscles": [],
    "images": ["3_4_Sit-Up/0.jpg", "3_4_Sit-Up/1.jpg"], "id": "3_4_Sit-Up" }
  ```

### 2.2 Les images des exercices — *lues depuis internet (CDN)*
- Les **images** (les 2 photos animées début→fin) ne sont **pas** embarquées (trop volumineuses).
- Elles sont **chargées à la volée depuis internet**, via le CDN **jsDelivr** qui sert le dépôt
  `yuhonas/free-exercise-db`. L'URL de base est dans `frontend/src/config/dataSource.config.ts` :
  `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/`.
- 💡 **CDN = Content Delivery Network.** Un réseau de serveurs qui distribue des fichiers
  rapidement partout dans le monde. jsDelivr peut servir n'importe quel fichier d'un dépôt GitHub
  public, gratuitement. On en profite pour ne pas héberger les images nous-mêmes.

### 2.3 Les vidéos — *des identifiants YouTube, curés par nos scripts*
- Pour chaque exercice on affiche une **vidéo guide YouTube**. On ne stocke **pas la vidéo**, juste
  son **identifiant YouTube** (11 caractères). Le fichier `catalog/exercise-videos.json` est une
  simple table `id d'exercice → id YouTube` :
  ```json
  { "Dumbbell_Bench_Press": "tdYLpdsY3Lw",
    "Barbell_Bench_Press_-_Medium_Grip": "PTzUJkPrrDw" }
  ```
- **Comment on a obtenu ces ~799 correspondances ?** Avec les **scripts** du dossier `scripts/`
  (lancés à la main une fois, pas en production). Ils ont **interrogé YouTube** pour chaque
  exercice, proposé des correspondances, vérifié que la vidéo est *intégrable* (embeddable), puis on
  a validé/corrigé manuellement (`match-videos.mjs`, `search-videos.mjs`, `check-embeddable.mjs`…).
- À l'affichage, le frontend construit l'URL d'intégration YouTube à partir de l'id. Donc **la
  vidéo elle-même est lue depuis internet** (YouTube), mais le **lien** est figé dans nos données.

### 2.4 Le modèle 3D du corps — *téléchargé, embarqué dans `public/`*
- Le fichier `public/models/muscles.glb` est le modèle **anatomique 3D segmenté** (chaque muscle est
  un maillage séparé). Source : **BodyParts3D / Z-Anatomy** (licence CC BY-SA).
- Il est **compressé** (meshopt, ~6,7 Mo) et servi tel quel. La PWA le met en cache à l'exécution
  (pas pré-téléchargé, car il est gros). ⚠️ Ne jamais relancer `gltf-transform optimize` dessus : ça
  casse les noms des maillages dont on a besoin pour relier maillage ↔ muscle.

### 2.5 Les réglages du générateur — *écrits à la main par nous*
- `backend/src/main/resources/generator/config.json` n'est **pas** téléchargé : c'est **notre**
  configuration, écrite à la main. Elle contient les « splits » (Full Body, Upper/Lower, Push/Pull/
  Legs, Body-part), les groupes musculaires de chaque jour, les schémas de séries/répétitions, et la
  progression sur 4 semaines.
- 💡 **« Split ».** En musculation, un *split* est la façon de **répartir** les groupes musculaires
  sur la semaine. Ex. « Push/Pull/Legs » = un jour pousser (pecs/épaules/triceps), un jour tirer
  (dos/biceps), un jour jambes.

> **En résumé :** exercices = téléchargés + embarqués · images = lues depuis un CDN · vidéos =
> identifiants YouTube curés à la main, lus depuis YouTube · modèle 3D = téléchargé + embarqué ·
> réglages du générateur = écrits par nous.

---

## Partie 3 — Fichier par fichier (frontend)

> Tu as demandé de remplacer le tableau « Key files » par, pour **chaque fichier** : ce qu'il
> **fait**, ce qu'il **expose** (offre aux autres), et **comment il est lié** aux autres fichiers du
> dépôt. Voici les fichiers qui comptent vraiment.

> 📁 **Note structure (depuis la restructuration en monorepo) :** le dépôt a maintenant deux
> dossiers côte à côte : **`frontend/`** (l'app React) et **`backend/`** (Spring Boot). Tous les
> chemins `src/...`, `public/...`, `scripts/...` ci-dessous sont donc relatifs à **`frontend/`**
> (ex. `src/main.tsx` = `frontend/src/main.tsx`). Les chemins commençant par `backend/...` sont,
> eux, déjà complets.

#### `src/main.tsx` — *point d'entrée & assemblage*
- **Fait :** c'est le **tout premier fichier exécuté**. Il applique le thème + la langue mémorisés
  **avant le premier affichage** (pour éviter un « flash » de mauvaise couleur), puis il **monte**
  l'application en empilant tous les « providers ».
- **Expose :** rien à importer ; il *démarre* l'app.
- **Lié à :** appelle `repositoryFactory` (pour obtenir les repos concrets), puis enveloppe `<App/>`
  dans l'ordre `RepositoryContext → Theme → Auth → Profile → Subscription → Router`.
- **Si on le supprime :** l'app ne démarre plus du tout.

#### `src/App.tsx` — *la coquille & le routage*
- **Fait :** dessine la **barre du haut** (TopBar) + la **barre de navigation du bas** (BottomNav)
  autour d'un tableau de routes `<Routes>`. Associe chaque chemin (`/exercises`, `/map`…) à son
  écran.
- **Expose :** le composant `App`.
- **Lié à :** lit les chemins depuis `config/routes.ts` ; rend les pages de `features/*`.

#### `src/domain/repositories/IExerciseRepository.ts` (+ `IMuscleRepository.ts`) — *le contrat*
- **Fait :** définit l'**interface** (le contrat) que l'UI utilise : `getAll()`, `getById()`,
  `findByMuscleGroup()`. Toutes les méthodes renvoient des `Promise` (asynchrones) pour qu'une source
  distante (réseau) ait la même forme qu'une source locale.
- **Expose :** le **type** `IExerciseRepository`.
- **Lié à :** **implémenté par** `StaticExerciseRepository` **et** `ApiExerciseRepository` ;
  **consommé par** tous les écrans (via `RepositoryContext`). C'est **la couture** (« the seam ») qui
  rend le dual-path possible.

#### `src/data/static/repositoryFactory.ts` — *la fabrique (composition root des données)*
- **Fait :** décide **une fois** quelle implémentation utiliser. Si `isBackendAuthEnabled()`
  (c.-à-d. `VITE_API_BASE_URL` défini) → expose les repos **API** (chacun enveloppant le repo
  statique comme filet de secours). Sinon → expose les repos **statiques**. Il normalise aussi les
  873 exercices **une seule fois** et construit l'index `muscleId → MuscleGroup`.
- **Expose :** les **singletons** `exerciseRepository` et `muscleRepository`.
- **Lié à :** appelle `ExerciseNormalizer`, `Static*Repository`, `Api*Repository`, `auth.config` ;
  **appelé par** `main.tsx`.
- **Si on le supprime :** plus aucune source de données — zéro exercice, zéro muscle.

#### `src/data/api/ApiExerciseRepository.ts` — *l'implémentation en-ligne avec filet*
- **Fait :** implémente `IExerciseRepository` en appelant `fetchCatalogExercises()`. Si l'appel
  échoue (pas de backend / erreur réseau), il **délègue silencieusement** au repo statique.
- **Expose :** la classe `ApiExerciseRepository`.
- **Lié à :** appelle `catalogApi` ; **utilise** le `StaticExerciseRepository` comme secours.

#### `src/config/auth.config.ts` — *l'interrupteur d'environnement*
- **Fait :** lit `VITE_GOOGLE_CLIENT_ID` et `VITE_API_BASE_URL`, et expose deux booléens :
  `isAuthEnabled()` (le bouton Google doit-il s'afficher ?) et `isBackendAuthEnabled()`
  (sommes-nous en mode en-ligne ?). **Ces deux booléens pilotent tout le comportement dual-path.**
- **Expose :** `isAuthEnabled()`, `isBackendAuthEnabled()`, l'id client Google, l'URL de base.
- **Lié à :** lu par `repositoryFactory`, par le contexte d'auth, par les `*Api.ts`.

#### `src/config/routes.ts` — *la source unique des chemins d'URL*
- **Fait :** centralise tous les chemins (`/exercises`, `/exercise/:id`, `/map`…) et les clés de
  paramètres d'URL. **Aucune chaîne d'URL n'est écrite « en dur » ailleurs.**
- **Lié à :** lu par `App.tsx` (le routeur) et par tous les liens de navigation.

#### `src/context/RepositoryContext.ts` — *l'injection des repos*
- **Fait :** un **Context React** qui transporte `{ exerciseRepository, muscleRepository }` jusqu'à
  chaque écran. C'est *pourquoi* aucun composant n'importe directement un repo concret.
- **Lié à :** fourni par `main.tsx`, consommé par les hooks de chaque feature.

#### `src/features/auth/AuthContext.tsx` — *l'état de session côté client*
- **Fait :** garde l'utilisateur connecté (`AuthUser`), le mémorise dans localStorage, et **à la
  déconnexion efface tous les caches par utilisateur** (jeton, profil, séances, poids, abonnement) —
  important pour qu'un appareil partagé ne laisse pas fuiter les données.
- **Expose :** `useAuth()` (état + actions `login`/`logout`).
- **Lié à :** utilise `authApi` ; lu partout où l'UI doit savoir « qui est connecté ».

#### `src/features/program-generator/programGenerator.ts` — *l'algorithme (pur)*
- **Fait :** pose le split choisi sur un calendrier lundi→dimanche, espace les séances avec des jours
  de repos, choisit des exercices **non redondants** par groupe musculaire, calcule le volume
  hebdomadaire, l'état de récupération, et une progression sur 4 semaines. **Fonction pure** (aucune
  UI, aucun réseau) et **testée unitairement**.
- **Lié à :** ses *réglages* viennent du backend (`/generator/config`, EM13) via `useGeneratorConfig`,
  avec une copie de secours embarquée gardée identique par un test.

> 💡 **« Fonction pure ».** Une fonction qui, pour les mêmes entrées, donne **toujours** la même
> sortie, et qui ne touche à rien d'extérieur (pas de réseau, pas d'écran). C'est facile à tester et
> ça peut tourner hors-ligne dans le navigateur. C'est pour ça que tout le « cerveau » du générateur
> est une fonction pure, et que seuls ses *réglages* viennent du serveur.

---

## Partie 4 — Classe par classe (backend)

> Même format : ce que la classe **fait**, ce qu'elle **expose**, comment elle est **liée** aux
> autres. Organisation **par fonctionnalité** (« package-by-feature ») : tout ce qui concerne
> l'auth est dans `auth/`, tout ce qui concerne les séances dans `workout/`, etc. Dans chaque
> dossier, le même empilement : **Controller → Service → Repository → Entity**.

> 💡 **Les 4 rôles à connaître (ils reviennent partout) :**
> - **Controller** = la **porte d'entrée HTTP**. Il reçoit la requête (`POST /workouts`), lit le
>   corps JSON, appelle le service, renvoie la réponse. Il ne contient **pas** de logique métier.
> - **Service** = le **cerveau métier** (« est-ce que cet utilisateur est premium ? »). C'est ici
>   que vivent les règles. Souvent en deux fichiers : l'**interface** (`XService`) + l'**implémentation**
>   (`XServiceImpl`).
> - **Repository** (Spring Data) = l'**accès base de données**. Tu déclares une interface, Spring
>   écrit le code SQL pour toi.
> - **Entity** = une **ligne de table** représentée comme un objet Java (`User`, `WorkoutSession`).

#### `MuscleMapApplication.java` — *le démarreur*
- **Fait :** point d'entrée Spring Boot (`@SpringBootApplication`). Scanne `com.musclemap`, lance
  Flyway (migrations), démarre le serveur.
- **Si on le supprime :** pas d'application.

#### `config/SecurityConfig.java` — *la politique de sécurité* (détaillé en [Partie 6](#partie-6--lauthentification-de-a-à-z))
- **Fait :** définit la **chaîne de filtres** de sécurité : désactive CSRF, met les sessions en
  `STATELESS`, place le `JwtAuthenticationFilter` **avant** le filtre login/mot de passe, déclare les
  routes **publiques** et les routes **protégées par rôle**.
- **Expose :** les *beans* `SecurityFilterChain`, `BCryptPasswordEncoder`, `AuthenticationManager`,
  la config CORS.
- **Lié à :** utilise `JwtAuthenticationFilter`, `DaoAuthenticationProvider`, les handlers 401/403.

> 💡 **« Bean ».** Dans Spring, un *bean* est simplement un **objet géré par le framework** : tu le
> déclares une fois (`@Bean` / `@Service`), et Spring l'**injecte** automatiquement partout où il est
> demandé (par le constructeur). C'est l'**injection de dépendances** côté Java.

#### `auth/JwtService.java` — *fabrique et vérifie les jetons*
- **Fait :** `generateToken(user)` signe un JWT HS256 dont le sujet est l'id utilisateur et les
  *claims* portent email + rôle + nom. `parse(token)` vérifie la signature/l'émetteur/l'expiration et
  reconstruit un `AuthenticatedUser`. **Échoue au démarrage** si le secret fait moins de 32 octets.
- **Expose :** `generateToken()`, `parse()`.
- **Lié à :** `AuthServiceImpl` (fabrique le jeton à la connexion), `JwtAuthenticationFilter`
  (vérifie le jeton à chaque requête).

#### `auth/JwtAuthenticationFilter.java` — *l'authentification à chaque requête*
- **Fait :** tourne **une fois par requête**. S'il y a un en-tête `Authorization: Bearer <jwt>`, il
  vérifie le jeton et remplit le « SecurityContext » avec l'utilisateur + son `ROLE_*`. Un jeton
  invalide/expiré est **ignoré silencieusement** (l'utilisateur reste anonyme → 401 ensuite). Il ne
  **lance jamais d'exception** ; la décision d'autoriser se prend plus loin.
- **Lié à :** appelle `JwtService.parse()` ; enregistré dans `SecurityConfig`.

#### `auth/GoogleTokenVerifier.java` — *la vérification Google côté serveur*
- **Fait :** enveloppe le `GoogleIdTokenVerifier` de Google, configuré avec **notre id client comme
  « audience »**. `verify(idToken)` vérifie signature/émetteur/audience/expiration **et** que l'email
  est vérifié, puis renvoie un `GoogleProfile(email, name, avatarUrl)`. Si l'id client n'est pas
  configuré, `/auth/google` renvoie 503 (et l'email/mot de passe continue de marcher).
- **Lié à :** appelé par `AuthServiceImpl.loginWithGoogle()`.

> 💡 **« Audience » d'un jeton Google.** Quand Google émet un jeton « Sign in with Google », il y
> inscrit **à qui ce jeton est destiné** : c'est le champ *audience* (`aud`), et il vaut **l'id
> client de TON application**. Notre backend vérifie « ce jeton a-t-il bien été émis *pour nous* ? ».
> Sans cette vérification, quelqu'un pourrait te présenter un jeton Google valide mais émis pour une
> *autre* application. Donc : **audience = « ce ticket est-il bien pour notre cinéma, ou pour le
> cinéma d'à côté ? »**.

#### `auth/AuthServiceImpl.java` — *le chef d'orchestre de l'auth*
- **Fait :** trois chemins qui **convergent** vers un seul `User` + un seul JWT :
  - `register` crée un utilisateur `Role.USER` (mot de passe haché BCrypt) ;
  - `login` fait passer les identifiants par l'`AuthenticationManager` de Spring (BCrypt) ;
  - `loginWithGoogle` vérifie le jeton Google puis **trouve-ou-crée** l'utilisateur OAuth.
- **Expose :** `AuthResponse` (contenant le JWT) pour les trois chemins.
- **Lié à :** `JwtService`, `GoogleTokenVerifier`, `UserRepository`.

#### `catalog/CatalogBootstrap.java` — *le remplissage du catalogue au démarrage*
- **Fait — le fameux « lit `resources/catalog/*.json`, normalise et upsert » :**
  - **Avant :** la base vient d'être créée par la migration `V5` ; les tables `muscles`,
    `muscle_heads`, `exercises`… existent mais sont **vides**.
  - **Quelle fonction ?** La méthode `run(...)` (lancée automatiquement au démarrage car la classe
    implémente `ApplicationRunner`). Elle appelle `seedMuscles()` puis `seedExercises()`.
  - **Ce que `seedExercises()` fait, étape par étape :**
    1. lit `catalog/exercise-videos.json` → une map `id exercice → id YouTube` (`readVideoIds`) ;
    2. lit `catalog/exercises.json` → la liste brute (`readRawExercises`) ;
    3. passe chaque exercice brut dans `ExerciseNormalizer.normalize(...)` (le même format que le
       frontend : muscles, équipement, média) ;
    4. `exerciseRepository.saveAll(...)` insère tout.
  - **Après :** les tables sont remplies et l'API `/catalog/**` renvoie de vraies données.
- 💡 **« Upsert » & « idempotent ».** *Upsert* = « insère si absent, sinon mets à jour ». Ici, le
  code ne remplit une table **que si elle est vide** (`if (count > 0) return;`). Donc relancer le
  serveur **ne crée pas de doublons** : c'est ce qu'on appelle **idempotent** (refaire l'opération
  donne le même résultat). Analogie : un interrupteur « allumé » ; appuyer 5 fois sur « allumer » ne
  change rien après la première.

#### `common/web/GlobalExceptionHandler.java` — *les erreurs uniformes*
- **Fait :** traduit **toutes** les exceptions en une enveloppe `ApiError` cohérente avec le bon code
  HTTP : validation → 400, non trouvé → 404, **premium requis → 402**, mauvais identifiants → 401,
  accès refusé → 403.
- **Lié à :** s'applique à tous les controllers. Sans lui, les clients recevraient des erreurs
  incohérentes et bavardes.

#### `subscription/SubscriptionServiceImpl.java` — *l'entitlement premium*
- **Fait :** crée paresseusement un abonnement FREE au premier accès, calcule `isPremium`, gère
  upgrade (PREMIUM +30 jours, simulé) / cancel. Lève `PremiumRequiredException` (→ 402) si un non-
  abonné tente d'ouvrir un contenu premium.
- **Lié à :** `SubscriptionController`, et consommé par le `ContentController` pour le blocage.

#### `admin/AdminBootstrap.java` — *le premier admin*
- **Fait :** au démarrage, **élève** l'email du propriétaire (`musclemap.admin.bootstrap-emails`,
  par défaut `omarmnif123@gmail.com`) au rôle ADMIN. Garantit qu'il y a toujours un moyen d'entrer.

---

## Partie 5 — L'i18n (les langues) expliquée

> 💡 **i18n = « internationalization ».** On écrit « i » + 18 lettres + « n » (il y a 18 lettres
> entre le i et le n dans « internationalization »), d'où le raccourci **i18n**. Ça désigne tout ce
> qui rend une app **traduisible en plusieurs langues** : aucun texte n'est écrit en dur dans les
> écrans ; à la place, chaque texte a une **clé**, et on a un dictionnaire par langue.

Dans MuscleMap :
- Il n'y a **pas de bibliothèque** i18n externe. On a écrit une petite couche **maison**, typée, dans
  `src/config/i18n/`. Il y a **3 packs** : **EN** (anglais), **FR** (français), **AR** (arabe, avec
  le sens d'écriture **droite-à-gauche / RTL** géré).
- Comment ça marche concrètement : au lieu d'écrire `<h1>Exercises</h1>`, on écrit quelque chose
  comme `<h1>{t.exercises.title}</h1>`, où `t` est le pack de la langue active (ré-exporté par
  `labels.ts`). Changer de langue = changer de pack.
- **Pourquoi maison et pas une librairie ?** Pour garder le bundle **léger** et surtout pour
  **forcer les 3 langues à rester synchronisées** : comme c'est typé (TypeScript), si tu ajoutes une
  clé en anglais et que tu oublies de la traduire, **le projet ne compile pas**. La traduction
  manquante est attrapée à la compilation, pas par un utilisateur.

---

## Partie 6 — L'authentification de A à Z

Cette partie répond à toutes tes questions sur OAuth, le « serveur d'autorisation », JWT, et Spring
Security. Lis-la dans l'ordre.

### 6.1 D'abord, dissipons LA confusion : a-t-on un « serveur d'autorisation » (AS) ?

Tu disais : « *le serveur d'autorisation est censé émettre les jetons, pas le backend… on n'a pas
d'AS ? Google sert au SSO, pas à la danse OAuth2 ?* ». **Tu as raison, et voici le tableau exact.**

- **En OAuth2 « classique »**, il y a un acteur appelé **Authorization Server (AS)** dont le métier
  est d'**émettre des jetons d'accès** pour qu'une application accède à une API au nom de
  l'utilisateur (ex. « autoriser cette app à lire mon Google Drive »).
- **Nous, on ne fait PAS ça.** On n'utilise pas Google pour accéder à une API Google au nom de
  l'utilisateur. On utilise Google **uniquement pour prouver l'identité** : « cette personne est
  bien titi@gmail.com ». Ça, ça s'appelle **SSO / OpenID Connect (OIDC)** — *l'authentification*,
  pas *l'autorisation d'accès à des ressources tierces*.
- 💡 **Donc : Google est notre « fournisseur d'identité » (SSO), pas un AS qui nous délivre des
  jetons d'accès à des ressources.** Il nous donne un **ID token** (une carte d'identité signée)
  qui dit seulement « voici qui c'est ».
- **Et nos propres jetons (JWT) ?** C'est **notre backend** qui les émet. Dans notre architecture,
  **le backend joue à la fois le rôle de serveur qui émet le jeton ET de serveur de ressources** qui
  le vérifie. C'est un choix tout à fait standard pour une app « monolithique » : on n'a pas besoin
  d'un AS séparé tant qu'on n'ouvre pas notre API à des applications tierces.

**Résumé en une phrase pour le jury :** *« Google prouve qui tu es (SSO/OIDC) ; c'est notre backend
qui émet ensuite son propre JWT. On n'a pas de serveur d'autorisation séparé parce qu'on n'autorise
pas d'apps tierces — notre backend émet et vérifie ses propres jetons. »*

### 6.2 C'est quoi un JWT, concrètement ?

> 💡 **JWT = JSON Web Token.** Un jeton compact en **3 parties** séparées par des points :
> `entête.charge_utile.signature`.
> - **Entête :** l'algorithme (ici **HS256** = HMAC-SHA256).
> - **Charge utile (claims) :** chez nous → `sub` (id utilisateur), `email`, `role`, `name`, `iss`
>   (émetteur = `musclemap`), `iat` (émis à), `exp` (expiration, 24 h par défaut).
> - **Signature :** un sceau calculé avec un **secret** que seul le backend connaît.
>
> N'importe qui peut **lire** la charge utile (c'est juste du Base64), mais **personne ne peut la
> falsifier** sans le secret : changer un seul octet casse la signature. Analogie : un billet de
> banque — tu peux lire le montant, mais tu ne peux pas en imprimer un vrai sans la planche
> secrète.

**Pourquoi un JWT plutôt qu'une session serveur ?**
- **Sans état :** le serveur ne stocke rien ; le jeton *est* la preuve. N'importe quelle copie du
  serveur peut répondre → scalabilité facile.
- **Auto-suffisant :** le rôle voyage dans le jeton, donc vérifier « est-il ADMIN ? » ne demande
  aucun appel base.
- **Parfait pour un frontend statique :** la PWA stocke le jeton et l'envoie en en-tête `Bearer`,
  sans cookie ni « session collante ».

### 6.3 Comment on obtient un jeton (3 portes d'entrée, une seule sortie)

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant FE as Frontend (PWA)
    participant G as Google Identity
    participant BE as Backend (Spring)
    participant DB as PostgreSQL

    Note over U,DB: A) Email + mot de passe
    U->>FE: saisit email/mot de passe
    FE->>BE: POST /api/v1/auth/login {email,password}
    BE->>DB: charge l'utilisateur, vérifie le hash BCrypt
    BE-->>FE: AuthResponse { token (JWT), user, expiresInSeconds }

    Note over U,DB: B) Connexion Google (SSO — login du propriétaire, préservé)
    U->>FE: clique « Sign in with Google »
    FE->>G: popup Google → consentement
    G-->>FE: ID token Google (signé par Google)
    FE->>BE: POST /api/v1/auth/google { credential: idToken }
    BE->>G: vérifie signature/émetteur/AUDIENCE/expiration
    BE->>DB: trouve-ou-crée l'utilisateur (provider=GOOGLE)
    BE-->>FE: AuthResponse { token (NOTRE JWT), user }

    Note over U,DB: C) Inscription
    U->>FE: s'inscrit
    FE->>BE: POST /api/v1/auth/register {email,password,displayName}
    BE->>DB: insère l'utilisateur (hash BCrypt, role=USER)
    BE-->>FE: AuthResponse { token, user }
```

Après n'importe quel chemin, le frontend **stocke le JWT** et **chaque appel suivant envoie**
`Authorization: Bearer <jwt>`.

> 💡 **BCrypt.** Une fonction qui transforme un mot de passe en **empreinte** impossible à inverser,
> et **lente exprès** (pour décourager les attaques par force brute). On ne stocke **jamais** le mot
> de passe en clair, seulement son empreinte BCrypt. Les utilisateurs Google n'ont pas de mot de
> passe du tout (`password_hash` est nul).

### 6.4 Ce que l'app expose SANS authentification (très important pour ta question)

Tu demandais : *« qu'est-ce que notre app expose sans auth, et avec auth quels appels sont
déclenchés ? »*. Voici la liste **exacte**, tirée de `SecurityConfig.java` :

**Routes PUBLIQUES (aucun jeton requis) :**
| Route | Pourquoi public |
|---|---|
| `POST /auth/register`, `POST /auth/login`, `POST /auth/google` | il faut bien pouvoir se connecter *avant* d'avoir un jeton |
| `GET /meta` | métadonnées de la plateforme (nom/version) |
| `GET /catalog/**` | le catalogue d'exercices/muscles est **public** (consultable en invité) |
| `GET /generator/**` | les réglages du générateur sont publics |
| `/actuator/health` | Render appelle ça pour vérifier que le serveur est vivant |
| `/swagger-ui.html`, `/v3/api-docs/**` | la documentation interactive de l'API |
| `OPTIONS /**` | les « préflights » CORS du navigateur |

**Tout le reste exige un jeton valide.** En plus :
- `GET/POST/... /admin/**` → réservé au rôle **ADMIN** ;
- `... /coach/**` → réservé aux rôles **COACH** ou **ADMIN**.

**Et avec auth, quels appels partent ?** Dès que tu es connecté, l'UI déclenche (avec le `Bearer`) :
`GET /auth/me` (rafraîchir la session), `GET /profile` (dashboard/onboarding), `GET /workouts`
(dashboard, progrès, intel), `GET /bodyweight`, `GET /subscription`, et — selon ton rôle —
`GET /coach/videos`, `GET /content/videos`, `GET /admin/metrics`/`/admin/users`.

### 6.5 Comment Spring Security travaille à chaque requête

Tu voulais comprendre « comment le setup Spring Security est fait, comment ça marche ». Voici le
mécanisme.

> 💡 **Spring Security = un pipeline de « filtres ».** Imagine la sécurité d'un aéroport : avant
> d'atteindre la porte d'embarquement (le *controller*), ta requête passe par une **file de
> contrôles** (les *filters*). Chaque filtre fait une vérification puis passe au suivant. C'est le
> patron **« chaîne de responsabilité »**.

Ce que fait notre `SecurityConfig` (le « setup ») :
1. **CORS activé** + **CSRF désactivé.** (CSRF est une protection utile *pour les cookies* ; nous on
   utilise un en-tête `Bearer`, pas de cookie, donc CSRF ne s'applique pas.)
2. **Sessions = STATELESS.** Spring ne crée aucune session en mémoire.
3. On **insère notre `JwtAuthenticationFilter` avant** le filtre login/mot de passe. Donc à chaque
   requête : il lit l'en-tête `Bearer`, vérifie le JWT, et met l'utilisateur dans le « contexte de
   sécurité » de la requête.
4. On déclare les **règles de routes** (publiques / `authenticated()` / `hasRole(...)`).
5. On branche les **handlers d'erreur** : pas de jeton → **401** (`JwtAuthenticationEntryPoint`),
   mauvais rôle → **403** (`RestAccessDeniedHandler`), rendus en `ApiError` uniforme.

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant F as JwtAuthenticationFilter
    participant SC as Règles SecurityConfig
    participant C as Controller

    FE->>F: GET /api/v1/admin/users (Authorization: Bearer jwt)
    F->>F: vérifie le JWT (signature, émetteur, expiration)
    F->>F: pose le contexte = utilisateur + ROLE_ADMIN
    F->>SC: continue la chaîne
    SC->>SC: /admin/** exige hasRole("ADMIN")
    alt rôle correct
        SC->>C: appelle le controller
        C-->>FE: 200 + données
    else jeton absent/invalide
        SC-->>FE: 401 ApiError
    else mauvais rôle
        SC-->>FE: 403 ApiError
    end
```

### 6.6 Déconnexion & expiration du jeton (ta question directe)

Tu demandais : *« que se passe-t-il si on se déconnecte / si le jeton expire ? »*.

- **Le jeton expire (au bout de 24 h par défaut) :** le `JwtAuthenticationFilter` le rejette
  (signature encore bonne, mais `exp` dépassé). L'utilisateur redevient **anonyme** → le prochain
  appel protégé renvoie **401**. Le frontend interprète le 401 comme « session expirée » et te
  renvoie à l'écran de connexion. Il faut **se reconnecter** pour obtenir un nouveau jeton.
- **La déconnexion (logout) :** comme les jetons sont **sans état**, il n'y a **rien à « éteindre »
  côté serveur**. Se déconnecter = **le frontend jette le jeton** (et vide les caches locaux dans
  `AuthContext`). Le serveur, lui, n'a aucune session à détruire.
- **Conséquence importante (à savoir pour le jury) :** un jeton déjà émis reste techniquement
  valable jusqu'à son `exp`, même après un logout côté client. C'est le compromis classique du
  « stateless ». Pour une révocation immédiate, il faudrait une liste noire ou des jetons courts +
  refresh — une évolution possible, non nécessaire à ce stade.

### 6.7 « Boilerplate reduction » — c'était quoi ?

> 💡 **« Boilerplate ».** Du code **répétitif et sans intérêt** qu'on est obligé d'écrire (les
> getters/setters, les constructeurs, `equals`, `toString`…). **« Boilerplate reduction » = réduire
> ce code répétitif.** Dans le backend, c'est le rôle de la bibliothèque **Lombok** : tu mets une
> annotation `@Getter`/`@Builder` sur une classe, et Lombok génère tout ce code ennuyeux **à la
> compilation**, pour que ton fichier reste court et lisible.

---

## Partie 7 — Les variables d'environnement

> 💡 **Variable d'environnement.** Un réglage qu'on **donne de l'extérieur** au programme (pas écrit
> dans le code), pour ne pas mettre de secrets ni d'URLs dans le dépôt. Côté frontend, elles
> commencent par `VITE_` et sont injectées **au moment du build**. Côté backend, elles sont lues **au
> démarrage**.

| Variable | Côté | À quoi elle sert | Secret ? | Si vide / absente |
|---|---|---|---|---|
| `VITE_GOOGLE_CLIENT_ID` | frontend (build) | affiche le bouton « Sign in with Google » | Non (id public) | tout le login est caché, mode invité |
| `VITE_API_BASE_URL` | frontend (build) | pointe l'app vers le backend ; **c'est l'interrupteur dual-path** | Non | mode **hors-ligne** (JSON embarqué + localStorage) |
| `MUSCLEMAP_GOOGLE_CLIENT_ID` | backend | **audience** pour vérifier les ID tokens Google | Non (= même id public) | `/auth/google` renvoie 503, email/mdp marche encore |
| `MUSCLEMAP_JWT_SECRET` | backend | clé secrète qui **signe** les JWT (**≥ 32 octets**) | **OUI — secret** | le backend **refuse de démarrer** |
| `SPRING_DATASOURCE_URL` | backend | URL JDBC de la base | partiellement | pas de base → pas de démarrage |
| `SPRING_DATASOURCE_USERNAME` / `PASSWORD` | backend | identifiants base | **OUI (password)** | idem |
| `MUSCLEMAP_CORS_ALLOWED_ORIGINS` | backend | quelles origines (sites) peuvent appeler l'API | Non | défaut = le domaine GitHub Pages |
| `SPRING_PROFILES_ACTIVE` | backend | `dev` ou `prod` | Non | défaut `dev` |
| `DB_POOL_MAX` | backend | nb max de connexions DB (petit en free tier) | Non | défaut 5 |

> 💡 **Pourquoi `VITE_API_BASE_URL` est « l'interrupteur » ?** Parce que c'est *la seule* chose à
> changer pour passer du mode hors-ligne (démo GitHub Pages) au mode en-ligne (branché sur Render/
> Azure). Vide = hors-ligne. Rempli = en-ligne. Tout le reste de l'app s'adapte automatiquement.

---

## Partie 8 — La base de données

- **Moteur :** PostgreSQL 16. **Propriétaire du schéma : Flyway** (`ddl-auto=none` → Hibernate ne
  modifie **jamais** le schéma tout seul).
- 💡 **Flyway.** Un outil de **migrations** : le schéma de la base est décrit par une suite de
  fichiers SQL numérotés (`V1__…`, `V2__…`). Au démarrage, Flyway applique ceux qui manquent, dans
  l'ordre, et note ce qu'il a fait dans une table `flyway_schema_history`. Avantage : le schéma est
  **versionné, reproductible, auditable** — comme du code.

**Historique des migrations :**
| Version | Ajoute |
|---|---|
| **V1** | `users`, `user_profiles`, `generated_programs`, `workout_sessions`, `workout_exercises`, `coach_videos`, `subscriptions` |
| **V2** | `users.avatar_url`, `users.auth_provider` (LOCAL/GOOGLE) — pour Google |
| **V3** | `bodyweight_entries` (un poids par jour) |
| **V4** | `coach_videos.content_type` (TECHNIQUE/EDUCATION/PROGRAM) |
| **V5** | `muscles`, `muscle_heads`, `exercises`, `exercise_instructions`, `exercise_muscles`, `exercise_media` — migration du catalogue (EM13) |

**Conventions :**
- Tables de **données utilisateur** : clés primaires **UUID** + colonnes d'audit `created_at`/
  `updated_at`.
- Tables de **catalogue** : clés primaires **chaînes naturelles** (les ids de free-exercise-db) pour
  que l'API et les données embarquées soient **interchangeables**.
- Colonnes « enum » = `VARCHAR` + `CHECK` (pas de type ENUM Postgres) — plus simple à faire évoluer.

(Le diagramme ER complet et les détails de chaque table sont dans `USER_GUIDE.md` §7 et
`DATA_MODEL.md`.)

---

## Partie 9 — L'API avec exemples Postman

> 💡 **Postman.** Un outil pour **envoyer des requêtes HTTP à la main** et voir la réponse, sans
> écrire de code. Parfait pour tester l'API. Tout ce qui suit marche aussi en `curl`.

- **Base de l'URL :** `<BASE>/api/v1` où `<BASE>` est `http://localhost:8080` en local, ou
  **`https://musclemap-q65o.onrender.com`** en ligne (backend Render). Ex. en ligne :
  `https://musclemap-q65o.onrender.com/api/v1/catalog/exercises`.
- **En-tête d'auth :** `Authorization: Bearer <ton_jwt>`.
- **Doc interactive :** Swagger UI sur `<BASE>/swagger-ui.html`.

### Recette pas-à-pas dans Postman

**1) S'inscrire (récupère un jeton)**
```
POST  http://localhost:8080/api/v1/auth/register
Headers:  Content-Type: application/json
Body (raw, JSON):
{
  "email": "test@demo.com",
  "password": "Password123!",
  "displayName": "Testeur"
}
```
Réponse :
```json
{ "token": "eyJhbGciOiJIUzI1Ni␣...", "tokenType": "Bearer",
  "expiresInSeconds": 86400,
  "user": { "id": "…", "email": "test@demo.com", "role": "USER" } }
```
👉 **Copie la valeur de `token`.**

**2) Se connecter (si déjà inscrit)**
```
POST  http://localhost:8080/api/v1/auth/login
Body: { "email": "test@demo.com", "password": "Password123!" }
```

**3) Utiliser le jeton sur une route protégée**

Dans Postman, onglet **Authorization → Type: Bearer Token**, colle le jeton. (Ou en en-tête brut :
`Authorization: Bearer eyJhbG...`.)
```
GET  http://localhost:8080/api/v1/profile
Authorization: Bearer <token>
```

**4) Enregistrer son profil (fin de l'onboarding)**
```
PUT  http://localhost:8080/api/v1/profile
Authorization: Bearer <token>
Body:
{
  "age": 27, "gender": "MALE", "heightCm": 178, "weightKg": 76,
  "fitnessLevel": "INTERMEDIATE", "trainingGoal": "HYPERTROPHY",
  "weeklyFrequency": 4,
  "availableEquipment": ["BARBELL","DUMBBELL","BODYWEIGHT"],
  "injuries": ""
}
```

**5) Sauvegarder une séance terminée**
```
POST  http://localhost:8080/api/v1/workouts
Authorization: Bearer <token>
Body:
{
  "name": "Push Day", "focus": "PUSH", "status": "COMPLETED",
  "exercises": [
    { "exerciseRef": "Barbell_Bench_Press", "sets": 4, "reps": 8, "weightKg": 60, "rpe": 8, "completed": true },
    { "exerciseRef": "Standing_Military_Press", "sets": 3, "reps": 10, "weightKg": 35, "rpe": 7, "completed": true }
  ]
}
```

**6) Lire le catalogue (PUBLIC — aucun jeton nécessaire)**
```
GET  http://localhost:8080/api/v1/catalog/exercises
GET  http://localhost:8080/api/v1/catalog/exercises/Barbell_Bench_Press
GET  http://localhost:8080/api/v1/catalog/muscles
GET  http://localhost:8080/api/v1/generator/config
```

**7) Tester le blocage premium (doit renvoyer 402)**

Avec un compte **FREE**, ouvre un contenu marqué premium :
```
GET  http://localhost:8080/api/v1/content/videos/<id-d-une-video-premium>
Authorization: Bearer <token-d-un-user-FREE>
→ 402 Payment Required  (preuve que le blocage est côté serveur)
```

### Table de référence des principaux points d'API

| Méthode & chemin | Auth | Corps | Renvoie |
|---|---|---|---|
| `POST /auth/register` | public | `{email, password, displayName}` | `AuthResponse {token, user, expiresInSeconds}` |
| `POST /auth/login` | public | `{email, password}` | `AuthResponse` |
| `POST /auth/google` | public | `{credential: googleIdToken}` | `AuthResponse` |
| `GET /auth/me` | user | — | `UserSummary` |
| `GET /profile` · `PUT /profile` | user | (PUT) `ProfileRequest` | `ProfileResponse` |
| `POST /workouts` · `GET /workouts` · `GET/DELETE /workouts/{id}` | user (propriétaire) | (POST) `WorkoutSessionRequest` | `WorkoutSessionResponse` |
| `POST/GET /bodyweight` · `DELETE /bodyweight/{id}` | user | (POST) `{weightKg, recordedOn, note}` | `BodyweightResponse` |
| `GET /subscription` · `POST /subscription/upgrade` · `/cancel` | user | — | `SubscriptionResponse` |
| `POST/GET/PUT/DELETE /coach/videos` · `PATCH /coach/videos/{id}/publish` | COACH/ADMIN | `CoachVideoRequest` | `CoachVideoResponse` |
| `GET /content/videos` · `GET /content/videos/{id}` | tout user | — | `CoachVideoResponse` (premium → URL masquée ou **402**) |
| `GET /admin/metrics` · `GET /admin/users` · `PATCH /admin/users/{id}/role`·`/status` | ADMIN | (PATCH) `{role}` / `{enabled}` | `AdminMetricsResponse` / `AdminUserResponse` |
| `GET /catalog/**` · `GET /generator/config` · `GET /meta` | public | — | données de référence |

---

## Partie 10 — Déploiement

### 10.1 État réel aujourd'hui

| Composant | État | Détail |
|---|---|---|
| **Frontend** | ✅ **Déployé** | GitHub Pages, automatiquement à chaque `push` sur `master` (workflow `.github/workflows/deploy.yml`). URL : https://omar692002.github.io/musclemap/ |
| **Backend** | ✅ **Déployé sur Render** | Service web Docker. URL : **https://musclemap-q65o.onrender.com** (API sous `/api/v1`). Free tier. |
| **Base de données** | ✅ **Créée sur Render** | PostgreSQL managé `musclemap-db` (même région, Oregon). Flyway a migré le schéma et `CatalogBootstrap` a rempli les 873 exercices au premier démarrage. |

> 📜 **Note historique :** au départ rien n'avait été configuré sur Render (le `USER_GUIDE.md`
> décrivait seulement la procédure sans l'exécuter, et il n'existait aucun blueprint). Le backend a
> été **réellement déployé** ensuite, à la main via le dashboard (voir la procédure exacte en
> [10.3](#103-déployer-le-backend--la-base-sur-render)). Le fichier `backend/render.yaml` reste
> fourni comme **alternative automatisée** (Blueprint) pour reproduire le tout en quelques clics.

### 10.2 C'est quoi un « Blueprint » Render ?

> 💡 **Blueprint = « infrastructure as code » chez Render.** Au lieu de cliquer manuellement dans le
> dashboard pour créer le service web, la base, et taper chaque variable, tu écris **un fichier**
> `render.yaml` qui décrit tout. Render le lit et **crée tout automatiquement**. C'est exactement le
> souvenir que tu avais (« il faut créer des blueprints »). Le fichier est maintenant dans
> `backend/render.yaml`.

Ce que notre `render.yaml` déclare :
- une **base PostgreSQL** `musclemap-db` (free tier) ;
- un **service web Docker** `musclemap-api` (construit depuis `backend/Dockerfile`, healthcheck sur
  `/actuator/health`, redéploiement auto) ;
- les **variables** : celles non secrètes en clair, celles secrètes en `sync: false` (on les saisit
  une fois dans l'interface, jamais dans le dépôt).

### 10.3 Déployer le backend + la base sur Render

Voici la **procédure exacte réellement suivie** (à la main, via le dashboard). C'est l'ordre qui
compte : **on crée la base d'abord**, puis le service web qui pointe dessus.

#### Étape 1 — Créer la base PostgreSQL
**New → PostgreSQL**, puis :

| Champ | Valeur utilisée |
|---|---|
| Name | `musclemap-db` |
| Database (dbname) | `musclemap` |
| User | `musclemap` |
| Region | **Oregon (US West)** — ⚠️ doit être **la même** que le service web (réseau privé interne) |
| PostgreSQL Version | 18 (défaut, OK) |
| Plan | **Free** (256 Mo / 1 Go) |

→ **Create Database**. Ensuite, ouvrir la page de la base et copier son **Internal Database URL**
(forme `postgresql://musclemap:MOTDEPASSE@dpg-xxxxx-a/musclemap`).

#### Étape 2 — Créer le service web
**New → Web Service** → connecter le dépôt `omar692002/musclemap`, puis :

| Champ | Valeur utilisée |
|---|---|
| Name | `musclemap` |
| Language / Environment | **Docker** (Render détecte `backend/Dockerfile`) |
| Branch | `master` |
| Region | **Oregon (US West)** (même que la base) |
| **Root Directory** | **`backend`** ← indispensable (le Dockerfile est là) |
| Instance Type | **Free** (512 Mo / 0.1 CPU) |
| **Advanced → Health Check Path** | **`/actuator/health`** |

#### Étape 3 — Les variables d'environnement (le point clé)

On distingue **ce qu'il faut saisir à la main** de **ce qui a déjà une valeur par défaut** dans
l'app/l'image.

**À SAISIR À LA MAIN (obligatoire — pas de défaut ou secret) :**

| Variable | Valeur | D'où elle vient |
|---|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://dpg-xxxxx-a:5432/musclemap` | l'*Internal Database URL* convertie : préfixer `jdbc:`, ajouter `:5432`, **retirer** le `user:pass@` |
| `SPRING_DATASOURCE_USERNAME` | `musclemap` | l'utilisateur de la base |
| `SPRING_DATASOURCE_PASSWORD` | *(le mot de passe de l'Internal URL)* | **secret** — jamais dans le code |
| `MUSCLEMAP_JWT_SECRET` | *(≥ 32 octets aléatoires)* | bouton **Generate** de Render, ou `openssl rand -base64 48` |
| `MUSCLEMAP_GOOGLE_CLIENT_ID` | `702692182934-…apps.googleusercontent.com` | l'id client Google (**public**, le même que le frontend) |

> ⚠️ **Le `client_secret`** présent dans le fichier `client_secret_*.json` ne se met **nulle part**
> sur Render : notre flux « Sign in with Google » n'a besoin que du **client_id** (utilisé comme
> *audience*). Le secret servirait à un autre flux OAuth qu'on n'utilise pas.

**DÉJÀ FOURNI — inutile de saisir (mais sans danger si on le fait) :**

| Variable | Défaut existant | Où |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` | **déjà gravé dans le Dockerfile** (`ENV SPRING_PROFILES_ACTIVE=prod`) |
| `MUSCLEMAP_CORS_ALLOWED_ORIGINS` | `https://omar692002.github.io` | défaut dans `application-prod.yml` |
| `DB_POOL_MAX` | `5` | défaut |
| `PORT` | injecté par Render | **ne pas l'ajouter** ; l'app lit `${PORT:8080}` |

→ **Deploy web service.** Render construit l'image Docker (la 1re fois est longue), **Flyway migre
le schéma**, `CatalogBootstrap` insère les 873 exercices.

#### Étape 4 — Vérifier
```
https://musclemap-q65o.onrender.com/actuator/health        → {"status":"UP"}
https://musclemap-q65o.onrender.com/api/v1/meta            → {"name":"MuscleMap","version":...}
https://musclemap-q65o.onrender.com/api/v1/catalog/exercises → la liste des exercices
```

#### Étape 5 — Brancher le frontend sur le backend
Dans **GitHub → repo → Settings → Secrets and variables → Actions → Variables**, définir la
variable :
```
VITE_API_BASE_URL = https://musclemap-q65o.onrender.com/api/v1
```
puis re-déclencher le déploiement Pages (Actions → « Deploy to GitHub Pages » → Run workflow, ou un
nouveau `push`). Le site bascule alors du mode hors-ligne au **vrai backend**. (Le workflow
`deploy.yml` lit déjà cette variable.)

> ⚠️ **Free tier Render :** le service **s'endort après ~15 min** d'inactivité et met ~30–60 s à se
> réveiller au premier appel. Acceptable pour une démo ; passer en `Starter` (7 $/mois) pour qu'il
> reste toujours allumé le jour de la soutenance.

**Alternative automatisée (Blueprint) :** au lieu des étapes 1–3 à la main, on peut faire
**New → Blueprint** et laisser Render lire `backend/render.yaml`, qui déclare la base + le service +
les variables (les secrets en `sync: false` sont demandés une fois). Même résultat, en quelques
clics.

### 10.4 Déployer frontend + backend sur une VM Azure

Ton ami va te prêter une **VM Azure** où tu veux héberger **frontend + backend** ensemble. Voici
l'architecture recommandée et les étapes.

**Architecture cible sur la VM :**
```
                 Internet (HTTPS, port 443)
                          │
                          ▼
            ┌─────────────────────────────┐
            │   VM Azure (Ubuntu 22.04)    │
            │                              │
            │   Nginx (reverse proxy)      │
            │    ├─ /            → frontend (fichiers statiques du build)
            │    └─ /api/v1/**   → backend (proxy vers localhost:8080)
            │                              │
            │   Backend Spring Boot        │  (conteneur Docker, port 8080)
            │   PostgreSQL 16              │  (conteneur Docker, port 5432, volume persistant)
            └─────────────────────────────┘
```

> 💡 **Reverse proxy (Nginx).** Un portier unique en façade. Il écoute le port 443 (HTTPS) et
> **redirige** : les URLs normales vers les fichiers du frontend, les URLs `/api/...` vers le
> backend. Avantage : **un seul domaine, un seul certificat HTTPS**, et le frontend et le backend
> ont la *même origine* → plus de souci CORS.

**Les fichiers prêts pour ça (déjà dans le dépôt) :**
- **`docker-compose.prod.yml`** (racine) — lance `db` (PostgreSQL + volume) + `backend` (build
  depuis `./backend`), tous deux liés à `127.0.0.1` (jamais publics).
- **`.env.prod.example`** (racine) — modèle des secrets ; à copier en `.env` puis remplir.
- **`deploy/nginx.conf`** — la config du reverse proxy (statique sur `/`, proxy sur `/api`).
- **`DEPLOY_AZURE.md`** (racine) — **le guide pas-à-pas complet**, avec toutes les commandes.

**Étapes (résumé — détail dans `DEPLOY_AZURE.md`) :**
1. **Préparer la VM :** installer Docker + Nginx + Certbot ; ouvrir les ports 22/80/443.
2. **Backend + base :** `cp .env.prod.example .env`, remplir les secrets, puis
   `docker compose -f docker-compose.prod.yml up -d --build`.
3. **Frontend :** `cd frontend && npm ci && VITE_API_BASE_URL=https://<domaine>/api/v1
   VITE_GOOGLE_CLIENT_ID=<id> npm run build`, puis copier `dist/` dans `/var/www/musclemap`.
4. **Nginx :** installer `deploy/nginx.conf`, lancer `certbot --nginx` pour le HTTPS.
5. **Google :** ajouter `https://<domaine>` dans les *Authorized JavaScript origins* (console Google
   Cloud), sinon le bouton Google ne se charge pas.

### 10.5 Spécifications de la VM & checklist des livrables

**Spécifications minimales / recommandées de la VM Azure :**

| Ressource | Minimum (démo) | Recommandé (confortable) | Pourquoi |
|---|---|---|---|
| **Taille Azure** | `B1ms` (1 vCPU, 2 Go RAM) | `B2s` (2 vCPU, 4 Go RAM) | la JVM Spring Boot aime ≥ 1,5 Go ; avec Postgres + Nginx sur la même VM, 4 Go est plus sûr |
| **vCPU** | 1 | 2 | build/démarrage plus rapide |
| **RAM** | 2 Go | 4 Go | JVM (~512 Mo–1 Go) + Postgres + Nginx + marge |
| **Disque** | 30 Go SSD | 30–64 Go SSD | OS + image Docker + données Postgres + logs |
| **OS** | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS | LTS, très bien documenté |

**Ce qu'il faut prévoir EN PLUS (ta question « what else do we need ? ») :**
- **Une IP publique** sur la VM (et idéalement un **nom de domaine** pointant dessus — sinon HTTPS
  est compliqué ; Let's Encrypt exige un domaine). 👉 **Oui, il faut un endpoint public.**
- **Ouvrir les ports** dans le *Network Security Group* Azure : **22** (SSH, à restreindre à ton
  IP), **80** (HTTP, pour le challenge Let's Encrypt + redirection), **443** (HTTPS). **Ne PAS**
  exposer 8080 ni 5432 au public (ils restent internes à la VM).
- **Un certificat HTTPS** (gratuit via Let's Encrypt/Certbot).
- **Un secret JWT** fort (`openssl rand -base64 48`) et le **mot de passe Postgres**.
- **Mettre à jour la console Google Cloud** : ajouter le domaine de la VM dans les origines
  autorisées.
- **Sauvegardes Postgres** (au minimum un `pg_dump` régulier) si les données comptent.

**Livrables (à fournir au jury / pour la mise en production) :**
- [x] `backend/render.yaml` — le blueprint Render (créé).
- [x] `backend/Dockerfile` — image multi-étapes (existant).
- [x] `backend/docker-compose.yml` — Postgres local pour le dev (existant).
- [x] `docker-compose.prod.yml` + `.env.prod.example` — pile de prod (backend + Postgres) pour la VM.
- [x] `deploy/nginx.conf` — reverse proxy (frontend statique + proxy `/api`).
- [x] `DEPLOY_AZURE.md` — guide de déploiement VM Azure pas-à-pas.
- [x] Ce guide (`GUIDE_UTILISATEUR_FR.md`) + `USER_GUIDE.md` (version EN).

> 💡 **Récap de la « danse » du déploiement :** le **frontend** est juste des fichiers statiques
> (GitHub Pages *ou* Nginx sur la VM). Le **backend** est une **image Docker** identique partout
> (Render *ou* VM). La **base** est un Postgres managé (Render) ou un conteneur (VM). La seule chose
> qui « branche » le frontend au backend est la variable **`VITE_API_BASE_URL`** au moment du build.

---

## Annexe — Questions probables du jury

**Q : Pourquoi une PWA et pas du natif (Flutter/React Native) ?**
Un seul code → web *et* installable *et* hors-ligne, gratuitement sur GitHub Pages. Le natif viendra
via **Capacitor** qui emballe le *même* build — sans réécriture.

**Q : Pourquoi Spring Boot et pas Node/Express ?**
L'exigence académique était un « vrai backend ». Spring Boot offre architecture en couches, typage
fort, sécurité mature (la chaîne de filtres JWT + RBAC), JPA, validation et Swagger — un choix
défendable et standard qui met en valeur l'OOP/SOLID.

**Q : Pourquoi Flyway et pas l'auto-DDL d'Hibernate ?**
L'auto-DDL est non déterministe et dangereux en production. Flyway rend le schéma **versionné,
relisible et reproductible** (`V1…V5`), et `ddl-auto=none` garantit qu'Hibernate ne le modifie
jamais en douce.

**Q : Pourquoi émettre votre propre JWT après Google plutôt qu'utiliser le jeton Google ?**
Pour que les utilisateurs Google et email/mot de passe partagent **un seul** modèle d'identité,
**un seul** système de rôles, **un seul** chemin d'autorisation. Le backend vérifie le jeton Google
une fois, puis tout en aval est notre JWT sans état. On contrôle aussi l'expiration et les claims.

**Q : N'aviez-vous pas besoin d'un serveur d'autorisation (AS) ?**
Non : on n'autorise pas d'apps tierces à accéder à des ressources au nom de l'utilisateur. Google
sert uniquement de **fournisseur d'identité (SSO/OIDC)**. Notre backend joue à la fois l'émetteur et
le vérificateur de jetons — standard pour une app monolithique.

**Q : Comment le contenu premium est-il réellement protégé ?**
**Côté serveur.** `GET /content/videos` masque l'URL des vidéos premium pour les non-abonnés, et
`GET /content/videos/{id}` renvoie un **402** strict. Le cadenas côté client n'est que de l'UX ; le
serveur est l'autorité.

**Q : C'est quoi le « dual-path » et pourquoi ça compte ?**
Chaque fonctionnalité marche de deux façons : contre le vrai backend, ou — quand `VITE_API_BASE_URL`
est vide — contre du JSON embarqué + localStorage. C'est pour ça que la démo GitHub Pages n'a besoin
d'aucun serveur. Rendu possible par la couture des interfaces de repository.

**Q : Et ensuite (T2) ?**
Vrai paiement Stripe (la logique d'entitlement + la colonne `external_ref` sont déjà là), apps
natives via Capacitor, compression du `.glb` pour mobile, et le même Docker sur Azure (AKS) pour la
montée en charge.
