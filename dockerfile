FROM mcr.microsoft.com/playwright:v1.41.1-jammy

WORKDIR /app

COPY package.json ./

RUN npm install

COPY playwright.config.ts ./
COPY tests/ . tests/
COPY fixtures/ . fixtures/
COPY ./.env ./

# Mount the report directory as a volume to persist reports
VOLUME ["/app/playwright-report"]

CMD ["npx", "playwright", "test", "--reporter", "html"]
