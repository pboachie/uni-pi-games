FROM node:18-buster-slim

WORKDIR /app

# Copy monorepo root files
COPY package.json yarn.lock ./

# Copy the packages folder correctly from the repo root
COPY packages ./packages
COPY plugins ./plugins

# Set working directory to backend package
WORKDIR /app/packages/frontend

# Use "--ignore-optional" to skip swc-linux optional dependency
RUN yarn install --ignore-optional
RUN yarn build

# remove frontend source code
RUN rm -rf /app/packages/backend

EXPOSE 3000
CMD ["yarn", "start"]
