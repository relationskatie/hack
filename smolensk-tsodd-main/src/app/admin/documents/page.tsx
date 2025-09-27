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
  CircularProgress,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { getFileIcon, getFileTypeLabel } from '@/shared/utils/fileIconUtils';
import { useNotification } from '@/shared/contexts';
import AppButton from '@/shared/components/ui/AppButton';
import { DocumentsApi, type BackendDocumentItem } from '@/features/documents/services/documents.api';

type UiDoc = {
  id: string;
  title: string;
  filename?: string;
  uploadDate?: string;
};

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<UiDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      try {
        const { items } = await DocumentsApi.list({ limit: 50, offset: 0 });
        if (ignore) return;
        const mapped: UiDoc[] = (items || []).map((d: BackendDocumentItem) => ({
          id: d.id,
          title: d.title,
          filename: d.filename,
          uploadDate: d.created_at,
        }));
        setDocuments(mapped);
      } catch (error) {
        console.error('Ошибка загрузки документов:', error);
        setDocuments([]);
        showNotification('Ошибка загрузки документов', 'error');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [showNotification]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await DocumentsApi.create({
        title: file.name,
        file,
        filename: file.name
      });
      showNotification('Документ загружен', 'success');

      // Перезагружаем список документов
      const { items } = await DocumentsApi.list({ limit: 50, offset: 0 });
      const mapped: UiDoc[] = (items || []).map((d: BackendDocumentItem) => ({
        id: d.id,
        title: d.title,
        filename: d.filename,
        uploadDate: d.created_at,
      }));
      setDocuments(mapped);
    } catch (error) {
      console.error('Ошибка загрузки документа:', error);
      showNotification('Ошибка загрузки документа', 'error');
    }

    // Очищаем input
    e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Удалить этот документ?')) {
      try {
        await DocumentsApi.delete(String(id));
        setDocuments(prev => prev.filter(d => d.id !== id));
        showNotification('Документ удален', 'success');
      } catch (error) {
        console.error('Ошибка удаления документа:', error);
        showNotification('Ошибка удаления документа', 'error');
      }
    }
  };

  return (
    <Box>
      <Box className="flex justify-between items-center" sx={{ mb: '24px' }}>
        <Typography variant="h4" className="font-bold">
          Управление документами
        </Typography>
        <AppButton
          styleType="primary"
          startIcon={<UploadIcon />}
          component="label"
          disabled={loading}
        >
          Загрузить документ
          <input type="file" hidden onChange={handleUpload} accept=".pdf,.doc,.docx" />
        </AppButton>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Документ</TableCell>
              <TableCell>Дата загрузки</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Box className="flex items-center justify-center" sx={{ py: '16px' }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ ml: '8px' }}>
                      Загрузка...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Документы не найдены
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id} hover>
                  <TableCell>
                    <Box className="flex items-center gap-2">
                      {getFileIcon(doc.filename, { size: 20 })}
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {doc.title}
                        </Typography>
                        {doc.filename && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {getFileTypeLabel(doc.filename)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString('ru-RU') : '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small">
                      <DownloadIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}