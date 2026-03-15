# Utiliser l'image Node.js officielle
FROM node:18-slim

# Créer le dossier de l'app
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code
COPY . .

# Exposer le port par défaut d'Express
EXPOSE 3000

# Commande pour démarrer le serveur
CMD ["node", "server.js"]
