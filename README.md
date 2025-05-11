![mishu](https://github.com/user-attachments/assets/bd416bd7-7f2b-4e0d-9f13-8f8e85368afa)

Bien sûr ! Voici un exemple de **README.md** clair et structuré pour ton projet **Mini Shell**, basé sur les fichiers, le comportement, et la structure de ton projet :

---

```markdown
# 🐚 Mini Shell - Projet d'interprète de commandes en C

Mini Shell est un shell minimaliste écrit en C, conçu pour interpréter des commandes de manière interactive. Ce projet inclut la gestion des alias, de l’historique, des redirections, de la séparation de commandes et de certaines restrictions d’accès par utilisateur.

---

## 🚀 Fonctionnalités principales

- [x] Lecture interactive de commandes
- [x] Historique des commandes (`history.txt`)
- [x] Gestion des alias via `aliases.txt`
- [x] Redirection (`>`) et exécution en arrière-plan (`&`)
- [x] Commandes internes : `exit`, `cd`, `source`, etc.
- [x] Fichier `toggled_commands.txt` pour désactiver certaines commandes
- [x] Autorisation de commandes selon l'utilisateur (`getenv("USER")`)
- [x] Séparation des responsabilités dans différents fichiers `.c` et `.h`

---

## 🗂️ Structure du projet

```
ini_shell/
├── aliases.txt               # Fichier des alias définis
├── CMakeLists.txt            # Fichier de configuration CMake
├── history.txt               # Historique des commandes
├── memory_managing.[c|h]     # Gestion dynamique de la mémoire
├── my_string.[c|h]           # Fonctions personnalisées sur les chaînes
├── shell_function.[c|h]      # Fonctions principales du shell
├── shell_globals.[c|h]       # Variables et structures globales
├── Squelette.c               # Fonction principale du shell
└── README.md                 # Documentation du projet
```

---

## 🛠️ Compilation et exécution (via Docker)

Le projet utilise un **Dockerfile multi-stage** pour compiler et exécuter un shell dans un environnement isolé.

### 🔧 Construction de l’image :

```bash
docker build -t mishu_minishell .
```

### ▶️ Exécution du shell :

```bash
docker run --rm -it mishu_minishell
```

---

## ✅ Pré-requis (hors Docker)

- `gcc`, `make`, `cmake`
- (optionnel) `libcurl-dev` pour certaines extensions

### Compilation manuelle (hors Docker) :

```bash
mkdir build
cd build
cmake ..
make
./mini_shell
```

---

## 🧠 Exemple d’utilisation

```shell
$ ls
$ cd ..
$ echo Hello > test.txt
$ source myscript.sh
$ exit
```

---

## 🔒 Sécurité et restrictions

Certaines commandes peuvent être désactivées à l’exécution en les ajoutant à `toggled_commands.txt`. De plus, seules certaines commandes sont autorisées pour l'utilisateur courant, selon la logique définie dans `shell_execute()`.

---

## 👤 Auteur

Projet développé par **Mishu**  
🌐 [https://github.com/mishu](https://github.com/mishu) *(à adapter)*

---

## 📄 Licence

Ce projet est sous licence MIT – Voir le fichier [LICENSE](LICENSE) *(à ajouter si nécessaire)*.
```

---

Souhaite-tu que je te le mette directement dans un fichier `README.md` ou que je t’aide à l’adapter à un style plus académique ?


# Sources :
- https://fr.legacy.reactjs.org/
- 