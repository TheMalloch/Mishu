/**
 * Fichier JavaScript principal
 * Gère l'initialisation des fonctionnalités et l'interactivité générale
 */

document.addEventListener('DOMContentLoaded', function() {
    // Forcer le rechargement des ressources (éviter les problèmes de cache)
    if ('serviceWorker' in navigator) {
        caches.keys().then(function(cacheNames) {
            cacheNames.forEach(function(cacheName) {
                if (cacheName.startsWith('cv-interactif-cache')) {
                    console.log('Mise à jour du cache:', cacheName);
                    caches.open(cacheName).then(function(cache) {
                        cache.add('images/profile_new.jpg?v=' + Date.now());
                    });
                }
            });
        });
    }
    
    // Initialiser le chargement de contenu
    loadAllContent();
    
    // Initialiser la navigation
    initNavigation();
    
    // Initialiser la recherche
    initSearch();
    
    // Initialiser les liens externes
    initExternalLinks();
});

/**
 * Initialise la fonctionnalité de recherche
 */
function initSearch() {
    const searchBar = document.querySelector('.search-bar');
    
    searchBar.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = searchBar.value.toLowerCase().trim();
            if (searchTerm) {
                searchContent(searchTerm);
            }
        }
    });
}

/**
 * Recherche dans le contenu du CV
 * @param {string} term - Le terme de recherche
 */
function searchContent(term) {
    const allContentElements = document.querySelectorAll('.content-page p, .content-page h3, .content-page li, .content-page div');
    let results = [];
    
    // Réinitialiser les surlignages précédents
    document.querySelectorAll('.highlight').forEach(el => {
        el.classList.remove('highlight');
    });
    
    // Rechercher dans tous les éléments
    allContentElements.forEach(element => {
        const content = element.textContent.toLowerCase();
        if (content.includes(term)) {
            element.classList.add('highlight');
            results.push(element);
        }
    });
    
    // Faire défiler vers le premier résultat si trouvé
    if (results.length > 0) {
        results[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Afficher un message de résultats
        showSearchMessage(`${results.length} résultat(s) trouvé(s)`);
    } else {
        showSearchMessage('Aucun résultat trouvé');
    }
}

/**
 * Affiche un message temporaire pour les résultats de recherche
 * @param {string} message - Le message à afficher
 */
function showSearchMessage(message) {
    // Créer ou réutiliser l'élément de message
    let messageEl = document.getElementById('search-message');
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.id = 'search-message';
        messageEl.style.position = 'fixed';
        messageEl.style.top = '20px';
        messageEl.style.right = '20px';
        messageEl.style.padding = '10px 15px';
        messageEl.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        messageEl.style.color = 'white';
        messageEl.style.borderRadius = '4px';
        messageEl.style.zIndex = '1000';
        document.body.appendChild(messageEl);
    }
    
    // Afficher le message
    messageEl.textContent = message;
    messageEl.style.display = 'block';
    
    // Masquer après 3 secondes
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 3000);
}

/**
 * Initialise les liens externes (téléchargement CV, LinkedIn)
 */
function initExternalLinks() {
    // Lien de téléchargement du CV
    document.getElementById('download-cv').addEventListener('click', function() {
        // Simuler un téléchargement (à remplacer par le lien réel du CV)
        alert('Téléchargement du CV en PDF');
        // Peut être remplacé par: window.open('path/to/cv.pdf', '_blank');
    });
    
    // Lien LinkedIn
    document.getElementById('linkedin').addEventListener('click', function() {
        // Ouvrir LinkedIn dans un nouvel onglet (à remplacer par le lien réel)
        window.open('https://www.linkedin.com/in/hamza-menkor/', '_blank');
    });
}
