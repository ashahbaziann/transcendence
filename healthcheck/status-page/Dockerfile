# Use Node.js official image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files (if you have one, else skip)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the port the server.js listens on
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]