/**
 * Module de gestion de l'interface utilisateur pour Docker
 * Ce fichier gère les interactions avec l'interface Docker et la communication avec l'API
 */

// Référence à l'API Docker
const dockerClient = dockerApi;

// Variables globales pour suivre l'état des containers
let activeContainerId = null;
let containerStatus = 'stopped';
let updateLogsInterval = null;

/**
 * Initialise les fonctionnalités Docker pour le Mini Shell
 * @param {HTMLElement} container Élément conteneur pour l'interface Docker
 */
function initMiniShellDocker(container) {
    // Créer l'interface Docker
    const dockerInterface = createDockerInterface(container);

    // Ajouter les gestionnaires d'événements
    dockerInterface.querySelector('#start-container').addEventListener('click', startMiniShellContainer);
    dockerInterface.querySelector('#stop-container').addEventListener('click', stopMiniShellContainer);
    dockerInterface.querySelector('#delete-container').addEventListener('click', deleteMiniShellContainer);
    dockerInterface.querySelector('#view-logs').addEventListener('click', viewContainerLogs);
}

/**
 * Crée l'interface Docker
 * @param {HTMLElement} container Élément conteneur
 * @returns {HTMLElement} L'interface Docker créée
 */
function createDockerInterface(container) {
    const dockerHTML = `
        <div class="docker-wrapper">
            <div class="docker-header">
                <h3 class="docker-title">Mini Shell Terminal</h3>
                <div class="docker-controls">
                    <button id="start-container" class="docker-control-btn">▶️ Démarrer</button>
                    <button id="stop-container" class="docker-control-btn" disabled>⏹️ Arrêter</button>
                    <button id="view-logs" class="docker-control-btn" disabled>📋 Logs</button>
                    <button id="delete-container" class="docker-control-btn" disabled>🗑️ Supprimer</button>
                </div>
            </div>
            <div class="docker-content">
                <div class="docker-placeholder">
                    <div class="docker-placeholder-icon">🐳</div>
                    <div class="docker-placeholder-text">Aucun container en cours d'exécution</div>
                </div>
                <pre id="docker-terminal" class="docker-terminal" style="display:none;"></pre>
            </div>
            <div class="docker-info">
                <div class="docker-status">
                    <span class="status-indicator status-stopped" id="status-indicator"></span>
                    <span id="status-text">Container arrêté</span>
                </div>
                <div id="container-info">
                    Utilisez le bouton "Démarrer" pour lancer le Mini Shell dans un container Docker.
                </div>
            </div>
            <div class="docker-footer">
                <div id="container-id"></div>
                <div class="docker-badge">mishu_minishell:latest</div>
            </div>
        </div>

        <div id="logs-modal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Logs du Container</h3>
                    <button class="modal-close" id="close-logs">&times;</button>
                </div>
                <div class="modal-body">
                    <pre id="modal-logs" class="modal-logs">Chargement des logs...</pre>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn modal-btn-secondary" id="close-logs-btn">Fermer</button>
                </div>
            </div>
        </div>
    `;

    container.innerHTML += dockerHTML;

    // Gestionnaire pour la fenêtre modale
    document.getElementById('close-logs').addEventListener('click', () => {
        document.getElementById('logs-modal').classList.remove('modal-visible');
    });
    
    document.getElementById('close-logs-btn').addEventListener('click', () => {
        document.getElementById('logs-modal').classList.remove('modal-visible');
    });

    return container;
}

/**
 * Démarre un container Mini Shell
 */
async function startMiniShellContainer() {
    try {
        // Mettre à jour l'interface
        updateContainerStatus('loading', 'Démarrage du container...');
        
        // Désactiver les boutons pendant le chargement
        toggleButtonsState(true, false, true, true);
        
        // Remplacer le placeholder par le terminal
        document.querySelector('.docker-placeholder').style.display = 'none';
        document.getElementById('docker-terminal').style.display = 'block';
        document.getElementById('docker-terminal').innerText = 'Démarrage du container Mini Shell...\n';
        
        // Générer un nom unique pour le container basé sur l'ID de session
        const sessionId = dockerClient.generateSessionId();
        const containerName = `mini_shell_${sessionId.substring(0, 8)}`;
        
        // Appeler l'API pour démarrer le container
        const response = await dockerClient.runMiniShellContainer(containerName, sessionId);
        
        if (response.success) {
            activeContainerId = response.data.container_id;
            containerStatus = 'running';
            
            // Mettre à jour l'interface
            updateContainerStatus('running', 'Container en cours d\'exécution');
            document.getElementById('container-info').innerText = `Container Mini Shell démarré avec succès (ID: ${activeContainerId.substring(0, 12)})`;
            document.getElementById('container-id').innerText = `ID: ${activeContainerId.substring(0, 12)}`;
            
            // Ajouter un message concernant l'arrêt automatique
            document.getElementById('docker-terminal').innerText += 'Container démarré. Une limite de 10 minutes est appliquée pour chaque démo.\n';
            document.getElementById('docker-terminal').innerText += 'Initialisez votre session Mini Shell...\n\n';
            
            // Activer les boutons appropriés
            toggleButtonsState(false, true, true, true);
            
            // Démarrer la mise à jour automatique des logs
            startLogsUpdater();
        } else {
            updateContainerStatus('stopped', 'Échec du démarrage du container');
            document.getElementById('docker-terminal').innerText += `Erreur: ${response.message || 'Échec de démarrage du conteneur'}\n`;
            
            // Afficher des informations de débogage dans la console
            console.error('Détails de l\'erreur:', response);
            
            if (response.message && response.message.includes('authentification')) {
                document.getElementById('docker-terminal').innerText += 'Erreur d\'authentification. Veuillez vérifier vos identifiants.\n';
            } else if (response.message && response.message.includes('Dockerfile')) {
                document.getElementById('docker-terminal').innerText += 'Le Dockerfile n\'a pas été trouvé. Vérifiez le chemin du projet Mini Shell.\n';
            }
            
            // Activer/désactiver les boutons appropriés
            toggleButtonsState(true, false, false, false);
        }
    } catch (error) {
        console.error('Erreur lors du démarrage du container:', error);
        updateContainerStatus('stopped', 'Erreur de connexion');
        document.getElementById('docker-terminal').innerText += `Erreur de connexion au serveur: ${error.message || error}\n`;
        
        // Activer/désactiver les boutons appropriés
        toggleButtonsState(true, false, false, false);
    }
}

/**
 * Arrête le container Mini Shell actif
 */
async function stopMiniShellContainer() {
    if (!activeContainerId) return;
    
    try {
        // Mettre à jour l'interface
        updateContainerStatus('loading', 'Arrêt du container...');
        
        // Désactiver les boutons pendant le chargement
        toggleButtonsState(true, true, true, true);
        
        // Mettre à jour le terminal
        document.getElementById('docker-terminal').innerText += 'Arrêt du container...\n';
        
        // Appeler l'API pour arrêter le container
        const response = await dockerClient.stopContainer(activeContainerId);
        
        if (response.success) {
            containerStatus = 'stopped';
            
            // Mettre à jour l'interface
            updateContainerStatus('stopped', 'Container arrêté');
            document.getElementById('container-info').innerText = `Container Mini Shell arrêté (ID: ${activeContainerId.substring(0, 12)})`;
            
            // Arrêter la mise à jour des logs
            stopLogsUpdater();
            
            // Activer/désactiver les boutons appropriés
            toggleButtonsState(true, false, false, true);
            
            // Ajouter au terminal
            document.getElementById('docker-terminal').innerText += 'Container arrêté avec succès\n';
        } else {
            updateContainerStatus('running', 'Échec de l\'arrêt du container');
            document.getElementById('docker-terminal').innerText += `Erreur: ${response.message}\n`;
            
            // Activer/désactiver les boutons appropriés
            toggleButtonsState(false, true, true, true);
        }
    } catch (error) {
        console.error('Erreur lors de l\'arrêt du container:', error);
        updateContainerStatus('running', 'Erreur de connexion');
        document.getElementById('docker-terminal').innerText += 'Erreur de connexion au serveur\n';
        
        // Activer/désactiver les boutons appropriés
        toggleButtonsState(false, true, true, true);
    }
}

/**
 * Supprime le container Mini Shell
 */
async function deleteMiniShellContainer() {
    if (!activeContainerId) return;
    
    try {
        // Mettre à jour l'interface
        updateContainerStatus('loading', 'Suppression du container...');
        
        // Désactiver les boutons pendant le chargement
        toggleButtonsState(true, true, true, true);
        
        // Mettre à jour le terminal
        document.getElementById('docker-terminal').innerText += 'Suppression du container...\n';
        
        // Appeler l'API pour supprimer le container
        const response = await dockerClient.removeContainer(activeContainerId, true);
        
        if (response.success) {
            // Réinitialiser l'état
            activeContainerId = null;
            containerStatus = 'stopped';
            
            // Mettre à jour l'interface
            updateContainerStatus('stopped', 'Container supprimé');
            document.getElementById('container-info').innerText = 'Container Mini Shell supprimé. Utilisez le bouton "Démarrer" pour créer un nouveau container.';
            document.getElementById('container-id').innerText = '';
            
            // Arrêter la mise à jour des logs
            stopLogsUpdater();
            
            // Activer/désactiver les boutons appropriés
            toggleButtonsState(true, false, false, false);
            
            // Ajouter au terminal
            document.getElementById('docker-terminal').innerText += 'Container supprimé avec succès\n';
            
            // Réafficher le placeholder après quelques secondes
            setTimeout(() => {
                document.getElementById('docker-terminal').style.display = 'none';
                document.querySelector('.docker-placeholder').style.display = 'flex';
            }, 3000);
        } else {
            // Gérer l'échec
            updateContainerStatus('stopped', 'Échec de la suppression du container');
            document.getElementById('docker-terminal').innerText += `Erreur: ${response.message}\n`;
            
            // Activer/désactiver les boutons appropriés
            toggleButtonsState(true, false, false, true);
        }
    } catch (error) {
        console.error('Erreur lors de la suppression du container:', error);
        updateContainerStatus('stopped', 'Erreur de connexion');
        document.getElementById('docker-terminal').innerText += 'Erreur de connexion au serveur\n';
        
        // Activer/désactiver les boutons appropriés
        toggleButtonsState(true, false, false, true);
    }
}

/**
 * Affiche les logs complets du container
 */
async function viewContainerLogs() {
    if (!activeContainerId) return;
    
    // Afficher la fenêtre modale
    document.getElementById('logs-modal').classList.add('modal-visible');
    document.getElementById('modal-logs').innerText = 'Chargement des logs...';
    
    try {
        // Récupérer les logs
        const response = await dockerClient.getContainerLogs(activeContainerId, 200);
        
        if (response.success) {
            document.getElementById('modal-logs').innerText = response.data.logs || 'Aucun log disponible';
        } else {
            document.getElementById('modal-logs').innerText = `Erreur: ${response.message}`;
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des logs:', error);
        document.getElementById('modal-logs').innerText = 'Erreur de connexion au serveur';
    }
}

/**
 * Démarre la mise à jour automatique des logs
 */
function startLogsUpdater() {
    if (updateLogsInterval) {
        clearInterval(updateLogsInterval);
    }
    
    // Mettre à jour les logs initialement
    updateContainerLogs();
    
    // Puis toutes les 2 secondes pour une expérience plus réactive
    updateLogsInterval = setInterval(updateContainerLogs, 2000);
}

/**
 * Arrête la mise à jour automatique des logs
 */
function stopLogsUpdater() {
    if (updateLogsInterval) {
        clearInterval(updateLogsInterval);
        updateLogsInterval = null;
    }
}

/**
 * Met à jour les logs du container dans le terminal
 */
async function updateContainerLogs() {
    if (!activeContainerId || containerStatus !== 'running') return;
    
    try {
        const response = await dockerClient.getContainerLogs(activeContainerId, 20);
        
        if (response.success) {
            const terminal = document.getElementById('docker-terminal');
            const logs = response.data.logs;
            
            if (logs.trim() === '') {
                // Si pas de logs, afficher un message d'aide
                if (!terminal.innerText.includes('En attente des logs...')) {
                    terminal.innerText = 'En attente des logs...\n\nVous pouvez interagir avec le Mini Shell en utilisant ces commandes:\n- ls (lister les fichiers)\n- cd (changer de répertoire)\n- echo (afficher un texte)\n- cat (afficher un fichier)\n- exit (quitter le shell)\n';
                }
            } else {
                // Sinon, afficher les logs
                terminal.innerText = logs;
            }
            
            // Faire défiler vers le bas
            terminal.scrollTop = terminal.scrollHeight;
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour des logs:', error);
    }
}

/**
 * Met à jour le statut du container dans l'interface
 * @param {string} status Statut du container ('running', 'stopped', 'loading')
 * @param {string} text Texte à afficher
 */
function updateContainerStatus(status, text) {
    const indicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    
    // Supprimer toutes les classes de statut
    indicator.classList.remove('status-running', 'status-stopped', 'status-loading');
    
    // Ajouter la classe correspondante
    indicator.classList.add(`status-${status}`);
    
    // Mettre à jour le texte
    statusText.innerText = text;
}

/**
 * Active/désactive les boutons selon l'état
 * @param {boolean} start Activer/désactiver le bouton démarrer
 * @param {boolean} stop Activer/désactiver le bouton arrêter
 * @param {boolean} logs Activer/désactiver le bouton logs
 * @param {boolean} remove Activer/désactiver le bouton supprimer
 */
function toggleButtonsState(start, stop, logs, remove) {
    document.getElementById('start-container').disabled = !start;
    document.getElementById('stop-container').disabled = !stop;
    document.getElementById('view-logs').disabled = !logs;
    document.getElementById('delete-container').disabled = !remove;
}
