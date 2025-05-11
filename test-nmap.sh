#!/bin/bash

# Script pour tester l'efficacité des mesures de protection contre nmap
# Ce script simule un scan nmap et vérifie si les services sont visibles

echo "Test de sécurité des services contre les scans nmap"
echo "=================================================="
echo ""

# Vérifier si nmap est installé
if ! command -v nmap &> /dev/null; then
    echo "nmap n'est pas installé. Installation en cours..."
    sudo apt-get update && sudo apt-get install -y nmap
fi

echo "Exécution d'un scan nmap standard (comme un attaquant le ferait)..."
echo ""
nmap -sV localhost

echo ""
echo "Exécution d'un scan de détection de pare-feu..."
echo ""
nmap -sA localhost

echo ""
echo "Exécution d'un scan furtif..."
echo ""
sudo nmap -sS localhost

echo ""
echo "=================================================="
echo "Test terminé. Analyse des résultats :"
echo ""
echo "Si les services (Apache, FastAPI) sont correctement masqués, ils ne devraient pas"
echo "apparaître dans les résultats ci-dessus ou devraient apparaître comme 'filtered'."
echo ""
echo "Port 8000 (API) : Devrait être filtered/closed"
echo "Port 8080 (Web) : Devrait être filtered/closed"
echo ""
echo "S'ils sont visibles, exécutez le script secure-services.sh pour renforcer la protection."
