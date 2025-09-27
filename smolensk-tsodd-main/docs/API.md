# API Документация - ЦОДД Смоленской области

## Обзор API клиента

Проект использует централизованный HTTP клиент для взаимодействия с backend API. Все API запросы проходят через единую точку входа с автоматической обработкой авторизации, ошибок и токенов.

## 🔧 HTTP клиент

### Основной клиент (`src/shared/api/client.ts`)

```typescript
import { apiFetch, http } from '@/shared/api/client';

// GET запрос
const data = await http.get<ResponseType>('/api/endpoint');

// POST запрос
const result = await http.post<ResponseType>('/api/endpoint', requestBody);

// PUT запрос
const updated = await http.put<ResponseType>('/api/endpoint', requestBody);

// DELETE запрос
await http.delete('/api/endpoint');
```

### Конфигурация запросов

```typescript
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | Array<string | number | boolean>>;
  body?: unknown;
  isFormData?: boolean;
  requireAuth?: boolean;
}
```

## 🔐 Авторизация

### Автоматическое добавление токенов

```typescript
// Автоматически добавляет Authorization header для защищенных запросов
const protectedData = await http.get('/api/protected', {
  requireAuth: true
});
```

### Обработка истечения токена

```typescript
// Автоматическая проверка JWT токена
// При истечении токена:
// 1. Очистка localStorage
// 2. Показ уведомления пользователю
// 3. Редирект на /login
```

## 🌐 Базовый URL

### Конфигурация окружения

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Логика определения URL

```typescript
// В разработке: использует переменные окружения
// В продакшене: использует относительные пути для Vercel proxy
```

## 📡 Feature API сервисы

### 1. Аутентификация (`src/features/auth/api/auth.api.ts`)

```typescript
import { authApi } from '@/features/auth';

// Вход в систему
const loginResponse = await authApi.login({
  username: 'admin',
  password: 'admin123'
});

// Выход из системы
await authApi.logout();

// Получение текущего пользователя
const user = await authApi.getCurrentUser();

// Обновление профиля
const updatedUser = await authApi.updateProfile(profileData);
```

### 2. Новости (`src/features/news/services/news.api.ts`)

```typescript
import { newsApi } from '@/features/news';

// Получение списка новостей
const news = await newsApi.getNews({
  page: 1,
  limit: 10,
  category: 'announcement'
});

// Получение новости по ID
const newsItem = await newsApi.getNewsById('123');

// Создание новости (требует авторизации)
const newNews = await newsApi.createNews({
  title: 'Заголовок',
  content: 'Содержимое',
  category: 'news'
});

// Обновление новости
const updatedNews = await newsApi.updateNews('123', updateData);

// Удаление новости
await newsApi.deleteNews('123');
```

### 3. Проекты (`src/features/projects/services/projects.api.ts`)

```typescript
import { projectsApi } from '@/features/projects';

// Получение проектов
const projects = await projectsApi.getProjects({
  status: 'active',
  category: 'infrastructure'
});

// Получение проекта по ID
const project = await projectsApi.getProjectById('456');

// Создание проекта
const newProject = await projectsApi.createProject({
  name: 'Новый проект',
  description: 'Описание',
  status: 'planning'
});

// Обновление проекта
const updatedProject = await projectsApi.updateProject('456', updateData);

// Удаление проекта
await projectsApi.deleteProject('456');
```

### 4. Заказы (`src/features/orders/orders.api.ts`)

```typescript
import { ordersApi } from '@/features/orders';

// Создание заказа эвакуатора
const order = await ordersApi.createOrder({
  vehicleNumber: 'А123БВ77',
  location: 'ул. Ленина, 1',
  reason: 'Неправильная парковка',
  contactPhone: '+7 (999) 123-45-67'
});

// Получение заказов пользователя
const userOrders = await ordersApi.getUserOrders();

// Получение заказа по ID
const orderDetails = await ordersApi.getOrderById('789');

// Обновление статуса заказа (админ)
await ordersApi.updateOrderStatus('789', 'CONFIRMED');
```

### 5. Аналитика (`src/features/analytics/services/analytics.api.ts`)

```typescript
import { analyticsApi } from '@/features/analytics';

// Получение общей статистики
const stats = await analyticsApi.getStatistics({
  period: 'month',
  dateFrom: '2024-01-01',
  dateTo: '2024-01-31'
});

// Статистика ДТП
const accidents = await analyticsApi.getAccidents({
  severity: 'high',
  district: 'center'
});

// Статистика эвакуаций
const evacuations = await analyticsApi.getEvacuations({
  reason: 'wrong_parking'
});

// Статистика штрафов
const fines = await analyticsApi.getFines({
  type: 'speeding'
});
```

### 6. Карта (`src/features/map/services/map.api.ts`)

```typescript
import { mapApi } from '@/features/map';

// Получение данных карты
const mapData = await mapApi.getMapData();

// Получение светофоров
const trafficLights = await mapApi.getTrafficLights({
  district: 'center',
  status: 'active'
});

// Получение камер
const cameras = await mapApi.getCameras({
  type: 'speed',
  active: true
});

// Обновление статуса светофора
await mapApi.updateTrafficLightStatus('tl-123', 'maintenance');
```

## 🔍 Поиск (`src/features/search/services/search.api.ts`)

```typescript
import { searchApi } from '@/features/search';

// Глобальный поиск
const results = await searchApi.globalSearch({
  query: 'светофор',
  types: ['news', 'projects', 'services'],
  limit: 20
});

// Поиск по типам
const newsResults = await searchApi.searchByType('news', {
  query: 'дороги',
  filters: { category: 'infrastructure' }
});
```

## 📊 Статистика (`src/features/statistics/services/statistics.api.ts`)

```typescript
import { statisticsApi } from '@/features/statistics';

// Получение KPI метрик
const kpis = await statisticsApi.getKPIs({
  period: 'quarter',
  year: 2024
});

// Экспорт данных
const csvData = await statisticsApi.exportData({
  type: 'accidents',
  format: 'csv',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});
```

## 🚦 Светофоры (`src/features/traffic-lights/services/traffic-lights.api.ts`)

```typescript
import { trafficLightsApi } from '@/features/traffic-lights';

// Получение всех светофоров
const lights = await trafficLightsApi.getTrafficLights();

// Получение светофора по ID
const light = await trafficLightsApi.getTrafficLightById('tl-456');

// Обновление конфигурации
await trafficLightsApi.updateConfig('tl-456', {
  cycleTime: 120,
  greenTime: 45,
  yellowTime: 5
});

// Получение статистики работы
const stats = await trafficLightsApi.getStatistics('tl-456', {
  period: 'week'
});
```

## 🏢 Вакансии (`src/features/vacancies/services/vacancies.api.ts`)

```typescript
import { vacanciesApi } from '@/features/vacancies';

// Получение вакансий
const vacancies = await vacanciesApi.getVacancies({
  status: 'active',
  department: 'engineering'
});

// Получение вакансии по ID
const vacancy = await vacanciesApi.getVacancyById('vac-789');

// Создание вакансии
const newVacancy = await vacanciesApi.createVacancy({
  title: 'Инженер по светофорам',
  description: 'Описание позиции',
  requirements: ['Высшее образование', 'Опыт работы'],
  salary: '50000-70000'
});

// Обновление вакансии
const updatedVacancy = await vacanciesApi.updateVacancy('vac-789', updateData);

// Удаление вакансии
await vacanciesApi.deleteVacancy('vac-789');
```

## 📞 Контакты (`src/features/contacts/services/contacts.api.ts`)

```typescript
import { contactsApi } from '@/features/contacts';

// Получение контактной информации
const contacts = await contactsApi.getContacts();

// Обновление контактов (админ)
await contactsApi.updateContacts({
  phone: '+7 (4812) 123-45-67',
  email: 'info@tsodd.smolensk.ru',
  address: 'ул. Ленина, 1, Смоленск'
});
```

## 📄 Документы (`src/features/documents/services/documents.api.ts`)

```typescript
import { documentsApi } from '@/features/documents';

// Получение документов
const documents = await documentsApi.getDocuments({
  category: 'regulations',
  type: 'pdf'
});

// Загрузка документа
const document = await documentsApi.getDocumentById('doc-123');

// Создание документа
const newDoc = await documentsApi.createDocument({
  title: 'Новый документ',
  category: 'forms',
  file: fileData
});

// Обновление документа
const updatedDoc = await documentsApi.updateDocument('doc-123', updateData);

// Удаление документа
await documentsApi.deleteDocument('doc-123');
```

## 🛠 Услуги (`src/features/services/services.api.ts`)

```typescript
import { servicesApi } from '@/features/services';

// Получение услуг
const services = await servicesApi.getServices({
  category: 'evacuation',
  active: true
});

// Получение услуги по ID
const service = await servicesApi.getServiceById('srv-456');

// Создание услуги
const newService = await servicesApi.createService({
  name: 'Эвакуация автомобиля',
  description: 'Услуга по эвакуации неправильно припаркованных авто',
  price: 3000,
  category: 'evacuation'
});

// Обновление услуги
const updatedService = await servicesApi.updateService('srv-456', updateData);

// Удаление услуги
await servicesApi.deleteService('srv-456');
```

## 🔧 Обработка ошибок

### Типы ошибок

```typescript
// 401 Unauthorized - истекший токен
// 403 Forbidden - недостаточно прав
// 404 Not Found - ресурс не найден
// 422 Validation Error - ошибка валидации
// 500 Internal Server Error - серверная ошибка
```

### Обработка в компонентах

```typescript
try {
  const data = await api.getData();
  setData(data);
} catch (error) {
  if (error.message.includes('401')) {
    // Автоматический редирект на login
  } else if (error.message.includes('403')) {
    setError('Недостаточно прав для выполнения операции');
  } else {
    setError('Произошла ошибка при загрузке данных');
  }
}
```

## 📝 Типизация

### Базовые типы

```typescript
// Все API ответы типизированы
interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

// Пагинация
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Фильтры
interface BaseFilters {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}
```

## 🚀 Оптимизация

### Кэширование

```typescript
// React Query для кэширования API запросов
// Автоматическое обновление данных
// Background refetch
// Optimistic updates
```

### Retry логика

```typescript
// Автоматические повторы при сетевых ошибках
// Exponential backoff
// Максимальное количество попыток
```

## 🔍 Отладка

### Логирование запросов

```typescript
// В режиме разработки все запросы логируются
// Информация о времени выполнения
// Детали запроса и ответа
```

### DevTools

```typescript
// React Query DevTools
// Network tab в браузере
// Console логи для отладки
```

---

## 📋 Чек-лист для новых API

При добавлении нового API эндпоинта:

- [ ] Создать типы для запроса и ответа
- [ ] Добавить метод в соответствующий API сервис
- [ ] Обработать ошибки
- [ ] Добавить типизацию
- [ ] Протестировать с мок данными
- [ ] Добавить документацию

## 🔗 Полезные ссылки

- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
