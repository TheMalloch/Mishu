/**
 * Mise à jour des fonctions d'affichage des logs Docker
 * Ce fichier contient des fonctions améliorées pour l'affichage des logs Docker
 */

/**
 * Formatte les logs en mettant en évidence les commandes et les erreurs
 * @param {string} logs Logs bruts
 * @returns {string} Logs formatés avec HTML
 */
function formatLogsWithHTML(logs) {
    if (!logs) return '';
    
    // Échapper les caractères HTML
    const escapeHTML = (str) => str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    
    const escapedLogs = escapeHTML(logs);
    
    // Traiter ligne par ligne
    return escapedLogs.split('\n').map(line => {
        // Mettre en évidence les commandes
        if (line.startsWith('&gt;') || line.includes('$') || line.includes('#')) {
            return `<span class="log-command">${line}</span>`;
        }
        // Mettre en évidence les erreurs
        else if (line.toLowerCase().includes('error') || line.toLowerCase().includes('erreur')) {
            return `<span class="log-error">${line}</span>`;
        }
        // Mettre en évidence les messages de succès
        else if (line.toLowerCase().includes('success') || line.toLowerCase().includes('réussi')) {
            return `<span class="log-success">${line}</span>`;
        }
        return line;
    }).join('\n');
}

/**
 * Intercepte la fonction originale updateContainerLogs pour appliquer le formatage HTML
 */
const originalUpdateContainerLogs = updateContainerLogs;
updateContainerLogs = async function(containerId = activeContainerId) {
    if (!activeContainerId || containerStatus !== 'running') return;
    
    try {
        // Récupérer plus de lignes de logs pour une meilleure expérience
        const response = await dockerClient.getContainerLogs(containerId, 50);
        
        if (response.success) {
            const terminal = document.getElementById('docker-terminal');
            const logs = response.data.logs;
            
            if (logs.trim() === '') {
                // Si pas de logs, afficher un message d'aide stylisé
                terminal.innerHTML = `
                    <div class="terminal-help">
                        <div class="terminal-help-icon">🔍</div>
                        <div class="terminal-help-text">
                            <p>En attente des logs...</p>
                            <p>Vous pouvez interagir avec le Mini Shell en utilisant ces commandes:</p>
                            <ul>
                                <li><code>ls</code> - Lister les fichiers</li>
                                <li><code>cd</code> - Changer de répertoire</li>
                                <li><code>echo</code> - Afficher un texte</li>
                                <li><code>cat</code> - Afficher un fichier</li>
                                <li><code>exit</code> - Quitter le shell</li>
                            </ul>
                        </div>
                    </div>
                `;
            } else {
                // Formater les logs avec HTML pour la mise en évidence
                terminal.innerHTML = formatLogsWithHTML(logs);
            }
            
            // Faire défiler vers le bas
            terminal.scrollTop = terminal.scrollHeight;
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour des logs:', error);
    }
};

/**
 * Amélioration de la fonction viewContainerLogs pour utiliser le formatage HTML
 */
const originalViewContainerLogs = viewContainerLogs;
viewContainerLogs = async function() {
    if (!activeContainerId) return;
    
    // Afficher la fenêtre modale
    document.getElementById('logs-modal').classList.add('modal-visible');
    document.getElementById('modal-logs').innerHTML = '<div class="docker-preload"><div class="docker-preload-spinner"></div><p>Chargement des logs...</p></div>';
    
    try {
        // Récupérer plus de logs (200 lignes) pour une vue détaillée
        const response = await dockerClient.getContainerLogs(activeContainerId, 200);
        
        if (response.success) {
            const logs = response.data.logs;
            if (logs && logs.trim() !== '') {
                document.getElementById('modal-logs').innerHTML = formatLogsWithHTML(logs);
            } else {
                document.getElementById('modal-logs').innerHTML = '<div class="terminal-help"><div class="terminal-help-icon">ℹ️</div><div class="terminal-help-text">Aucun log disponible pour le moment.</div></div>';
            }
        } else {
            document.getElementById('modal-logs').innerHTML = `<div class="log-error">Erreur: ${response.message}</div>`;
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des logs:', error);
        document.getElementById('modal-logs').innerHTML = '<div class="log-error">Erreur de connexion au serveur</div>';
    }
};
