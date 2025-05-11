#!/bin/bash

# Script de démarrage pour le CV interactif
# Ce script démarre le backend FastAPI et configure Apache

echo "Démarrage du CV interactif de Hamza Menkor..."

# Vérifier si Apache est en cours d'exécution
if ! systemctl is-active --quiet apache2; then
    echo "Démarrage d'Apache..."
    sudo systemctl start apache2
else
    echo "Apache est déjà en cours d'exécution."
fi

# Activer la compression gzip pour Apache si ce n'est pas déjà fait
if ! grep -q "deflate" /etc/apache2/mods-enabled/deflate.conf 2>/dev/null; then
    echo "Configuration de la compression gzip pour Apache..."
    sudo a2enmod deflate
    sudo systemctl reload apache2
fi

# Vérifier si le service backend est en cours d'exécution
if ! systemctl is-active --quiet cv-interactif-backend.service; then
    echo "Démarrage du backend FastAPI..."
    sudo systemctl start cv-interactif-backend.service
else
    echo "Le backend FastAPI est déjà en cours d'exécution."
fi

echo ""
echo "CV interactif démarré avec succès !"
echo "Vous pouvez y accéder aux adresses suivantes :"
echo "- HTTP: http://localhost:8080"
echo "- HTTPS: https://localhost:8443 (certificat auto-signé)"
echo ""
echo "API Docker accessible à : http://localhost:8080/api/"
echo ""

# Fonction pour arrêter proprement les services
function cleanup {
    echo "Arrêt des services..."
    sudo systemctl stop cv-interactif-backend.service
    sudo systemctl stop apache2
    echo "Services arrêtés."
    exit 0
}

# Capture Ctrl+C pour arrêter proprement
trap cleanup SIGINT

# Attendre que l'utilisateur arrête le script
echo "Appuyez sur Ctrl+C pour arrêter les services"
sleep infinity
