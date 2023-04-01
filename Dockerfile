FROM node:lts as dependencies
WORKDIR /my-project/frontend
COPY ./frontend/package.json ./frontend/package-lock.json ./
RUN npm install --frozen-lockfile
RUN files="$(ls -1)" && echo $files

FROM node:lts as builder

WORKDIR /my-project
COPY ./backend ./backend

WORKDIR /my-project/frontend
COPY ./frontend .
COPY --from=dependencies /my-project/frontend/node_modules ./node_modules
RUN npx prisma generate --schema=./src/prisma/schema.prisma
#CMD ["cd","./frontend"]
#CMD ["cd","/my-project/frontend"]
#RUN file="$(ls -1 package.json)" && echo $file
RUN echo $(pwd)
RUN NODE_ENV=production npm run build

FROM node:lts as runner
WORKDIR /my-project/frontend
ENV NODE_ENV production
# If you are using a custom next.config.js file, uncomment this line.
# COPY --from=builder /my-project/next.config.js ./
COPY --from=builder /my-project/frontend/public ./public
COPY --from=builder /my-project/frontend/.next ./.next
COPY --from=builder /my-project/frontend/node_modules ./node_modules
COPY --from=builder /my-project/frontend/package.json ./package.json
COPY --from=builder /my-project/frontend/.env.production ./


EXPOSE 3000
CMD ["npm","run", "start"]
