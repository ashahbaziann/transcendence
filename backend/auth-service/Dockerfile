FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate resolve --applied 20250423_init 2>/dev/null || true && npx prisma migrate deploy && node server.js"]
