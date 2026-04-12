FROM node:22-slim

WORKDIR /app

# Install worker dependencies
COPY worker/package.json worker/package-lock.json* ./
RUN npm install --production=false

# Copy worker source
COPY worker/ ./

# Start worker
CMD ["npx", "tsx", "index.ts"]
