# CV Interactif - Hamza Menkor

Ce projet est un CV interactif qui met en valeur les compétences, projets et expériences de Hamza Menkor. Il inclut une fonctionnalité permettant de lancer un conteneur Docker du projet Mini Shell directement depuis le site web.

## Architecture du projet

Le projet est divisé en deux parties principales :

1. **Frontend (cv-interactif)** :
   - Interface utilisateur en HTML/CSS/JavaScript
   - Présentation du profil, de la formation, des projets et des compétences
   - Interface Docker pour interagir avec les conteneurs

2. **Backend (backend)** :
   - API FastAPI pour gérer les conteneurs Docker
   - Module de contrôle Docker (docker_control.py)
   - Endpoints API pour lancer, arrêter et supprimer des conteneurs

## Prérequis

- Docker
- Python 3.8+
- Apache2

## Installation et Démarrage

1. Cloner le dépôt :
   ```bash
   git clone https://github.com/hmenkor/cv-interactif.git
   cd cv-interactif
   ```

2. Lancer le script de démarrage :
   ```bash
   ./start.sh
   ```

3. Accéder au CV interactif :
   - HTTP : http://localhost:8080
   - HTTPS : https://localhost:8443 (certificat auto-signé)

## Fonctionnalités

- **CV Interactif** : Présentation interactive du profil, de la formation et des compétences
- **Interface Docker** : Interface pour lancer, arrêter et supprimer des conteneurs Docker
- **Projet Mini Shell** : Démonstration du projet Mini Shell directement dans le navigateur
- **Terminal Interactif** : Affichage des logs du conteneur en temps réel

## Configuration Apache

Le site est configuré pour fonctionner avec Apache comme serveur web. Les configurations se trouvent dans :
- `/etc/apache2/sites-available/cv-interactif.conf` (HTTP)
- `/etc/apache2/sites-available/cv-interactif-ssl.conf` (HTTPS)

Apache est configuré pour :
- Servir les fichiers statiques du frontend
- Rediriger les requêtes `/api/` vers le backend FastAPI

## Développement

Pour contribuer au projet :

1. Modifier les fichiers HTML/CSS/JS dans le dossier `cv-interactif`
2. Modifier l'API FastAPI dans le dossier `backend`
3. Relancer le script `start.sh` pour appliquer les modifications

## Projet Mini Shell

Le CV interactif permet d'exécuter le projet Mini Shell dans un conteneur Docker. Le Mini Shell est un interpréteur de commandes UNIX minimaliste implémenté en C avec les fonctionnalités suivantes :

- Exécution de commandes système
- Gestion des variables d'environnement
- Support de redirections d'entrée/sortie
- Historique de commandes
- Gestion des alias
- Restrictions d'accès par utilisateur

## Auteur

- Hamza Menkor - hamza.menkor@proton.me
