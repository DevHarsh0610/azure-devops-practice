# Stage 1: Build the application
FROM node:20-alpine AS builder
# Install OpenSSL for Prisma
RUN apk add --no-cache openssl
WORKDIR /app

# Install dependencies needed for building
COPY package*.json ./
RUN npm ci

# Generate Prisma Client first to leverage Docker caching
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code and build production JavaScript
COPY . .
RUN npm run build

# Stage 2: Production runtime environment
FROM node:20-alpine AS runner
# Install OpenSSL for Prisma in the runtime environment too
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production

# Install production dependencies only (saves space)
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled code and generated Prisma files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Expose port and run the application directly using node
EXPOSE 3000
CMD ["node", "dist/server.js"]