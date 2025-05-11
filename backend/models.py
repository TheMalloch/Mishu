"""
Modèles de données pour l'API backend
"""

from typing import List, Optional, Dict, Union
from pydantic import BaseModel, Field
from datetime import datetime


class DockerImageModel(BaseModel):
    """Modèle représentant une image Docker"""
    id: str
    tags: List[str]
    size: float  # en MB
    created: str


class DockerContainerModel(BaseModel):
    """Modèle représentant un container Docker"""
    id: str
    name: str
    image: str
    status: str
    created: str


class ContainerActionRequest(BaseModel):
    """Modèle pour les requêtes d'action sur un container"""
    container_id: str = Field(..., description="ID ou nom du container")
    force: Optional[bool] = Field(False, description="Force l'opération même si le container est en cours d'exécution")


class ContainerCreationRequest(BaseModel):
    """Modèle pour les requêtes de création de container"""
    image_name: str = Field(..., description="Nom de l'image Docker")
    container_name: Optional[str] = Field(None, description="Nom du container")
    ports: Optional[Dict[str, str]] = Field(None, description="Mapping des ports {port_hôte:port_container}")
    volumes: Optional[Dict[str, Dict[str, str]]] = Field(None, description="Mapping des volumes")
    environment: Optional[Dict[str, str]] = Field(None, description="Variables d'environnement")
    detach: Optional[bool] = Field(True, description="Exécuter en arrière-plan")


class MiniShellContainerRequest(BaseModel):
    """Modèle pour les requêtes de création de container Mini Shell"""
    container_name: Optional[str] = Field("mini_shell_container", description="Nom du container")
    expose_port: Optional[bool] = Field(False, description="Expose un port pour le shell")
    port_mapping: Optional[Dict[str, str]] = Field(None, description="Mapping de ports personnalisé")
    session_id: Optional[str] = Field(None, description="Identifiant de session de l'utilisateur")
    reuse_existing: Optional[bool] = Field(True, description="Réutiliser un container existant pour cet utilisateur")


class ApiResponse(BaseModel):
    """Modèle pour les réponses API génériques"""
    success: bool
    message: str
    data: Optional[Union[Dict, List]] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())