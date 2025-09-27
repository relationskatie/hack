# Документация по развертыванию - ЦОДД Смоленской области

## Обзор развертывания

Проект настроен для развертывания на **Vercel** с автоматическим деплоем из GitHub. Также поддерживается развертывание на других платформах.

## 🚀 Развертывание на Vercel

### Автоматическое развертывание

1. **Подключение репозитория:**
   ```bash
   # В Vercel Dashboard:
   # 1. Import Project
   # 2. Connect GitHub Repository
   # 3. Select Repository: smolensk-tsodd-frontend
   ```

2. **Конфигурация проекта:**
   ```bash
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

3. **Переменные окружения:**
   ```bash
   # В Vercel Dashboard > Settings > Environment Variables
   NEXT_PUBLIC_API_URL=https://api.tsodd.smolensk.ru
   NEXT_PUBLIC_BACKEND_URL=https://backend.tsodd.smolensk.ru
   JWT_SECRET=your-production-jwt-secret
   ```

### Настройка Vercel Proxy

```javascript
// vercel.json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://backend.tsodd.smolensk.ru/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

### Автоматические деплои

```yaml
# GitHub Actions (опционально)
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm run lint
```

## 🐳 Развертывание с Docker

### Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://backend:8000/api
    depends_on:
      - backend
    networks:
      - app-network

  backend:
    image: tsodd-backend:latest
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/tsodd
    depends_on:
      - db
    networks:
      - app-network

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=tsodd
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

### Команды Docker

```bash
# Сборка образа
docker build -t tsodd-frontend .

# Запуск контейнера
docker run -p 3000:3000 tsodd-frontend

# Запуск с Docker Compose
docker-compose up -d

# Просмотр логов
docker-compose logs -f frontend
```

## 🌐 Развертывание на других платформах

### Netlify

```toml
# netlify.toml
[build]
  publish = ".next"
  command = "npm run build"

[[redirects]]
  from = "/api/*"
  to = "https://backend.tsodd.smolensk.ru/api/:splat"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### AWS Amplify

```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### Google Cloud Run

```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/tsodd-frontend', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/tsodd-frontend']
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'tsodd-frontend'
      - '--image'
      - 'gcr.io/$PROJECT_ID/tsodd-frontend'
      - '--region'
      - 'europe-west1'
      - '--platform'
      - 'managed'
```

## ⚙️ Конфигурация окружения

### Переменные окружения

```bash
# .env.production
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.tsodd.smolensk.ru
NEXT_PUBLIC_BACKEND_URL=https://backend.tsodd.smolensk.ru
JWT_SECRET=your-super-secure-jwt-secret-key
NEXT_PUBLIC_SITE_URL=https://tsodd.smolensk.ru

# Опциональные
NEXT_PUBLIC_ANALYTICS_ID=GA-XXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

### Next.js конфигурация

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // для Docker
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['backend.tsodd.smolensk.ru'],
    unoptimized: true, // если нужна поддержка статических файлов
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

## 🔒 Безопасность

### HTTPS настройка

```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};
```

### Content Security Policy

```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.tsodd.smolensk.ru",
            ].join('; '),
          },
        ],
      },
    ];
  },
};
```

## 📊 Мониторинг и логирование

### Vercel Analytics

```javascript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Sentry интеграция

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Логирование

```javascript
// utils/logger.js
export const logger = {
  info: (message, meta = {}) => {
    console.log(`[INFO] ${message}`, meta);
  },
  error: (message, error = {}) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message, meta = {}) => {
    console.warn(`[WARN] ${message}`, meta);
  },
};
```

## 🚀 Оптимизация производительности

### Bundle анализатор

```bash
# Установка
npm install --save-dev @next/bundle-analyzer

# Использование
npm run analyze
```

### Lazy loading

```javascript
// Динамические импорты
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

// Lazy loading изображений
<Image
  src="/hero-bg.jpg"
  alt="Hero background"
  fill
  priority={false}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Кэширование

```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};
```

## 🔄 CI/CD Pipeline

### GitHub Actions полный workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npx tsc --noEmit
      
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
          NEXT_PUBLIC_BACKEND_URL: ${{ secrets.NEXT_PUBLIC_BACKEND_URL }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 🧪 Тестирование в продакшене

### Health check

```javascript
// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Проверка подключения к API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`);
    
    if (!response.ok) {
      throw new Error('API is not responding');
    }
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
```

### Мониторинг производительности

```javascript
// utils/performance.js
export const reportWebVitals = (metric) => {
  if (process.env.NODE_ENV === 'production') {
    // Отправка метрик в аналитику
    console.log(metric);
    
    // Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        value: Math.round(metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      });
    }
  }
};
```

## 📋 Чек-лист развертывания

### Перед деплоем:

- [ ] Проверить переменные окружения
- [ ] Запустить тесты локально
- [ ] Проверить сборку проекта
- [ ] Настроить домен и SSL
- [ ] Настроить мониторинг
- [ ] Проверить безопасность

### После деплоя:

- [ ] Проверить работоспособность сайта
- [ ] Протестировать API интеграцию
- [ ] Проверить производительность
- [ ] Настроить бэкапы
- [ ] Документировать процесс

## 🔧 Troubleshooting

### Частые проблемы:

1. **Ошибка сборки:**
   ```bash
   # Очистка кэша
   rm -rf .next node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Проблемы с API:**
   ```bash
   # Проверка переменных окружения
   echo $NEXT_PUBLIC_API_URL
   ```

3. **Проблемы с изображениями:**
   ```javascript
   // В next.config.js добавить домен
   images: {
     domains: ['your-image-domain.com'],
   }
   ```

## 🔗 Полезные ссылки

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/best-practices/)
- [Web Performance](https://web.dev/performance/)
