/**
 * Script d'optimisation pour le CV interactif
 * Ajoute des fonctionnalités d'optimisation des performances
 */

/**
 * Optimisation du chargement des images
 * Ajoute les attributs loading="lazy" et fetchpriority aux images
 */
function optimizeImages() {
    // Sélectionner toutes les images
    const images = document.querySelectorAll('img');
    
    // Pour chaque image
    images.forEach((img, index) => {
        // Si l'image n'a pas déjà l'attribut loading
        if (!img.hasAttribute('loading')) {
            // Ajouter l'attribut loading="lazy" sauf pour les 3 premières images
            img.setAttribute('loading', index < 3 ? 'eager' : 'lazy');
        }
        
        // Ajouter l'attribut fetchpriority pour les images importantes
        if (index < 3 && !img.hasAttribute('fetchpriority')) {
            img.setAttribute('fetchpriority', 'high');
        }
        
        // Ajouter l'attribut decoding pour optimiser le rendu
        if (!img.hasAttribute('decoding')) {
            img.setAttribute('decoding', 'async');
        }
    });
}

/**
 * Précharge les ressources importantes
 */
function preloadResources() {
    // Précharger les pages qui seront probablement visitées
    const pagesToPreload = ['home', 'projects', 'docker'];
    pagesToPreload.forEach(page => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = `#${page}-page`;
        document.head.appendChild(link);
    });
}

/**
 * Optimise l'affichage dans la page Docker
 * Corrige les erreurs de formatage dans la page Docker
 */
function optimizeDockerPage() {
    const dockerPage = document.getElementById('docker-page');
    
    if (dockerPage) {
        // Rechercher et corriger le texte "bb" dans la page
        const content = dockerPage.innerHTML;
        if (content.includes('<div class="project-card">bb')) {
            dockerPage.innerHTML = content.replace('<div class="project-card">bb', '<div class="project-card">');
        }
        
        // Ajouter lazy loading aux images Docker
        const dockerImages = dockerPage.querySelectorAll('img');
        dockerImages.forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
                img.setAttribute('decoding', 'async');
            }
        });
    }
}

/**
 * Corrige le formatage HTML des conteneurs Docker
 */
function fixDockerContainers() {
    // Rechercher tous les conteneurs de projet
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        // Vérifier si le contenu du card contient "bb"
        if (card.textContent.includes('bb')) {
            // Obtenir le HTML actuel et le nettoyer
            const html = card.outerHTML;
            const fixedHtml = html.replace('>bb', '>');
            
            // Remplacer par le HTML corrigé
            card.outerHTML = fixedHtml;
        }
    });
}

/**
 * Surveille les performances de la page
 * Collecte et affiche les métriques de performance
 */
function monitorPerformance() {
    // Vérifier si l'API Performance est disponible
    if (typeof performance === 'undefined') return;

    // Observer les changements de page pour mesurer les performances
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            // Ne logguer que les métriques importantes
            if (['largest-contentful-paint', 'first-input-delay', 'cumulative-layout-shift'].includes(entry.name)) {
                console.log(`Métrique de performance: ${entry.name} = ${entry.value}`);
            }
        }
    });

    // Observer différents types de métriques
    observer.observe({ entryTypes: ['paint', 'layout-shift', 'first-input', 'navigation'] });

    // Mesurer le temps de chargement initial
    window.addEventListener('load', () => {
        setTimeout(() => {
            const pageLoadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`Temps de chargement de la page: ${pageLoadTime}ms`);
            
            // Rapport de performance
            reportPerformance({
                loadTime: pageLoadTime,
                domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
                resourceCount: performance.getEntriesByType('resource').length
            });
        }, 0);
    });
}

/**
 * Rapporte les métriques de performance au serveur (simulé)
 * @param {Object} metrics Métriques de performance
 */
function reportPerformance(metrics) {
    // Simuler l'envoi des métriques au serveur (en production, remplacer par un appel fetch)
    console.log('Rapport de performance:', metrics);
    
    // Afficher un avertissement si le temps de chargement est élevé
    if (metrics.loadTime > 3000) {
        console.warn('Le temps de chargement est élevé. Considérez optimiser davantage les ressources.');
    }
}

/**
 * Fonction principale d'optimisation
 */
function optimizeAll() {
    // Optimiser les images
    optimizeImages();
    
    // Précharger les ressources
    preloadResources();
    
    // Optimiser la page Docker
    optimizeDockerPage();
    
    // Corriger les conteneurs Docker
    fixDockerContainers();
    
    // Surveiller les performances
    monitorPerformance();
    
    console.log('Optimisations appliquées avec succès');
}

// Lancer les optimisations après le chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Lancer une première fois
    setTimeout(optimizeAll, 100);
    
    // Ajouter un event listener pour les changements de page
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            // Optimiser après chaque changement de page
            setTimeout(optimizeAll, 100);
        });
    });
});
