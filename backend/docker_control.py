"""
Module pour gérer l'interaction avec Docker
Ce module permet de créer, démarrer, arrêter et supprimer des containers Docker
"""

import docker
import os
import logging
from typing import Dict, List, Optional, Tuple

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DockerManager:
    """Classe pour gérer les opérations Docker"""
    
    def __init__(self):
        """Initialise le client Docker"""
        try:
            self.client = docker.from_env()
            logger.info("Client Docker initialisé avec succès")
        except Exception as e:
            logger.error(f"Erreur lors de l'initialisation du client Docker: {e}")
            raise
    
    def list_images(self) -> List[Dict]:
        """
        Liste toutes les images Docker disponibles
        
        Returns:
            List[Dict]: Liste des images Docker avec leurs attributs
        """
        try:
            images = self.client.images.list()
            return [
                {
                    "id": image.id,
                    "tags": image.tags,
                    "size": image.attrs['Size'] / (1024 * 1024),  # Taille en MB
                    "created": image.attrs['Created']
                }
                for image in images
            ]
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des images: {e}")
            return []
    
    def list_containers(self, all_containers: bool = True) -> List[Dict]:
        """
        Liste tous les containers Docker
        
        Args:
            all_containers (bool): Si True, inclut les containers arrêtés
            
        Returns:
            List[Dict]: Liste des containers avec leurs attributs
        """
        try:
            containers = self.client.containers.list(all=all_containers)
            return [
                {
                    "id": container.id,
                    "name": container.name,
                    "image": container.image.tags[0] if container.image.tags else container.image.id,
                    "status": container.status,
                    "created": container.attrs['Created']
                }
                for container in containers
            ]
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des containers: {e}")
            return []
    
    def run_container(self, 
                     image_name: str, 
                     container_name: Optional[str] = None,
                     ports: Optional[Dict[str, str]] = None,
                     volumes: Optional[Dict[str, Dict[str, str]]] = None,
                     environment: Optional[Dict[str, str]] = None,
                     detach: bool = True,
                     auto_remove: bool = False,
                     auto_stop_after: Optional[int] = 600) -> Tuple[bool, str, Optional[str]]:
        """
        Lance un container Docker à partir d'une image
        
        Args:
            image_name (str): Nom de l'image Docker
            container_name (str, optional): Nom du container. Par défaut None.
            ports (Dict[str, str], optional): Mapping des ports {port_hôte:port_container}
            volumes (Dict[str, Dict[str, str]], optional): Mapping des volumes
            environment (Dict[str, str], optional): Variables d'environnement
            detach (bool): Si True, exécute le container en arrière-plan
            auto_remove (bool): Si True, le container est supprimé à son arrêt
            auto_stop_after (int, optional): Nombre de secondes après lesquelles le container s'arrête 
                                            automatiquement (600 = 10 minutes)
            
        Returns:
            Tuple[bool, str, Optional[str]]: (succès, message, container_id si succès)
        """
        try:
            # Vérifier si l'image existe
            try:
                self.client.images.get(image_name)
            except docker.errors.ImageNotFound:
                logger.warning(f"Image {image_name} non trouvée, tentative de téléchargement...")
                self.client.images.pull(image_name)
            
            # Vérifier si un container avec ce nom existe déjà
            if container_name:
                try:
                    existing = self.client.containers.get(container_name)
                    return False, f"Un container nommé {container_name} existe déjà (statut: {existing.status})", None
                except docker.errors.NotFound:
                    pass
            
            # Lancer le container avec les options appropriées
            container = self.client.containers.run(
                image=image_name,
                name=container_name,
                ports=ports,
                volumes=volumes,
                environment=environment,
                detach=detach,
                auto_remove=auto_remove
            )
            
            # Si auto_stop_after est spécifié, planifier l'arrêt automatique
            if auto_stop_after and auto_stop_after > 0:
                import threading
                import time
                
                def auto_stop():
                    time.sleep(auto_stop_after)
                    try:
                        container.stop()
                        logger.info(f"Container {container.name} arrêté automatiquement après {auto_stop_after} secondes")
                    except Exception as e:
                        logger.error(f"Erreur lors de l'arrêt automatique du container {container.name}: {e}")
                
                # Démarrer un thread pour l'arrêt automatique
                stop_thread = threading.Thread(target=auto_stop)
                stop_thread.daemon = True
                stop_thread.start()
            
            logger.info(f"Container {container.name} créé avec succès (ID: {container.id})")
            return True, f"Container {container.name} démarré avec succès", container.id
            
        except Exception as e:
            error_msg = f"Erreur lors du lancement du container depuis l'image {image_name}: {e}"
            logger.error(error_msg)
            return False, error_msg, None
    
    def stop_container(self, container_id_or_name: str) -> Tuple[bool, str]:
        """
        Arrête un container Docker
        
        Args:
            container_id_or_name (str): ID ou nom du container
            
        Returns:
            Tuple[bool, str]: (succès, message)
        """
        try:
            # Vérifier si c'est un conteneur Mini Shell autorisé
            if not self.is_minishell_container(container_id_or_name):
                error_msg = f"Container {container_id_or_name} n'est pas un conteneur Mini Shell autorisé"
                logger.warning(error_msg)
                return False, error_msg
                
            container = self.client.containers.get(container_id_or_name)
            container.stop()
            logger.info(f"Container {container_id_or_name} arrêté avec succès")
            return True, f"Container {container_id_or_name} arrêté avec succès"
        except docker.errors.NotFound:
            error_msg = f"Container {container_id_or_name} non trouvé"
            logger.error(error_msg)
            return False, error_msg
        except Exception as e:
            error_msg = f"Erreur lors de l'arrêt du container {container_id_or_name}: {e}"
            logger.error(error_msg)
            return False, error_msg
    
    def remove_container(self, container_id_or_name: str, force: bool = False) -> Tuple[bool, str]:
        """
        Supprime un container Docker
        
        Args:
            container_id_or_name (str): ID ou nom du container
            force (bool): Si True, force la suppression même s'il est en cours d'exécution
            
        Returns:
            Tuple[bool, str]: (succès, message)
        """
        try:
            # Vérifier si c'est un conteneur Mini Shell autorisé
            if not self.is_minishell_container(container_id_or_name):
                error_msg = f"Container {container_id_or_name} n'est pas un conteneur Mini Shell autorisé"
                logger.warning(error_msg)
                return False, error_msg
                
            container = self.client.containers.get(container_id_or_name)
            container.remove(force=force)
            logger.info(f"Container {container_id_or_name} supprimé avec succès")
            return True, f"Container {container_id_or_name} supprimé avec succès"
        except docker.errors.NotFound:
            error_msg = f"Container {container_id_or_name} non trouvé"
            logger.error(error_msg)
            return False, error_msg
        except Exception as e:
            error_msg = f"Erreur lors de la suppression du container {container_id_or_name}: {e}"
            logger.error(error_msg)
            return False, error_msg
    
    def build_image(self, 
                   path: str, 
                   tag: str, 
                   dockerfile: str = 'Dockerfile',
                   buildargs: Optional[Dict[str, str]] = None) -> Tuple[bool, str]:
        """
        Construit une image Docker à partir d'un Dockerfile
        
        Args:
            path (str): Chemin vers le répertoire contenant le Dockerfile
            tag (str): Tag à donner à l'image
            dockerfile (str): Nom du fichier Dockerfile (par défaut 'Dockerfile')
            buildargs (Dict[str, str], optional): Arguments de construction
            
        Returns:
            Tuple[bool, str]: (succès, message)
        """
        try:
            # Vérifier si le Dockerfile existe
            dockerfile_path = os.path.join(path, dockerfile)
            if not os.path.exists(dockerfile_path):
                return False, f"Le Dockerfile {dockerfile_path} n'existe pas"
            
            logger.info(f"Construction de l'image {tag} à partir de {dockerfile_path}...")
            self.client.images.build(
                path=path,
                tag=tag,
                dockerfile=dockerfile,
                buildargs=buildargs
            )
            
            logger.info(f"Image {tag} construite avec succès")
            return True, f"Image {tag} construite avec succès"
        except Exception as e:
            error_msg = f"Erreur lors de la construction de l'image {tag}: {e}"
            logger.error(error_msg)
            return False, error_msg
    
    def get_container_logs(self, container_id_or_name: str, tail: int = 100) -> Tuple[bool, str]:
        """
        Récupère les logs d'un container
        
        Args:
            container_id_or_name (str): ID ou nom du container
            tail (int): Nombre de lignes à récupérer depuis la fin
            
        Returns:
            Tuple[bool, str]: (succès, logs ou message d'erreur)
        """
        try:
            # Vérifier si c'est un conteneur Mini Shell autorisé
            if not self.is_minishell_container(container_id_or_name):
                error_msg = f"Container {container_id_or_name} n'est pas un conteneur Mini Shell autorisé"
                logger.warning(error_msg)
                return False, error_msg
                
            container = self.client.containers.get(container_id_or_name)
            try:
                logs = container.logs(tail=tail, timestamps=False).decode('utf-8')
                # Formater les logs pour une meilleure lisibilité
                logs = self._format_logs(logs)
                return True, logs
            except UnicodeDecodeError:
                # Gérer les erreurs de décodage
                logs = container.logs(tail=tail, timestamps=False).decode('utf-8', errors='replace')
                return True, logs
        
        except docker.errors.NotFound:
            error_msg = f"Container {container_id_or_name} non trouvé"
            logger.error(error_msg)
            return False, error_msg
        except Exception as e:
            error_msg = f"Erreur lors de la récupération des logs du container {container_id_or_name}: {e}"
            logger.error(error_msg)
            return False, error_msg
    
    def get_mini_shell_container(self, 
                               container_name: str = "mini_shell_container",
                               expose_port: bool = False,
                               port_mapping: Dict[str, str] = None,
                               session_id: str = None,
                               reuse_existing: bool = True) -> Tuple[bool, str, Optional[str]]:
        """
        Méthode spécifique pour lancer un container du Mini Shell
        
        Args:
            container_name (str): Nom du container
            expose_port (bool): Si True, expose un port pour le shell
            port_mapping (Dict[str, str]): Mapping de ports personnalisé
            session_id (str): Identifiant de session de l'utilisateur pour la réutilisation
            reuse_existing (bool): Si True, réutilise un container existant s'il est en cours d'exécution
            
        Returns:
            Tuple[bool, str, Optional[str]]: (succès, message, container_id si succès)
        """
        # Vérifier si un container du même nom existe déjà
        try:
            existing_container = self.client.containers.get(container_name)
            
            # Si le container existe mais n'est pas en cours d'exécution, le démarrer
            if existing_container.status == 'exited':
                try:
                    existing_container.start()
                    logger.info(f"Container {container_name} redémarré avec succès")
                    return True, f"Container {container_name} redémarré", existing_container.id
                except Exception as e:
                    error_msg = f"Erreur lors du redémarrage du container {container_name}: {e}"
                    logger.error(error_msg)
                    return False, error_msg, None
            
            # Si le container est déjà en cours d'exécution, l'utiliser si reuse_existing est True
            elif existing_container.status == 'running':
                if reuse_existing:
                    logger.info(f"Container {container_name} déjà en cours d'exécution et réutilisé")
                    return True, f"Container {container_name} déjà en cours d'exécution", existing_container.id
                else:
                    logger.warning(f"Container {container_name} déjà en cours d'exécution et non réutilisé")
                    return False, f"Un container nommé {container_name} existe déjà (statut: {existing_container.status})", None
            
            # Autres cas (création, redémarrage, etc.)
            else:
                logger.warning(f"Un container nommé {container_name} existe déjà (statut: {existing_container.status})")
                return False, f"Un container nommé {container_name} existe déjà (statut: {existing_container.status})", None
                
        except docker.errors.NotFound:
            # Le container n'existe pas, on continue avec la création
            pass
        except Exception as e:
            error_msg = f"Erreur lors de la vérification du container existant: {e}"
            logger.error(error_msg)
            return False, error_msg, None
            
        # Vérifier le nombre de conteneurs Mini Shell en cours d'exécution
        try:
            containers = self.client.containers.list(all=True)
            running_minishell_containers = [
                c for c in containers 
                if self.is_minishell_container(c.id) and c.status == 'running'
            ]
            
            # Si 10 conteneurs sont déjà en cours d'exécution, retourner une erreur
            if len(running_minishell_containers) >= 10:
                error_msg = "Nombre maximum de conteneurs Mini Shell atteint (10). Veuillez réessayer plus tard."
                logger.warning(error_msg)
                return False, error_msg, None
                
        except Exception as e:
            error_msg = f"Erreur lors de la vérification du nombre de conteneurs: {e}"
            logger.error(error_msg)
            
        # Image name, basée sur le contexte et le répertoire du Mini_shell
        image_name = "mishu_minishell:latest"
        project_path = "/home/mishu/mishu/projects/Mini_shell"
        
        # Essayer de construire l'image si elle n'existe pas
        try:
            self.client.images.get(image_name)
            logger.info(f"L'image {image_name} existe déjà, utilisation...")
        except docker.errors.ImageNotFound:
            logger.info(f"L'image {image_name} n'existe pas, construction...")
            success, message = self.build_image(project_path, image_name)
            if not success:
                return False, message, None
        
        # Configuration du mapping des ports
        ports = None
        if expose_port:
            ports = port_mapping if port_mapping else {'8080': '8080'}
        
        # Lancer le container avec auto-stop après 10 minutes (600 secondes)
        return self.run_container(
            image_name=image_name,
            container_name=container_name,
            ports=ports,
            detach=True,
            auto_stop_after=600  # 10 minutes
        )
    
    def is_minishell_container(self, container_id_or_name: str) -> bool:
        """
        Vérifie si un container est un conteneur Mini Shell autorisé
        
        Args:
            container_id_or_name (str): ID ou nom du container
            
        Returns:
            bool: True si c'est un conteneur Mini Shell, False sinon
        """
        try:
            container = self.client.containers.get(container_id_or_name)
            
            # Vérifier si l'image est bien mishu_minishell ou hmenkor/mini-shell
            if not container.image.tags:
                return False
                
            is_minishell = any("mishu_minishell" in tag or "hmenkor/mini-shell" in tag 
                              for tag in container.image.tags)
            
            # Vérifier les options de sécurité du container
            security_opts = container.attrs.get('HostConfig', {}).get('SecurityOpt', [])
            
            # Logs pour le débogage
            logger.info(f"Container {container_id_or_name} est un Mini Shell: {is_minishell}")
            logger.info(f"Security options: {security_opts}")
            
            return is_minishell
        except Exception as e:
            logger.error(f"Erreur lors de la vérification du container: {e}")
            return False
    
    def _format_logs(self, logs: str) -> str:
        """
        Formater les logs pour une meilleure lisibilité
        
        Args:
            logs (str): Logs bruts
            
        Returns:
            str: Logs formatés
        """
        if not logs:
            # Retourner un message d'aide si aucun log n'est disponible
            return "En attente des logs...\n\nVous pouvez interagir avec le Mini Shell en utilisant ces commandes:\n- ls (lister les fichiers)\n- cd (changer de répertoire)\n- echo (afficher un texte)\n- cat (afficher un fichier)\n- exit (quitter le shell)"
            
        # Supprimer les caractères de contrôle inutiles
        import re
        logs = re.sub(r'\x1b\[[0-9;]*[mK]', '', logs)
        
        # Ajouter des préfixes pour les commandes
        lines = logs.split('\n')
        formatted_lines = []
        
        command_pattern = re.compile(r'^(\$|#|>|minishell|bash).*')
        
        for line in lines:
            if command_pattern.match(line):
                # C'est probablement une commande
                formatted_lines.append(f"> {line}")
            else:
                formatted_lines.append(line)
                
        return '\n'.join(formatted_lines)

# Instance par défaut
docker_manager = DockerManager()