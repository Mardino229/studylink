# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install bun for fast installs (matches bun.lock)
RUN npm install -g bun

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# Injected at build time so Vite can embed the URL in the bundle
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
ARG VITE_LANDING_DOMAIN
ENV VITE_LANDING_DOMAIN=${VITE_LANDING_DOMAIN}
ARG VITE_APP_DOMAIN
ENV VITE_APP_DOMAIN=${VITE_APP_DOMAIN}

RUN bun run build

# ── Stage 2: serve ──────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
