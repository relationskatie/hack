import { z } from 'zod';

// Login
export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Введите имя пользователя'),
  password: z.string().min(6, 'Минимум 6 символов'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

// Contacts
export const contactsSchema = z.object({
  name: z.string().min(2, 'Введите имя'),
  email: z.string().email('Неверный email'),
  phone: z.string().optional(),
  subject: z.string().min(2, 'Укажите тему'),
  message: z.string().min(10, 'Минимум 10 символов'),
});
export type ContactsFormValues = z.infer<typeof contactsSchema>;

// Admin News Create
export const newsCreateSchema = z.object({
  title: z.string().min(3, 'Введите заголовок'),
  description: z.string().optional(),
  content: z.string().min(20, 'Минимум 20 символов'),
  image: z.string().optional(),
});
export type NewsFormValues = z.infer<typeof newsCreateSchema>;

// Services (create/update)
export const serviceSchema = z.object({
  tittle: z.string().trim().min(2, 'Введите название'),
  price: z.coerce.number().min(0, 'Цена не может быть отрицательной'),
  description: z.string().trim().min(2, 'Введите описание'),
  need_schedule: z.boolean(),
  schedule: z
    .array(
      z.object({
        date: z.string().min(1),
        start_time: z.string().min(1),
        end_time: z.string().min(1),
        is_booked: z.boolean(),
      })
    )
    .optional(),
});
export type ServiceFormValues = z.infer<typeof serviceSchema>;

// Orders (create from service)
export const orderCreateSchema = z.object({
  date: z.string().min(1, 'Укажите дату'),
  start_time: z.string().min(1, 'Укажите время начала'),
  end_time: z.string().min(1, 'Укажите время окончания'),
  location: z.string().trim().min(2, 'Укажите адрес'),
  description: z.string().trim().optional(),
});
export type OrderFormValues = z.infer<typeof orderCreateSchema>;

// Evacuation
export const evacuationSchema = z.object({
  vehicleType: z.string().min(1),
  vehicleBrand: z.string().min(1, 'Укажите марку'),
  vehicleModel: z.string().min(1, 'Укажите модель'),
  vehicleNumber: z.string().min(3, 'Укажите номер'),
  location: z.string().min(2, 'Укажите адрес'),
  reason: z.string().min(1),
  name: z.string().min(2, 'Укажите имя'),
  phone: z.string().min(5, 'Укажите телефон'),
  comment: z.string().optional(),
});
export type EvacFormValues = z.infer<typeof evacuationSchema>;
