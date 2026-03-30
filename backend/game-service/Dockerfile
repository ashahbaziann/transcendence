FROM node:18

WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies inside container
RUN npm install

# Copy all code
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]