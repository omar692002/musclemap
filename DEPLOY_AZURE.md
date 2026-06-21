# Déploiement sur une VM Azure — frontend + backend + base

> **But :** héberger **toute** l'application MuscleMap (frontend React + backend Spring Boot +
> PostgreSQL) sur **une seule VM Azure**, derrière un seul domaine HTTPS.
>
> **Public visé :** toi (le propriétaire) ou l'ami qui prête la VM. Aucune connaissance DevOps
> avancée requise — chaque commande est donnée. Les explications de concepts sont dans
> `GUIDE_UTILISATEUR_FR.md` (Partie 10).

---

## 0. Ce que tu vas obtenir

```
                 Internet  (HTTPS, port 443)
                          │
                          ▼
        ┌──────────────────────────────────────┐
        │  VM Azure (Ubuntu 22.04)              │
        │                                      │
        │  Nginx (public 80/443)               │
        │   ├─ /          → /var/www/musclemap │  (frontend statique = frontend/dist)
        │   └─ /api/**    → 127.0.0.1:8080     │  (proxy vers le backend)
        │                                      │
        │  Docker Compose (privé, localhost) : │
        │   ├─ backend  → 127.0.0.1:8080       │  (Spring Boot)
        │   └─ db       → 127.0.0.1:5432       │  (PostgreSQL + volume persistant)
        └──────────────────────────────────────┘
```

Le frontend et le backend partagent **la même origine** (le domaine) → **pas de problème CORS**.
Seul Nginx est exposé à internet ; le backend et la base restent **internes** à la VM.

---

## 1. Pré-requis (ce qu'il faut AVANT de commencer)

| Élément | Détail |
|---|---|
| **Une VM Azure** | Ubuntu 22.04 LTS. Taille recommandée **B2s** (2 vCPU / 4 Go RAM), disque **30 Go SSD**. Minimum absolu pour une démo : **B1ms** (1 vCPU / 2 Go). |
| **Une IP publique** | attachée à la VM (Azure en propose une par défaut). |
| **Un nom de domaine** | ⚠️ **nécessaire pour le HTTPS** (Let's Encrypt exige un domaine, pas une IP). Ex. un sous-domaine `musclemap.tondomaine.com` dont l'enregistrement **A** pointe vers l'IP publique de la VM. |
| **Ports ouverts (NSG Azure)** | **22** (SSH, idéalement restreint à ton IP), **80** (HTTP), **443** (HTTPS). **NE PAS** ouvrir 8080 ni 5432. |
| **Un accès SSH** | `ssh azureuser@<IP-de-la-VM>`. |
| **L'id client Google** | le même que le frontend (pour garder le login Google). |

> 💡 **Pourquoi un domaine et un endpoint public ?** Sans IP publique, personne n'atteint la VM
> depuis internet. Sans domaine, Let's Encrypt ne peut pas délivrer de certificat HTTPS gratuit, et
> le bouton « Sign in with Google » refuse de fonctionner sur une simple IP. Donc : **oui, il faut
> un endpoint public + un domaine.**

---

## 2. Préparer la VM (une seule fois)

Se connecter en SSH puis installer Docker, Nginx, Certbot :

```bash
# Mise à jour de base
sudo apt-get update && sudo apt-get upgrade -y

# Docker + Docker Compose (plugin)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER          # pour lancer docker sans sudo
# (se déconnecter/reconnecter en SSH pour que le groupe prenne effet)

# Nginx + Certbot (HTTPS gratuit)
sudo apt-get install -y nginx certbot python3-certbot-nginx git
```

Ouvrir les ports côté **Azure** (Portail → la VM → Networking → Network security group) :
autoriser en entrée **22**, **80**, **443**. (Ou en CLI : `az vm open-port`.)

---

## 3. Récupérer le code sur la VM

```bash
cd ~
git clone https://github.com/omar692002/musclemap.git
cd musclemap
```

---

## 4. Lancer le backend + la base (Docker Compose)

```bash
# 1) Créer le fichier de secrets à partir du modèle
cp .env.prod.example .env

# 2) Éditer .env et remplir :
#    - POSTGRES_PASSWORD       (openssl rand -base64 24)
#    - MUSCLEMAP_JWT_SECRET    (openssl rand -base64 48)
#    - MUSCLEMAP_GOOGLE_CLIENT_ID  (l'id client Google)
#    - MUSCLEMAP_CORS_ALLOWED_ORIGINS=https://musclemap.tondomaine.com
nano .env

# 3) Construire et démarrer (db + backend)
docker compose -f docker-compose.prod.yml up -d --build

# 4) Suivre le démarrage : Flyway migre, CatalogBootstrap remplit le catalogue
docker compose -f docker-compose.prod.yml logs -f backend
```

**Vérifier que le backend est vivant (depuis la VM) :**
```bash
curl http://127.0.0.1:8080/actuator/health      # attendu : {"status":"UP"}
curl http://127.0.0.1:8080/api/v1/meta
```

> 💡 La première construction de l'image télécharge Maven + les dépendances : ça peut prendre
> quelques minutes. Les démarrages suivants sont rapides.

---

## 5. Construire le frontend et le servir

Le frontend doit être **construit avec l'URL de l'API** pour basculer en mode en-ligne. Deux
options : construire **sur la VM**, ou construire **sur ton PC** et copier le `dist/`.

**Option simple : construire sur la VM.**
```bash
# Installer Node 22 (si absent)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

cd ~/musclemap/frontend
npm ci

# Construire en pointant vers l'API du même domaine (chemin /api/v1)
VITE_API_BASE_URL="https://musclemap.tondomaine.com/api/v1" \
VITE_GOOGLE_CLIENT_ID="<ton-id-client-google>" \
npm run build

# Publier le build là où Nginx le servira
sudo mkdir -p /var/www/musclemap
sudo cp -r dist/* /var/www/musclemap/
```

> 💡 **`VITE_API_BASE_URL`** est *l'interrupteur* du dual-path : en le fixant au build, l'app passe
> du mode hors-ligne au mode en-ligne (elle appellera `https://.../api/v1`). Le frontend et l'API
> étant sur le même domaine, ces appels restent same-origin.

---

## 6. Configurer Nginx + activer HTTPS

```bash
cd ~/musclemap

# 1) Installer la config (remplacer le domaine d'exemple par le tien AVANT)
sed -i 's/musclemap.exemple.com/musclemap.tondomaine.com/g' deploy/nginx.conf
sudo cp deploy/nginx.conf /etc/nginx/sites-available/musclemap
sudo ln -sf /etc/nginx/sites-available/musclemap /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default      # retirer la page par défaut

# 2) Dossier du challenge Certbot
sudo mkdir -p /var/www/certbot

# 3) Obtenir le certificat HTTPS (Certbot ajuste Nginx tout seul)
sudo certbot --nginx -d musclemap.tondomaine.com

# 4) Tester et recharger
sudo nginx -t && sudo systemctl reload nginx
```

> 💡 Si `certbot --nginx` se plaint des blocs SSL déjà présents dans le fichier, tu peux d'abord
> commenter les deux lignes `ssl_certificate*` du bloc 443 de `nginx.conf`, lancer Certbot (il les
> réécrit), puis recharger. Certbot installe aussi le **renouvellement automatique**.

---

## 7. Mettre à jour la console Google Cloud

Pour que « Sign in with Google » marche sur le nouveau domaine :
1. https://console.cloud.google.com/ → APIs & Services → **Credentials** → ton OAuth Client (Web).
2. **Authorized JavaScript origins** → ajouter `https://musclemap.tondomaine.com`.
3. Enregistrer (la propagation prend quelques minutes).

---

## 8. Vérification finale (de bout en bout)

- `https://musclemap.tondomaine.com` → l'app se charge en HTTPS (cadenas vert).
- `https://musclemap.tondomaine.com/api/v1/meta` → JSON de métadonnées.
- `https://musclemap.tondomaine.com/api/v1/catalog/exercises` → la liste des exercices (preuve que
  le mode en-ligne est actif et que la base est remplie).
- S'inscrire / se connecter (email + mot de passe), puis recharger : la session tient.
- « Sign in with Google » fonctionne.
- Créer puis terminer une séance → elle réapparaît après rechargement (donc bien stockée en base,
  plus dans le localStorage).

---

## 9. Exploitation courante

```bash
# Mettre à jour après un nouveau commit
cd ~/musclemap && git pull
docker compose -f docker-compose.prod.yml up -d --build          # backend
cd frontend && npm ci && VITE_API_BASE_URL="https://musclemap.tondomaine.com/api/v1" \
  VITE_GOOGLE_CLIENT_ID="<id>" npm run build && sudo cp -r dist/* /var/www/musclemap/

# Logs
docker compose -f docker-compose.prod.yml logs -f backend
sudo tail -f /var/log/nginx/error.log

# Sauvegarde de la base (à faire régulièrement)
docker exec musclemap-db pg_dump -U musclemap musclemap > backup_$(date +%F).sql

# Restauration
cat backup_AAAA-MM-JJ.sql | docker exec -i musclemap-db psql -U musclemap -d musclemap
```

---

## 10. Récapitulatif des spécifications & coûts

| Ressource | Démo | Recommandé |
|---|---|---|
| Taille Azure | B1ms (1 vCPU / 2 Go) | **B2s (2 vCPU / 4 Go)** |
| Disque | 30 Go SSD | 30–64 Go SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Ports publics | 22, 80, 443 | 22 (restreint), 80, 443 |
| Domaine | requis (HTTPS + Google) | requis |

> **Render vs VM Azure :** les deux hébergent le **même** backend (la même image Docker). Render =
> zéro administration, mais le free tier s'endort. La VM Azure = contrôle total et frontend+backend
> sur un seul domaine, mais c'est toi qui administres (mises à jour, sauvegardes, certificat). Tu
> peux faire les deux : Render pour une démo rapide, la VM pour la version « propre ».
