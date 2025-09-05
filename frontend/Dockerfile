# Frontend Dockerfile
FROM node:20-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies (including dev dependencies for build)
RUN yarn install --production=false

# Install TypeScript and Vite globally for build
RUN yarn global add typescript vite

# Copy source code
COPY . .

# Build the application
RUN tsc && vite build

# Production stage with simple HTTP server
FROM node:20-alpine

# Install serve for static file serving
RUN yarn global add serve

# Copy built files from builder stage
COPY --from=builder /app/dist /app/dist

# Set working directory
WORKDIR /app

# Expose port
EXPOSE 80

# Start simple HTTP server
CMD ["serve", "-s", "dist", "-l", "80"]
