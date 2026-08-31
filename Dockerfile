# syntax=docker/dockerfile:1

# --- Build stage ---
FROM node:22-alpine AS builder

# Baked into the Angular bundle at build time (override in deploy/.env)
ARG API_URL=https://api.kampalanonstop.com/api/v1

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN sed -i "s|apiUrl:.*|apiUrl: '${API_URL}',|" src/environments/environment.production.ts \
    && npm run build

# --- Production stage ---
FROM nginx:1.27-alpine AS production

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/kampala-waitlist-angular/browser /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
