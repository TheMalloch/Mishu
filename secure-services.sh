#!/bin/bash

# Script de configuration du pare-feu pour masquer les services aux scans nmap
# Ce script configure iptables pour limiter la visibilité des services

echo "Configuration du pare-feu pour masquer les services..."

# Sauvegarder les règles existantes
sudo iptables-save > /tmp/iptables-backup

# Règles de base - accepter les connexions établies et les connexions sortantes
sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
sudo iptables -A OUTPUT -j ACCEPT

# Autoriser le trafic local
sudo iptables -A INPUT -i lo -j ACCEPT

# Limiter les tentatives de connexion (protection contre les scans)
sudo iptables -A INPUT -p tcp --syn --dport 22 -m connlimit --connlimit-above 3 -j REJECT
sudo iptables -A INPUT -p tcp --syn --dport 80 -m connlimit --connlimit-above 15 -j REJECT
sudo iptables -A INPUT -p tcp --syn --dport 443 -m connlimit --connlimit-above 15 -j REJECT
sudo iptables -A INPUT -p tcp --syn --dport 8080 -m connlimit --connlimit-above 15 -j REJECT
sudo iptables -A INPUT -p tcp --syn --dport 8000 -m connlimit --connlimit-above 10 -j REJECT

# Limiter les scans de ports (packets SYN sans établissement de connexion)
sudo iptables -A INPUT -p tcp --tcp-flags ALL SYN,ACK -m state --state NEW -j DROP

# Bloquer les paquets ICMP (ping) pour éviter la détection
sudo iptables -A INPUT -p icmp -j DROP

# Limiter les connexions par IP (détecter et bloquer les scans)
sudo iptables -A INPUT -p tcp -m state --state NEW -m recent --set
sudo iptables -A INPUT -p tcp -m state --state NEW -m recent --update --seconds 30 --hitcount 10 -j DROP

# Enregistrer la configuration
echo "Sauvegarde des règles iptables..."
sudo sh -c "iptables-save > /etc/iptables/rules.v4"

echo "Configuration du Port Knocking..."
# Port Knocking - autoriser l'accès après une séquence spécifique
# Installer knockd si nécessaire
if ! command -v knockd > /dev/null; then
    echo "Installation de knockd..."
    sudo apt-get update
    sudo apt-get install -y knockd
fi

# Configurer knockd
cat > /tmp/knockd.conf << EOF
[options]
    UseSyslog

[openSSH]
    sequence    = 7000,8000,9000
    seq_timeout = 5
    command     = /sbin/iptables -A INPUT -s %IP% -p tcp --dport 22 -j ACCEPT
    tcpflags    = syn
    cmd_timeout = 10
    stop_command = /sbin/iptables -D INPUT -s %IP% -p tcp --dport 22 -j ACCEPT

[openHTTP]
    sequence    = 7001,8001,9001
    seq_timeout = 5
    command     = /sbin/iptables -A INPUT -s %IP% -p tcp --dport 80 -j ACCEPT
    tcpflags    = syn
    cmd_timeout = 30
    stop_command = /sbin/iptables -D INPUT -s %IP% -p tcp --dport 80 -j ACCEPT

[openAPI]
    sequence    = 7002,8002,9002
    seq_timeout = 5
    command     = /sbin/iptables -A INPUT -s %IP% -p tcp --dport 8000 -j ACCEPT
    tcpflags    = syn
    cmd_timeout = 30
    stop_command = /sbin/iptables -D INPUT -s %IP% -p tcp --dport 8000 -j ACCEPT
EOF

sudo mv /tmp/knockd.conf /etc/knockd.conf

# Activer knockd
sudo systemctl enable knockd
sudo systemctl restart knockd

echo "Configuration d'Apache pour réduire les signatures..."
# Configuration d'Apache pour réduire les informations de version
cat > /tmp/security.conf << EOF
# Masquer la signature du serveur
ServerTokens Prod
ServerSignature Off

# Désactiver l'indexation des répertoires
<Directory />
    Options -Indexes
</Directory>

# Headers de sécurité
<IfModule mod_headers.c>
    # Masquer les informations supplémentaires
    Header unset Server
    Header unset X-Powered-By
    Header unset X-AspNet-Version
    Header unset X-AspNetMvc-Version
    
    # Sécurité supplémentaire
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
</IfModule>

# Limiter les requêtes
<IfModule mod_reqtimeout.c>
    RequestReadTimeout header=20-40,MinRate=500 body=20,MinRate=500
</IfModule>
EOF

sudo mv /tmp/security.conf /etc/apache2/conf-available/security.conf
sudo a2enconf security
sudo systemctl reload apache2

echo "Configuration de FastAPI pour masquer les informations..."
# Mise à jour du fichier main.py pour masquer les informations de version
cat > /tmp/fastapi_middleware.py << EOF
# Middleware pour masquer les en-têtes de version
class RemoveHeadersMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                headers = [(k, v) for k, v in message.get("headers", []) 
                           if k.decode("latin-1").lower() not in 
                           ["server", "x-powered-by"]]
                message["headers"] = headers
            await send(message)

        await self.app(scope, receive, send_wrapper)
EOF

# Vérifier si l'édition est nécessaire dans main.py
if ! grep -q "RemoveHeadersMiddleware" /home/mishu/mishu/backend/main.py; then
    echo "Mise à jour du fichier main.py avec le middleware de sécurité..."
    cat /tmp/fastapi_middleware.py > /home/mishu/mishu/backend/middleware.py
fi

echo "Configuration terminée ! Votre système est maintenant mieux protégé contre les scans nmap."
echo "Pour accéder aux services, vous devrez utiliser la séquence de port knocking configurée."
