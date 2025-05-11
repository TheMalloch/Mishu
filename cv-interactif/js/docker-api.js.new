/**
 * Module de gestion des appels API pour Docker
 * Ce fichier gère les interactions avec l'API backend pour la gestion des containers Docker
 */

// URL de base de l'API
const API_BASE_URL = '/api';

/**
 * Classe de gestion des appels API Docker
 */
class DockerAPI {
    /**
     * Récupère la liste des images Docker
     * @returns {Promise<Array>} Liste des images
     */
    async getImages() {
        try {
            const response = await fetch(`${API_BASE_URL}/images`);
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            console.error('Erreur lors de la récupération des images:', error);
            return [];
        }
    }

    /**
     * Récupère la liste des containers Docker
     * @param {boolean} all Inclure les containers arrêtés
     * @returns {Promise<Array>} Liste des containers
     */
    async getContainers(all = true) {
        try {
            const response = await fetch(`${API_BASE_URL}/containers?all_containers=${all}`);
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            console.error('Erreur lors de la récupération des containers:', error);
            return [];
        }
    }

    /**
     * Lance un container Mini Shell
     * @param {string} containerName Nom du container
     * @param {string} sessionId Identifiant de session unique pour l'utilisateur
     * @returns {Promise<Object>} Résultat de l'opération
     */
    async runMiniShellContainer(containerName = 'mini_shell_demo', sessionId = null) {
        try {
            // Générer un identifiant de session s'il n'est pas fourni
            if (!sessionId) {
                sessionId = this.generateSessionId();
            }
            
            // Créer des informations d'authentification (base64 de "admin:adminpassword")
            const authHeader = 'Basic ' + btoa('admin:adminpassword');
            
            const response = await fetch(`${API_BASE_URL}/mini-shell/run`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authHeader
                },
                body: JSON.stringify({
                    container_name: containerName,
                    expose_port: false,
                    session_id: sessionId,
                    reuse_existing: true
                }),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Erreur API:', response.status, errorText);
                return { 
                    success: false, 
                    message: `Erreur HTTP ${response.status}: ${errorText || 'Problème d\'authentification'}`
                };
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erreur lors du lancement du container Mini Shell:', error);
            return { 
                success: false, 
                message: error.message || 'Erreur de connexion au serveur' 
            };
        }
    }

    /**
     * Méthode utilitaire pour générer un identifiant de session unique
     * @returns {string} Identifiant de session
     */
    generateSessionId() {
        // Récupérer un identifiant de session existant du stockage local
        let sessionId = localStorage.getItem('docker_session_id');
        
        // Si aucun identifiant n'existe, en créer un nouveau
        if (!sessionId) {
            sessionId = 'u_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
            localStorage.setItem('docker_session_id', sessionId);
        }
        
        return sessionId;
    }

    /**
     * Arrête un container Docker
     * @param {string} containerId ID ou nom du container
     * @returns {Promise<Object>} Résultat de l'opération
     */
    async stopContainer(containerId) {
        try {
            const response = await fetch(`${API_BASE_URL}/containers/stop`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    container_id: containerId
                }),
            });
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de l\'arrêt du container:', error);
            return { 
                success: false, 
                message: 'Erreur de connexion au serveur' 
            };
        }
    }

    /**
     * Récupère les logs d'un container
     * @param {string} containerId ID ou nom du container
     * @param {number} tail Nombre de lignes à récupérer
     * @returns {Promise<Object>} Logs du container
     */
    async getContainerLogs(containerId, tail = 100) {
        try {
            // Créer des informations d'authentification (base64 de "admin:adminpassword")
            const authHeader = 'Basic ' + btoa('admin:adminpassword');
            
            const response = await fetch(`${API_BASE_URL}/containers/${containerId}/logs?tail=${tail}`, {
                headers: {
                    'Authorization': authHeader,
                    'X-API-Key': 'your-secret-api-key'
                }
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erreur lors de la récupération des logs:', error);
            return { 
                success: false, 
                message: 'Erreur de connexion au serveur',
                data: { logs: '' }
            };
        }
    }

    /**
     * Supprime un container Docker
     * @param {string} containerId ID ou nom du container
     * @param {boolean} force Force la suppression
     * @returns {Promise<Object>} Résultat de l'opération
     */
    async removeContainer(containerId, force = false) {
        try {
            const response = await fetch(`${API_BASE_URL}/containers/remove`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    container_id: containerId,
                    force: force
                }),
            });
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la suppression du container:', error);
            return { 
                success: false, 
                message: 'Erreur de connexion au serveur' 
            };
        }
    }
}

// Crée une instance globale de l'API Docker
const dockerApi = new DockerAPI();
