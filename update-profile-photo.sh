#!/bin/bash

# Script pour nettoyer le cache et forcer le chargement de la nouvelle photo de profil
# Ce script supprime l'ancienne photo, force la mise à jour du cache et redémarre le serveur

echo "Nettoyage du cache et mise à jour de la photo de profil..."

# Arrêter le serveur HTTP si en cours d'exécution
pkill -f "python3 -m http.server 8888" || true

# Supprimer l'ancienne photo pour éviter toute confusion
if [ -f "/home/mishu/mishu/cv-interactif/images/profile.jpg" ]; then
    echo "Suppression de l'ancienne photo..."
    rm -f /home/mishu/mishu/cv-interactif/images/profile.jpg
fi

# S'assurer que la nouvelle photo a les bonnes permissions
echo "Vérification des permissions de la nouvelle photo..."
chmod 644 /home/mishu/mishu/cv-interactif/images/profile_new.jpg

# Vider le cache du navigateur (ne fonctionne que si le navigateur est ouvert et le site chargé)
echo "Ajout d'une instruction pour vider le cache dans le HTML..."
cat > /tmp/cache-cleaner.html << EOF
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Vidage du cache...</title>
    <script>
        window.onload = function() {
            // Vider les caches
            if ('caches' in window) {
                caches.keys().then(function(cacheNames) {
                    cacheNames.forEach(function(cacheName) {
                        caches.delete(cacheName);
                    });
                });
            }
            
            // Rediriger vers la page d'accueil après 2 secondes
            setTimeout(function() {
                window.location.href = '/';
            }, 2000);
        }
    </script>
</head>
<body>
    <h1>Nettoyage du cache...</h1>
    <p>Veuillez patienter pendant que nous mettons à jour votre affichage.</p>
</body>
</html>
EOF

cp /tmp/cache-cleaner.html /home/mishu/mishu/cv-interactif/clear-cache.html

# Mettre à jour le numéro de version dans le service worker
echo "Mise à jour du service worker..."
sed -i 's/cv-interactif-cache-v[0-9]/cv-interactif-cache-v4/g' /home/mishu/mishu/cv-interactif/service-worker.js

# Relancer le serveur
echo "Redémarrage du serveur HTTP..."
cd /home/mishu/mishu/cv-interactif && python3 -m http.server 8888 &

echo ""
echo "Terminé! La photo de profil a été mise à jour."
echo "Pour voir les changements, ouvrez http://localhost:8888/clear-cache.html dans votre navigateur."
echo "Cela videra le cache et vous redirigera vers la page d'accueil avec la nouvelle photo."
