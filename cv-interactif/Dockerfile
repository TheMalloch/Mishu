FROM nginx:alpine

# Copier les fichiers statiques
COPY . /usr/share/nginx/html/

# Exposer le port 80
EXPOSE 80

# Commande par défaut
CMD ["nginx", "-g", "daemon off;"]
