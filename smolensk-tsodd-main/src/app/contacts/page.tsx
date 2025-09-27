'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactsSchema, type ContactsFormValues } from '@/shared/types/validation';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  DirectionsCar as CarIcon,
  Support as SupportIcon,
  Telegram as TelegramIcon,
  WhatsApp as WhatsAppIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import AppButton from '@/shared/components/ui/AppButton';
import RHFForm from '@/shared/components/ui/form/RHFForm';
import { RHFTextField } from '@/shared/components/ui/form/RHFTextField';
// import { InteractiveMap } from '@/shared/components/common/InteractiveMap';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import { ContactsApi, type BackendContactItem } from '@/features/contacts/services/contacts.api';



// Using shared ContactsFormValues type

export default function ContactsPage() {
  const methods = useForm<ContactsFormValues>({
    defaultValues: { name: '', email: '', phone: '', subject: '', message: '' },
    mode: 'onSubmit',
    resolver: zodResolver(contactsSchema),
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contacts, setContacts] = useState<BackendContactItem[]>([]);

  const onSubmit = async (values: ContactsFormValues) => {
    setIsSubmitting(true);

    try {
      // Имитация отправки формы
      await new Promise(resolve => setTimeout(resolve, 1500));

      setShowSuccess(true);
      methods.reset();
    } catch (error) {
      console.error('Ошибка отправки формы:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const { items } = await ContactsApi.list({ limit: 20, offset: 0 });
        if (ignore) return;
        setContacts(items || []);
      } catch {
        setContacts([]);
      }
    };
    load();
    return () => { ignore = true; };
  }, []);

  return (
    <Container maxWidth="lg" className="py-8">
      {/* Заголовок */}
      <SectionHeader
        title="Контакты"
        subtitle="Мы всегда готовы ответить на ваши вопросы и предложения"
        align="center"
        spacingBottom={6}
        maxSubtitleWidth={768}
      />

      <Grid container spacing={4}>
        {/* Контактная информация */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card className="h-full">
            <CardContent className="p-6">
              <Typography variant="h5" className="font-bold" sx={{ mb: '24px' }}>
                Свяжитесь с нами
              </Typography>

              {/* Основные контакты из бэкенда */}
              <List>
                {contacts.length === 0 ? (
                  <ListItem className="px-0">
                    <ListItemText primary="Контакты не найдены" secondary="Данные появятся позже" />
                  </ListItem>
                ) : (
                  contacts.map(contact => (
                    <React.Fragment key={contact.id}>
                      {contact.addresses.map((addr, idx) => (
                        <ListItem className="px-0" key={`addr-${contact.id}-${idx}`}>
                          <ListItemIcon>
                            <LocationIcon className="text-primary-main" />
                          </ListItemIcon>
                          <ListItemText primary={contact.title} secondary={addr} />
                        </ListItem>
                      ))}
                      {contact.phones.map((ph, idx) => (
                        <ListItem className="px-0" key={`phone-${contact.id}-${idx}`}>
                          <ListItemIcon>
                            <PhoneIcon className="text-primary-main" />
                          </ListItemIcon>
                          <ListItemText primary={contact.title} secondary={ph} />
                        </ListItem>
                      ))}
                      {contact.emails.map((em, idx) => (
                        <ListItem className="px-0" key={`email-${contact.id}-${idx}`}>
                          <ListItemIcon>
                            <EmailIcon className="text-primary-main" />
                          </ListItemIcon>
                          <ListItemText primary={contact.title} secondary={em} />
                        </ListItem>
                      ))}
                    </React.Fragment>
                  ))
                )}
              </List>

              <Divider className="my-4" />

              {/* Экстренные контакты */}
              <Alert severity="info" sx={{ mb: '16px' }}>
                <Typography variant="subtitle2" className="font-semibold" sx={{ mb: '4px' }}>
                  Круглосуточная горячая линия
                </Typography>
                <Typography variant="h6" className="font-bold">
                  +7 (4812) 12-34-00
                </Typography>
                <Typography variant="caption">
                  Для экстренных ситуаций на дороге
                </Typography>
              </Alert>

              {/* Социальные сети */}
              <Box>
                <Typography variant="subtitle2" className="font-semibold" sx={{ mb: '12px' }}>
                  Мы в мессенджерах
                </Typography>
                <Box className="flex gap-2">
                  <AppButton styleType="outlined" startIcon={<TelegramIcon />} className="flex-1">Telegram</AppButton>
                  <AppButton styleType="outlined" startIcon={<WhatsAppIcon />} className="flex-1">WhatsApp</AppButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Форма обратной связи */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent className="p-6">
              <Typography variant="h5" className="font-bold" sx={{ mb: '24px' }}>
                Форма обратной связи
              </Typography>

              <RHFForm methods={methods} onSubmit={onSubmit}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <RHFTextField<ContactsFormValues> fullWidth name="name" label="Ваше имя" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <RHFTextField<ContactsFormValues> fullWidth name="email" label="Email" type="email" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <RHFTextField<ContactsFormValues> fullWidth name="phone" label="Телефон" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <RHFTextField<ContactsFormValues> fullWidth name="subject" label="Тема обращения" />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <RHFTextField<ContactsFormValues> fullWidth name="message" label="Сообщение" multiline rows={6} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <AppButton type="submit" styleType="primary" size="large" fullWidth disabled={isSubmitting} endIcon={<SendIcon />}>
                      {isSubmitting ? 'Отправка...' : 'Отправить сообщение'}
                    </AppButton>
                  </Grid>
                </Grid>
              </RHFForm>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Отделы */}
      <Box className="mt-12">
        <Typography variant="h4" className="font-bold text-center" sx={{ mb: '32px' }}>
          Контакты отделов
        </Typography>
        <Grid container spacing={3}>
          {contacts.length > 0 ? (
            contacts.map((contact, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={contact.id}>
                <Paper className="p-4 h-full hover:shadow-lg transition-shadow">
                  <Typography variant="h6" className="font-semibold" sx={{ mb: '12px' }}>
                    {contact.title}
                  </Typography>
                  <Box className="space-y-2">
                    {contact.phones.map((phone, phoneIndex) => (
                      <Box key={phoneIndex} className="flex items-center gap-2">
                        <PhoneIcon className="text-gray-500 text-sm" />
                        <Typography variant="body2">{phone}</Typography>
                      </Box>
                    ))}
                    {contact.emails.map((email, emailIndex) => (
                      <Box key={emailIndex} className="flex items-center gap-2">
                        <EmailIcon className="text-gray-500 text-sm" />
                        <Typography variant="body2" className="break-all">
                          {email}
                        </Typography>
                      </Box>
                    ))}
                    {contact.addresses.map((address, addressIndex) => (
                      <Box key={addressIndex} className="flex items-center gap-2">
                        <LocationIcon className="text-gray-500 text-sm" />
                        <Typography variant="body2" className="text-gray-600">
                          {address}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            ))
          ) : null}
        </Grid>
      </Box>

      {/* Карта */}
      <Box className="mt-12">
        <Typography variant="h4" className="font-bold text-center" sx={{ mb: '32px' }}>
          Как нас найти
        </Typography>
        {/* <InteractiveMap
          address="214000, г. Смоленск, ул. Дзержинского, д. 23"
          coordinates={{ lat: 54.782635, lng: 32.045287 }}
        /> */}
      </Box>

      {/* Снэкбар успеха */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success">
          Ваше сообщение успешно отправлено! Мы ответим вам в ближайшее время.
        </Alert>
      </Snackbar>
    </Container>
  );
}