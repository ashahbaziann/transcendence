FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY prisma ./prisma

RUN npx prisma generate

COPY . .

EXPOSE 3000

RUN npx prisma generate

CMD ["node", "server.js"]