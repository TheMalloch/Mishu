#!/bin/bash

# Script de vérification et de préparation pour le conteneur Mini Shell
# Ce script vérifie que tout est en place pour lancer correctement le conteneur

echo "Vérification et préparation du système pour le conteneur Mini Shell..."

# Vérifier que Docker est installé et en cours d'exécution
if ! command -v docker &> /dev/null; then
    echo "Docker n'est pas installé. Installation..."
    sudo apt-get update
    sudo apt-get install -y docker.io
    sudo systemctl enable docker
    sudo systemctl start docker
else
    echo "Docker est déjà installé."
fi

# Vérifier que le service Docker est en cours d'exécution
if ! systemctl is-active --quiet docker; then
    echo "Le service Docker n'est pas en cours d'exécution. Démarrage..."
    sudo systemctl start docker
else
    echo "Le service Docker est en cours d'exécution."
fi

# Vérifier que l'utilisateur courant est dans le groupe docker
if ! groups | grep -q '\bdocker\b'; then
    echo "L'utilisateur courant n'est pas dans le groupe docker. Ajout..."
    sudo usermod -aG docker $USER
    echo "Vous devrez vous déconnecter et vous reconnecter pour que ce changement prenne effet."
fi

# Vérifier que le dossier Mini_shell existe
if [ ! -d "/home/mishu/mishu/projects/Mini_shell" ]; then
    echo "ERREUR: Le dossier Mini_shell n'existe pas à l'emplacement attendu."
    exit 1
fi

# Vérifier que le Dockerfile existe
if [ ! -f "/home/mishu/mishu/projects/Mini_shell/Dockerfile" ]; then
    echo "ERREUR: Le Dockerfile pour Mini_shell n'existe pas."
    exit 1
fi

# Tester la construction de l'image
echo "Construction de l'image Mini Shell..."
cd /home/mishu/mishu/projects/Mini_shell
docker build -t mishu_minishell:latest .

# Vérifier que l'image a été construite avec succès
if ! docker images | grep -q 'mishu_minishell'; then
    echo "ERREUR: La construction de l'image a échoué."
    exit 1
fi

echo "Image Mini Shell construite avec succès!"

# Informations sur l'exécution du backend FastAPI
echo "Assurez-vous que le backend FastAPI est en cours d'exécution:"
echo "cd /home/mishu/mishu/backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

echo ""
echo "Tout est prêt pour lancer le conteneur Mini Shell!"
echo "Vous pouvez maintenant cliquer sur le bouton 'Lancer la démo' dans l'interface web."
