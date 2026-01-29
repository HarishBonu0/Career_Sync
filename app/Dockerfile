FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN cd backend && npm install --production
RUN cd frontend && npm install

# Build frontend
COPY frontend ./frontend/
RUN cd frontend && npm run build

# Copy backend source
COPY backend ./backend/

EXPOSE 5000

CMD ["node", "backend/server.js"]
