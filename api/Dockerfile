# Utilisez une image Node.js comme base
FROM node:23

# Définissez le répertoire de travail
WORKDIR /src

# Copiez le fichier package.json dans le répertoire de travail
COPY package.json .

# Installez les dépendances
RUN npm install

# Copiez le reste des fichiers dans le répertoire de travail
COPY . .

# Exposez le port 3000
EXPOSE 3000

# Démarrez l'application
CMD ["npm", "start"]
