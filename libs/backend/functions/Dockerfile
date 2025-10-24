# Use official Node LTS image
FROM node:22-slim

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install Chrome dependencies for Puppeteer, including apt-utils to silence debconf warnings
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
       apt-utils \
       wget gnupg ca-certificates fonts-liberation \
       libappindicator3-1 libatk-bridge2.0-0 libatk1.0-0 libcups2 \
       libdbus-1-3 libdrm2 libgbm1 libgtk-3-0 libnspr4 libnss3 \
       libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 xdg-utils \
       libasound2 \
 && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Copy package manifests and configuration
COPY ["package.json", "package-lock.json", "tsconfig.json", "./"]

# Install dependencies
RUN npm ci

# Copy and build source code
COPY src ./src
RUN npm run build

# Remove dev dependencies to slim image
RUN npm prune --production

# Expose port and define default command
ENV PORT=8080
EXPOSE 8080
CMD ["node", "lib/index.js"]

#$ gcloud builds submit --tag gcr.io/moofy-firebase/us-central1/moofy-scraper-job
#$ gcloud beta run jobs update moofy-scraper-job --region us-central1 --task-timeout=168h --cpu=8 --memory=16Gi
#$ gcloud run jobs executions list --job moofy-scraper-job --region us-central1