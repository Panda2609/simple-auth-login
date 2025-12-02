# Usar imagen de Node.js
FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar el resto del código
COPY . .

# Exponer puerto
EXPOSE 8080

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
