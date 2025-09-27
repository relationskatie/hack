'use client';

import React, { useEffect, useState } from 'react';
import {
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import AppButton from '@/shared/components/ui/AppButton';
import { useNotification } from '@/shared/contexts';
import { ContactsApi, type BackendContactItem } from '@/features/contacts/services/contacts.api';

type UiContact = BackendContactItem;

export default function AdminContactsPage() {
    const [contacts, setContacts] = useState<UiContact[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingContact, setEditingContact] = useState<UiContact | null>(null);
    const { showNotification } = useNotification();

    const [form, setForm] = useState({
        title: '',
        phones: '' as string,
        emails: '' as string,
        addresses: '' as string,
    });

    const load = async () => {
        try {
            const { items } = await ContactsApi.list({ limit: 100, offset: 0 });
            setContacts(items || []);
        } catch (e) {
            console.error('Ошибка загрузки контактов:', e);
            setContacts([]);
            const errorMessage = e instanceof Error ? e.message : 'Неизвестная ошибка';
            showNotification(`Ошибка загрузки контактов: ${errorMessage}`, 'error');
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleOpenDialog = (contact?: UiContact) => {
        if (contact) {
            setEditingContact(contact);
            setForm({
                title: contact.title,
                phones: (contact.phones || []).join(', '),
                emails: (contact.emails || []).join(', '),
                addresses: (contact.addresses || []).join(', '),
            });
        } else {
            setEditingContact(null);
            setForm({ title: '', phones: '', emails: '', addresses: '' });
        }
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
        setEditingContact(null);
    };

    const parseList = (value: string): string[] =>
        value
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

    const handleSave = async () => {
        const payload = {
            title: form.title.trim(),
            phones: parseList(form.phones),
            emails: parseList(form.emails),
            addresses: parseList(form.addresses),
        };

        if (!payload.title) {
            showNotification('Укажите название контактной группы', 'error');
            return;
        }

        try {
            if (editingContact) {
                await ContactsApi.update(editingContact.id, payload);
                showNotification('Контакт обновлен', 'success');
            } else {
                await ContactsApi.create(payload);
                showNotification('Контакт создан', 'success');
            }

            handleClose();
            // Важно: после сохранения выполняем повторную загрузку, т.к. API может возвращать
            // старые данные в ответе (описанная вами проблема). Так мы гарантируем актуальный список.
            await load();
        } catch (e) {
            console.error('Ошибка сохранения контакта:', e);
            const errorMessage = e instanceof Error ? e.message : 'Неизвестная ошибка';
            showNotification(`Ошибка сохранения контакта: ${errorMessage}`, 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Удалить этот контакт?')) return;
        try {
            await ContactsApi.delete(id);
            setContacts((prev) => prev.filter((c) => c.id !== id));
            showNotification('Контакт удален', 'success');
        } catch (e) {
            showNotification('Ошибка удаления контакта', 'error');
        }
    };

    return (
        <Box>
            <Box className="flex justify-between items-center" sx={{ mb: '24px' }}>
                <Typography variant="h4" className="font-bold">
                    Управление контактами
                </Typography>
                <AppButton styleType="primary" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                    Добавить
                </AppButton>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Название</TableCell>
                            <TableCell>Телефоны</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Адреса</TableCell>
                            <TableCell align="right">Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {contacts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <Typography variant="body2" color="text.secondary">
                                        Контакты не найдены
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            contacts.map((c) => (
                                <TableRow key={c.id} hover>
                                    <TableCell>{c.title}</TableCell>
                                    <TableCell>
                                        {(c.phones || []).map((p, i) => (
                                            <Chip key={i} size="small" label={p} sx={{ mr: 0.5, mb: 0.5 }} />
                                        ))}
                                    </TableCell>
                                    <TableCell>
                                        {(c.emails || []).map((p, i) => (
                                            <Chip key={i} size="small" label={p} sx={{ mr: 0.5, mb: 0.5 }} />
                                        ))}
                                    </TableCell>
                                    <TableCell>
                                        {(c.addresses || []).map((p, i) => (
                                            <Chip key={i} size="small" label={p} sx={{ mr: 0.5, mb: 0.5 }} />
                                        ))}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={() => handleOpenDialog(c)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(c.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>{editingContact ? 'Редактировать контакт' : 'Добавить контакт'}</DialogTitle>
                <DialogContent>
                    <Box className="pt-2 space-y-4">
                        <TextField
                            fullWidth
                            label="Название"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Телефоны (через запятую)"
                            value={form.phones}
                            onChange={(e) => setForm({ ...form, phones: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Email (через запятую)"
                            value={form.emails}
                            onChange={(e) => setForm({ ...form, emails: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Адреса (через запятую)"
                            value={form.addresses}
                            onChange={(e) => setForm({ ...form, addresses: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <AppButton styleType="outlined" onClick={handleClose}>Отмена</AppButton>
                    <AppButton styleType="primary" onClick={handleSave}>{editingContact ? 'Сохранить' : 'Добавить'}</AppButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
}


