# Guide d'utilisation du CV Interactif

Ce guide explique comment utiliser le CV interactif et comment tester les fonctionnalités Docker intégrées.

## Lancement du CV interactif

1. Assurez-vous que les services sont démarrés en exécutant :
   ```bash
   ./start.sh
   ```

2. Accédez au CV interactif via votre navigateur :
   - **HTTP** : [http://localhost:8080](http://localhost:8080)
   - **HTTPS** : [https://localhost:8443](https://localhost:8443) (vous devrez accepter le certificat auto-signé)

## Navigation dans le CV

Le CV interactif comporte plusieurs sections accessibles via le menu latéral :

- **Accueil** : Présentation générale du profil
- **Formation** : Parcours académique et certifications
- **Projets** : Portfolio des projets techniques
- **Docker Hub** : Images Docker disponibles
- **Compétences** : Compétences techniques et linguistiques
- **Contact** : Formulaire et coordonnées de contact

## Test du Mini Shell Docker

1. Cliquez sur **Projets** dans le menu latéral
2. Trouvez le projet **Mini Shell**
3. Cliquez sur le bouton **Lancer la démo**
4. Utilisez les contrôles du terminal Docker :
   - **Démarrer** : Lance un conteneur Mini Shell
   - **Arrêter** : Arrête le conteneur en cours d'exécution
   - **Logs** : Affiche les logs du conteneur
   - **Supprimer** : Supprime le conteneur

## Résolution de problèmes

Si vous rencontrez des difficultés :

1. **Le terminal Docker ne démarre pas** :
   - Vérifiez que Docker est installé et fonctionne correctement
   - Vérifiez que l'image `mishu_minishell:latest` existe (sinon, exécutez `cd /home/mishu/mishu/projects/Mini_shell && docker build -t mishu_minishell:latest .`)

2. **La page ne s'affiche pas correctement** :
   - Vérifiez que Apache est en cours d'exécution (`sudo systemctl status apache2`)
   - Vérifiez que le backend FastAPI est en cours d'exécution (`sudo systemctl status cv-interactif-backend.service`)

3. **Les requêtes API échouent** :
   - Vérifiez que l'API est accessible (`curl http://localhost:8080/api/`)
   - Vérifiez les logs du backend (`sudo journalctl -u cv-interactif-backend.service -f`)

## Arrêt des services

Pour arrêter tous les services, vous pouvez utiliser `Ctrl+C` dans le terminal où `start.sh` est en cours d'exécution, ou exécuter :

```bash
sudo systemctl stop cv-interactif-backend.service
sudo systemctl stop apache2
```
