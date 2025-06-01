# Use Node.js LTS version as base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Copy the entire monorepo
COPY . .

# Install dependencies
RUN npm install

# Accept service name as build argument and export it as environment variable
ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE_NAME}

# Build the specified service
RUN npm run build -- ${SERVICE_NAME}

# Expose port (default NestJS port)
EXPOSE 3000

# Start the service
CMD ["sh", "-c", "node dist/apps/${SERVICE_NAME}/apps/${SERVICE_NAME}/src/main"]
