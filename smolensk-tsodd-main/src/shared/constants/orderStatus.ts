import type { OrderStatus } from '@/features/orders/orders.api';

/**
 * Централизованные переводы статусов заказов
 * Изменение здесь автоматически обновит все места в проекте
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Ожидает подтверждения',
  CONFIRMED: 'Подтвержден',
  DONE: 'Выполнен',
  CANCELED: 'Отменен',
} as const;

/**
 * Централизованные цвета для статусов заказов
 * Изменение здесь автоматически обновит все места в проекте
 */
export const ORDER_STATUS_COLORS: Record<OrderStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  PENDING: 'warning',    // Оранжевый - ожидает действия
  CONFIRMED: 'info',     // Синий - подтвержден, в процессе
  DONE: 'success',       // Зеленый - успешно выполнен
  CANCELED: 'error',     // Красный - отменен
} as const;

/**
 * Получить локализованный текст статуса заказа
 * @param status - Статус заказа
 * @returns Локализованный текст
 */
export const getOrderStatusLabel = (status: OrderStatus): string => {
  return ORDER_STATUS_LABELS[status];
};

/**
 * Получить цвет для статуса заказа
 * @param status - Статус заказа
 * @returns Цвет для Material-UI компонентов
 */
export const getOrderStatusColor = (status: OrderStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  return ORDER_STATUS_COLORS[status];
};

/**
 * Получить все доступные статусы с их переводами
 * @returns Массив объектов { value, label }
 */
export const getOrderStatusOptions = () => {
  return Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({
    value: value as OrderStatus,
    label,
  }));
};

/**
 * Проверить, можно ли отменить заказ
 * @param status - Статус заказа
 * @returns true, если заказ можно отменить
 */
export const canCancelOrder = (status: OrderStatus): boolean => {
  return status !== 'CANCELED';
};

/**
 * Проверить, является ли заказ активным
 * @param status - Статус заказа
 * @returns true, если заказ активен
 */
export const isActiveOrder = (status: OrderStatus): boolean => {
  return status === 'PENDING' || status === 'CONFIRMED';
};

/**
 * Проверить, завершен ли заказ
 * @param status - Статус заказа
 * @returns true, если заказ завершен
 */
export const isCompletedOrder = (status: OrderStatus): boolean => {
  return status === 'DONE' || status === 'CANCELED';
};
