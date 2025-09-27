# Система локализации статусов заказов

## Обзор

Централизованная система для управления переводами статусов заказов в проекте. Все изменения переводов делаются в одном месте и автоматически применяются во всем приложении.

## Файлы

- `orderStatus.ts` - Основной файл с переводами и утилитами

## Использование

### Основные функции

```typescript
import { 
  getOrderStatusLabel, 
  getOrderStatusColor,
  getOrderStatusOptions, 
  canCancelOrder,
  isActiveOrder,
  isCompletedOrder 
} from '@/shared/constants/orderStatus';

// Получить перевод статуса
const label = getOrderStatusLabel('PENDING'); // "Ожидает подтверждения"

// Получить цвет статуса для Material-UI компонентов
const color = getOrderStatusColor('PENDING'); // "warning"

// Получить все статусы с переводами для Select
const options = getOrderStatusOptions();

// Проверить, можно ли отменить заказ
const canCancel = canCancelOrder('PENDING'); // true

// Проверить, активен ли заказ
const isActive = isActiveOrder('CONFIRMED'); // true

// Проверить, завершен ли заказ
const isCompleted = isCompletedOrder('DONE'); // true
```

### Использование с Material-UI компонентами

```typescript
// Chip с цветом статуса
<Chip 
  label={getOrderStatusLabel(order.status)} 
  color={getOrderStatusColor(order.status)}
  size="small" 
/>

// Alert с цветом статуса
<Alert severity={getOrderStatusColor(order.status)}>
  {getOrderStatusLabel(order.status)}
</Alert>
```

### Изменение переводов и цветов

Для изменения переводов отредактируйте объект `ORDER_STATUS_LABELS` в файле `orderStatus.ts`:

```typescript
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Ожидает подтверждения',    // Измените здесь
  CONFIRMED: 'Подтвержден',           // Измените здесь
  DONE: 'Выполнен',                   // Измените здесь
  CANCELED: 'Отменен',                // Измените здесь
} as const;
```

Для изменения цветов отредактируйте объект `ORDER_STATUS_COLORS`:

```typescript
export const ORDER_STATUS_COLORS: Record<OrderStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  PENDING: 'warning',    // Оранжевый - ожидает действия
  CONFIRMED: 'info',     // Синий - подтвержден, в процессе
  DONE: 'success',       // Зеленый - успешно выполнен
  CANCELED: 'error',     // Красный - отменен
} as const;
```

**Доступные цвета Material-UI:**
- `default` - Серый (по умолчанию)
- `primary` - Основной цвет темы
- `secondary` - Вторичный цвет темы
- `error` - Красный (ошибки)
- `info` - Синий (информация)
- `success` - Зеленый (успех)
- `warning` - Оранжевый (предупреждение)

## Где используется

- `/orders` - Страница заказов пользователя
- `/orders/[id]` - Детальная страница заказа
- `/admin/orders` - Админ-панель заказов

## Преимущества

1. **Централизация** - Все переводы в одном месте
2. **Типобезопасность** - TypeScript проверяет корректность использования
3. **Автоматическое обновление** - Изменения применяются везде сразу
4. **Дополнительные утилиты** - Готовые функции для проверки статусов
5. **Легкость поддержки** - Простое добавление новых статусов

## Добавление нового статуса

1. Добавьте статус в тип `OrderStatus` в `orders.api.ts`
2. Добавьте перевод в `ORDER_STATUS_LABELS`
3. Обновите утилиты при необходимости
4. Все компоненты автоматически получат новый статус
