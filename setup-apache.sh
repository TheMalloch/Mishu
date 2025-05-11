#!/bin/bash

# Script pour configurer Apache automatiquement
# Ce script configure Apache pour utiliser les fichiers de configuration du CV interactif

echo "Configuration d'Apache pour le CV interactif..."

# Activer les modules nécessaires
echo "Activation des modules Apache nécessaires..."
sudo a2enmod deflate
sudo a2enmod headers
sudo a2enmod proxy
sudo a2enmod proxy_http

# Copier les fichiers de configuration
echo "Copie des fichiers de configuration..."
sudo cp /home/mishu/mishu/apache-config/gzip.conf /etc/apache2/conf-available/
sudo cp /home/mishu/mishu/apache-config/cv-interactif.conf /etc/apache2/sites-available/

# Activer les configurations
echo "Activation des configurations..."
sudo a2enconf gzip
sudo a2ensite cv-interactif

# Redémarrer Apache pour appliquer les changements
echo "Redémarrage d'Apache..."
sudo systemctl restart apache2

# Configurer le service backend FastAPI
echo "Configuration du service backend FastAPI..."
sudo cp /home/mishu/mishu/cv-interactif-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable cv-interactif-backend.service
sudo systemctl start cv-interactif-backend.service

echo "Configuration d'Apache terminée avec succès !"
echo "Vous pouvez maintenant accéder au CV interactif à l'adresse http://localhost:8080"
