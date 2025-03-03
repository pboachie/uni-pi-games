FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the app and build it
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
