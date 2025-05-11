"""
API Backend pour gérer les containers Docker et spécifiquement le Mini Shell
"""

from fastapi import FastAPI, HTTPException, Depends, status, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials, APIKeyHeader
import uvicorn
import logging
import secrets
import os
from typing import List

from models import (
    DockerImageModel,
    DockerContainerModel,
    ContainerActionRequest,
    ContainerCreationRequest,
    MiniShellContainerRequest,
    ApiResponse
)
from docker_control import docker_manager

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

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration de l'authentification
security = HTTPBasic()
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

# Configurer les identifiants pour les opérations sensibles
# En production, utilisez des variables d'environnement ou une base de données
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "adminpassword")
API_KEY = os.getenv("API_KEY", "your-secret-api-key")

def verify_api_key(api_key: str = Security(api_key_header)) -> bool:
    if api_key == API_KEY:
        return True
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Clé API invalide",
        headers={"WWW-Authenticate": "APIKey"},
    )

def verify_admin_user(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, ADMIN_USERNAME)
    correct_password = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)
    
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants invalides",
            headers={"WWW-Authenticate": "Basic"},
        )
    return True

# Création de l'application FastAPI
app = FastAPI(
    title="API Docker Manager",
    description="API pour gérer les containers Docker, notamment le Mini Shell",
    version="1.0.0",
    # Masquer les détails techniques dans le docs
    openapi_url=None if os.getenv("PRODUCTION", "false").lower() == "true" else "/openapi.json",
    docs_url=None if os.getenv("PRODUCTION", "false").lower() == "true" else "/docs",
    redoc_url=None if os.getenv("PRODUCTION", "false").lower() == "true" else "/redoc"
)

# Ajout du middleware pour masquer les en-têtes de version
app.add_middleware(RemoveHeadersMiddleware)

# Configuration CORS pour permettre les requêtes depuis le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ajustez en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Point de terminaison pour vérifier si l'API est en cours d'exécution
@app.get("/", response_model=ApiResponse)
def read_root():
    return ApiResponse(
        success=True,
        message="API Docker Manager en cours d'exécution",
        data={"status": "online"}
    )

# Point de terminaison pour lister les images Docker
@app.get("/images", response_model=ApiResponse)
def list_images():
    images = docker_manager.list_images()
    return ApiResponse(
        success=True,
        message=f"{len(images)} images trouvées",
        data=images
    )

# Point de terminaison pour lister les containers Docker
@app.get("/containers", response_model=ApiResponse)
def list_containers(all_containers: bool = True):
    containers = docker_manager.list_containers(all_containers)
    return ApiResponse(
        success=True,
        message=f"{len(containers)} containers trouvés",
        data=containers
    )

# Point de terminaison pour lancer un container générique
@app.post("/containers/run", response_model=ApiResponse, dependencies=[Depends(verify_admin_user)])
def run_container(request: ContainerCreationRequest):
    success, message, container_id = docker_manager.run_container(
        image_name=request.image_name,
        container_name=request.container_name,
        ports=request.ports,
        volumes=request.volumes,
        environment=request.environment,
        detach=request.detach
    )
    
    return ApiResponse(
        success=success,
        message=message,
        data={"container_id": container_id} if container_id else None
    )

# Point de terminaison pour arrêter un container
@app.post("/containers/stop", response_model=ApiResponse, dependencies=[Depends(verify_admin_user)])
def stop_container(request: ContainerActionRequest):
    success, message = docker_manager.stop_container(request.container_id)
    return ApiResponse(
        success=success,
        message=message
    )

# Point de terminaison pour supprimer un container
@app.post("/containers/remove", response_model=ApiResponse, dependencies=[Depends(verify_admin_user)])
def remove_container(request: ContainerActionRequest):
    success, message = docker_manager.remove_container(
        request.container_id,
        force=request.force
    )
    return ApiResponse(
        success=success,
        message=message
    )

# Point de terminaison pour obtenir les logs d'un container
@app.get("/containers/{container_id}/logs", response_model=ApiResponse)
def get_container_logs(container_id: str, tail: int = 100, api_key: str = Security(api_key_header), credentials: HTTPBasicCredentials = Depends(security)):
    # Vérifier soit l'API key soit les credentials basiques
    api_key_valid = api_key == API_KEY if api_key else False
    basic_auth_valid = False
    
    if credentials:
        correct_username = secrets.compare_digest(credentials.username, ADMIN_USERNAME)
        correct_password = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)
        basic_auth_valid = correct_username and correct_password
    
    if not (api_key_valid or basic_auth_valid):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentification invalide",
            headers={"WWW-Authenticate": "Basic"},
        )
        
    # Si l'authentification est valide, continuer
    success, logs = docker_manager.get_container_logs(container_id, tail)
    return ApiResponse(
        success=success,
        message="Logs récupérés avec succès" if success else logs,
        data={"logs": logs} if success else None
    )

# Point de terminaison pour démarrer un container arrêté
@app.post("/containers/start", response_model=ApiResponse, dependencies=[Depends(verify_admin_user)])
def start_container(request: ContainerActionRequest):
    try:
        container = docker_manager.client.containers.get(request.container_id)
        
        # Vérifier si c'est un conteneur Mini Shell autorisé
        if not docker_manager.is_minishell_container(request.container_id):
            error_msg = f"Container {request.container_id} n'est pas un conteneur Mini Shell autorisé"
            logger.warning(error_msg)
            return ApiResponse(
                success=False,
                message=error_msg
            )
        
        # Démarrer le conteneur s'il est arrêté
        if container.status != "running":
            container.start()
            logger.info(f"Container {request.container_id} démarré avec succès")
            
            # Si un arrêt automatique était configuré, le reconfigurer
            import threading
            import time
            
            def auto_stop():
                time.sleep(600)  # 10 minutes
                try:
                    container = docker_manager.client.containers.get(request.container_id)
                    if container.status == "running":
                        container.stop()
                        logger.info(f"Container {request.container_id} arrêté automatiquement après 10 minutes")
                except Exception as e:
                    logger.error(f"Erreur lors de l'arrêt automatique du container {request.container_id}: {e}")
            
            # Démarrer un thread pour l'arrêt automatique
            stop_thread = threading.Thread(target=auto_stop)
            stop_thread.daemon = True
            stop_thread.start()
            
            return ApiResponse(
                success=True,
                message=f"Container {request.container_id} démarré avec succès"
            )
        else:
            return ApiResponse(
                success=True,
                message=f"Container {request.container_id} déjà en cours d'exécution"
            )
    except docker.errors.NotFound:
        error_msg = f"Container {request.container_id} non trouvé"
        logger.error(error_msg)
        return ApiResponse(
            success=False,
            message=error_msg
        )
    except Exception as e:
        error_msg = f"Erreur lors du démarrage du container {request.container_id}: {e}"
        logger.error(error_msg)
        return ApiResponse(
            success=False,
            message=error_msg
        )

# Point de terminaison spécifique pour créer un container Mini Shell
@app.post("/mini-shell/run", response_model=ApiResponse, dependencies=[Depends(verify_admin_user)])
def run_mini_shell_container(request: MiniShellContainerRequest):
    # Si un identifiant de session est fourni, l'utiliser pour créer un nom de conteneur unique
    container_name = request.container_name
    if request.session_id:
        container_name = f"{request.container_name}_{request.session_id}"
        
    success, message, container_id = docker_manager.get_mini_shell_container(
        container_name=container_name,
        expose_port=request.expose_port,
        port_mapping=request.port_mapping,
        session_id=request.session_id,
        reuse_existing=request.reuse_existing
    )
    
    return ApiResponse(
        success=success,
        message=message,
        data={
            "container_id": container_id,
            "container_name": container_name
        } if container_id else None
    )

# Lancement du serveur si exécuté directement
if __name__ == "__main__":
    logger.info("Démarrage du serveur API Docker Manager...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)