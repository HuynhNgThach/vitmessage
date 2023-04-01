FROM node:lts

ENV NODE_ENV production

RUN mkdir -p /backend

WORKDIR /backend

RUN npm install -g nodemon

COPY . .

RUN npm install


RUN npx prisma generate --schema=./src/prisma/schema.prisma

EXPOSE 4000

CMD ["npm", "run", "dev"]
