# Use Node.js 22.12.0
FROM node:22.12.0-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .npmrc ./

# Install dependencies
RUN npm ci --only=production --silent

# Copy source code
COPY . .

# Build the application
RUN npm run build:prod

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 