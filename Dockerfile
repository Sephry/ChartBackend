FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production

# Install production dependencies only, cached on the lockfile layer.
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --omit=dev

# Application source. Configuration is supplied via environment variables at
# runtime (see .env.example) and is never baked into the image.
COPY --chown=node:node src ./src

EXPOSE 8080
USER node

# Liveness via the /health endpoint, using Node's core http module (no curl/wget needed).
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||8080)+'/health',res=>process.exit(res.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "src/server.js"]
