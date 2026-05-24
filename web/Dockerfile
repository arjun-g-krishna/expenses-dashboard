### Multi-stage build for React (Vite) frontend
FROM mirror.gcr.io/library/node:22-alpine AS builder
WORKDIR /app

# Install dependencies (copy package files from repo root web/ directory)
COPY web/package.json web/package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy source and repo fixtures needed by the build
COPY web ./
# Place repo-level tests at image root so imports like '../../../tests/fixtures' resolve
COPY tests /tests
RUN npm run build

### Nginx to serve the built files
FROM mirror.gcr.io/library/nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
