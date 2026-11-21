# Teleios Radar: painel + API + MCP numa imagem só
FROM node:22-alpine AS web
WORKDIR /app/web
COPY web/package*.json ./
RUN npm ci || npm install
COPY web/ ./
RUN VITE_BASE=/ npx vite build

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY api/package*.json api/
RUN cd api && (npm ci --omit=dev || npm install --omit=dev)
COPY api/src api/src
# A API reaproveita a análise, o seed e o construtor do painel
COPY web/src web/src
COPY --from=web /app/web/dist web/dist
RUN mkdir -p /data/wa-auth && chown -R node:node /data
VOLUME /data
EXPOSE 3000
USER node
CMD ["node", "api/src/server.js"]
