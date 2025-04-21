FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies exactly as specified in package-lock.json without updating
RUN npm ci --no-audit --no-update-notifier --exact

# Copy the rest of the application
COPY . .

# Update browserslist database without modifying dependencies
RUN npx update-browserslist-db@latest --no-update

# Build the application with exact dependencies
RUN npm run build

# Install serve to serve the static files
RUN npm install -g serve

# Expose port
EXPOSE 5173

# Command to run the application in development mode
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 