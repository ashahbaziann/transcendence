FROM node:22

WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies inside container
RUN npm install


COPY prisma ./prisma

RUN npx prisma generate
# Copy all code
COPY . .

EXPOSE 3000


#Inga added
RUN npx prisma generate

CMD ["node", "server.js"]