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

CMD ["node", "src/server.js"]
