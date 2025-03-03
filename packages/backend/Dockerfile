FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Uncomment the next line if your backend has a build step
# RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]
