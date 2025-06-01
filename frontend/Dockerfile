# Build stage
FROM node:20-alpine as build

# Accept build arguments
ARG VITE_USER_API_URL
ARG VITE_INVOICE_API_URL
ARG VITE_TIMEOFFS_API_URL
ARG VITE_APP_URL

# Set environment variables from build arguments
ENV VITE_USER_API_URL=${VITE_USER_API_URL}
ENV VITE_INVOICE_API_URL=${VITE_INVOICE_API_URL}
ENV VITE_TIMEOFFS_API_URL=${VITE_TIMEOFFS_API_URL}
ENV VITE_APP_URL=${VITE_APP_URL}

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy the built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
