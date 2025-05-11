/**
 * Gestion de la navigation entre les différentes pages du CV
 */

let navHistory = [];
let currentPage = 'home';

/**
 * Initialise les fonctionnalités de navigation
 */
function initNavigation() {
    // Sélectionner tous les éléments de navigation
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    
    // Ajouter des écouteurs d'événements à chaque élément
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const pageId = this.getAttribute('data-page');
            navigateTo(pageId);
        });
    });
    
    // Initialiser le bouton de retour
    document.getElementById('back-btn').addEventListener('click', navigateBack);
}

/**
 * Navigue vers une page spécifique
 * @param {string} pageId - L'identifiant de la page
 */
function navigateTo(pageId) {
    // Si on est déjà sur cette page, ne rien faire
    if (pageId === currentPage) return;
    
    // Ajouter la page actuelle à l'historique
    navHistory.push(currentPage);
    
    // Mettre à jour la page active
    setActivePage(pageId);
}

/**
 * Revenir à la page précédente
 */
function navigateBack() {
    // S'il n'y a pas d'historique, ne rien faire
    if (navHistory.length === 0) return;
    
    // Récupérer la dernière page de l'historique
    const previousPage = navHistory.pop();
    
    // Naviguer vers cette page sans l'ajouter à l'historique
    setActivePage(previousPage, false);
}

/**
 * Définit la page active et met à jour l'interface
 * @param {string} pageId - L'identifiant de la page
 * @param {boolean} updateCurrent - Indique s'il faut mettre à jour la page courante
 */
function setActivePage(pageId, updateCurrent = true) {
    // Mettre à jour la navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('data-page') === pageId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Masquer toutes les pages
    document.querySelectorAll('.content-page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Afficher la page demandée
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
        targetPage.classList.add('active', 'fade-in');
        
        // Faire défiler vers le haut
        targetPage.scrollTop = 0;
    }
    
    // Mettre à jour la page courante si nécessaire
    if (updateCurrent) {
        currentPage = pageId;
    }
}
