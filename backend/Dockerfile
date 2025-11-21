# --- Stage 1: Build dependencies ---
FROM node:24-alpine AS deps

WORKDIR /app

# copy package.json dan package-lock.json saja (biar cache jalan)
COPY package*.json ./

# install dependencies
RUN npm install --production=false


# --- Stage 2: Build aplikasi ---
FROM node:24-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build


# --- Stage 3: Final image ---
FROM node:24-alpine AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

CMD ["node", "dist/index.js"]