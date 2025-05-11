# CV Interactif - Hamza Menkor

Ce projet est un CV interactif mettant en valeur les compétences, projets et expériences de Hamza Menkor. Il comprend une fonctionnalité innovante permettant de lancer un conteneur Docker du projet Mini Shell directement depuis le site web.

## 🚀 Fonctionnalités principales

- ✅ Interface utilisateur moderne et interactive
- ✅ Présentation de projets avec démonstrations
- ✅ Démonstration du Mini Shell via Docker directement dans le navigateur
- ✅ Mode hors ligne avec Service Worker
- ✅ Optimisation des performances (chargement différé, compression, etc.)
- ✅ API sécurisée pour les opérations Docker
- ✅ Configuration Apache avec proxy pour le backend

## 🗂️ Structure du projet

```
cv-interactif/               # Interface utilisateur du CV
├── index.html               # Page principale
├── service-worker.js        # Cache et fonctionnalités hors ligne
├── css/                     # Styles et mise en page
├── js/                      # Scripts JavaScript
│   ├── content-loader.js    # Chargement dynamique du contenu
│   ├── docker-api.js        # Interface avec l'API Docker
│   ├── docker-ui.js         # Interface utilisateur pour Docker
│   ├── docker-logs.js       # Formatage amélioré des logs Docker
│   └── optimization.js      # Optimisations de performance
└── images/                  # Ressources visuelles

backend/                     # API et gestion Docker
├── docker_control.py        # Contrôle des containers Docker
├── main.py                  # API FastAPI
├── models.py                # Modèles de données
└── requirements.txt         # Dépendances Python

projects/                    # Projets démontrés
└── Mini_shell/              # Code source du Mini Shell

start.sh                     # Script de démarrage de l'application
```

## 📋 Prérequis

- Python 3.9+
- Docker
- Apache2
- Navigateur moderne

## 🛠️ Installation

1. Cloner le dépôt :
   ```bash
   git clone https://github.com/hmenkor/cv-interactif.git
   cd cv-interactif
   ```

2. Installer les dépendances Python pour le backend :
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Configurer Apache :
   ```bash
   sudo cp apache-config/cv-interactif.conf /etc/apache2/sites-available/
   sudo a2enmod proxy proxy_http ssl
   sudo a2ensite cv-interactif
   sudo systemctl reload apache2
   ```

4. Configurer le service systemd pour le backend :
   ```bash
   sudo cp cv-interactif-backend.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable cv-interactif-backend.service
   ```

## 🚀 Démarrage

Utilisez le script de démarrage qui lance tous les services nécessaires :

```bash
./start.sh
```

Accédez ensuite à l'application via:
- HTTP: http://localhost:8080
- HTTPS: https://localhost:8443 (certificat auto-signé)

## 🔒 Sécurité

Ce projet inclut plusieurs mesures de sécurité :
- Authentification pour les opérations Docker sensibles
- Vérification de l'origine des images Docker
- Limitation des permissions des conteneurs Docker
- Connexions HTTPS avec SSL
- Proxy Apache pour protéger le backend

## 📊 Performance

Le CV interactif est optimisé pour de meilleures performances :
- Service Worker pour le mode hors ligne
- Chargement différé des images
- Préchargement des ressources importantes
- Compression gzip via Apache
- Surveillance des métriques de performance

## 📝 Documentation

Pour plus d'informations sur l'utilisation du CV interactif, consultez les fichiers:
- [INSTRUCTIONS.md](./INSTRUCTIONS.md) - Guide d'utilisation détaillé
- [CV-INTERACTIF-README.md](./CV-INTERACTIF-README.md) - Documentation spécifique au CV

## 👨‍💻 Auteur

Hamza Menkor - hamza.menkor@proton.me
