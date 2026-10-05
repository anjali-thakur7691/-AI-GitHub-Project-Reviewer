FROM node:20-bookworm-slim AS frontend-build

WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js tailwind.config.js postcss.config.js ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM python:3.12-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY app.py database.py ./
COPY --from=frontend-build /build/dist ./dist

CMD ["python", "-u", "app.py"]
