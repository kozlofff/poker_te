# Use Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install --prefer-offline --no-audit && \
    npm install --save-dev jest @types/jest @testing-library/react @testing-library/jest-dom

# Copy the rest of the application
COPY . .

# Set environment to development
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Create a volume for the .next directory
VOLUME /app/.next

# Expose port
EXPOSE 3000

# Start the development server with optimized settings
CMD ["npm", "run", "dev", "--", "--turbo"] 