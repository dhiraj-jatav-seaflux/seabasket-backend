# ---------- BUILD STAGE ----------
FROM node:20 AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .
RUN yarn build


# ---------- PRODUCTION STAGE ----------
FROM node:20

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --production

# ✅ Use stable MySQL client (no crash)
RUN apt-get update && apt-get install -y default-mysql-client

COPY --from=builder /app/dist ./dist
COPY wait-for-db.sh .

RUN chmod +x wait-for-db.sh

RUN apt-get update && apt-get install -y netcat-openbsd

EXPOSE 3000

CMD ["sh", "wait-for-db.sh"]