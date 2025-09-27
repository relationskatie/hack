'use client';

import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  CardActions,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NewsApi, type BackendNewsItem } from '@/features/news/services/news.api';
import AppButton from '@/shared/components/ui/AppButton';
import { SectionHeader } from '@/shared/components/ui/SectionHeader';
import SearchPanel from '@/shared/components/ui/SearchPanel';

type UiNews = {
  id: string;
  title: string;
  author: string;
  date: string;
  status: 'published' | 'draft';
  views: number;
};

export default function AdminNewsPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [news, setNews] = useState<UiNews[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNews, setSelectedNews] = useState<string | null>(null);
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const { items } = await NewsApi.list({ limit: 100, offset: 0 });
        if (ignore) return;
        const mapped: UiNews[] = (items || []).map((n: BackendNewsItem) => ({
          id: n.id,
          title: n.title,
          author: 'ЦОДД',
          date: n.created_at || new Date().toISOString(),
          status: 'published',
          views: 0,
        }));
        setNews(mapped);
      } catch {
        setNews([]);
      }
    };
    load();
    return () => { ignore = true; };
  }, []);


  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, newsId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedNews(newsId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNews(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Удалить эту новость?')) {
      try {
        await NewsApi.delete(id);
        setNews(prev => prev.filter(n => n.id !== id));
      } catch {
        // ignore UI error path for brevity
      }
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/news/edit/${id}`);
    handleMenuClose();
  };

  const handleView = (id: string) => {
    router.push(`/news/${id}`);
    handleMenuClose();
  };

  const filteredNews = news.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Опубликовано';
      case 'draft':
        return 'Черновик';
      default:
        return status;
    }
  };

  return (
    <Box>
      <Box className={`flex ${isMobile ? 'flex-col gap-4' : 'justify-between items-center'} mb-6`}>
        <SectionHeader title="Управление новостями" spacingBottom={0} />
        <Link href="/admin/news/create" passHref>
          <AppButton styleType="primary" startIcon={<AddIcon />} fullWidth={isMobile}>
            Добавить новость
          </AppButton>
        </Link>
      </Box>

      <SearchPanel
        placeholder="Поиск по новостям..."
        value={searchQuery}
        onChange={(v) => setSearchQuery(v)}
      />

      {isMobile ? (
        <Stack spacing={2}>
          {filteredNews.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent>
                <Typography variant="h6" className="font-semibold line-clamp-2" sx={{ mb: '8px' }}>
                  {item.title}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: '8px' }}>
                  <Chip
                    label={getStatusLabel(item.status)}
                    color={getStatusColor(item.status)}
                    size="small"
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: '4px' }}>
                  Автор: {item.author}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: '4px' }}>
                  Дата: {new Date(item.date).toLocaleDateString('ru-RU')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Просмотры: {item.views}
                </Typography>
              </CardContent>
              <CardActions className="justify-end">
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, item.id)}
                >
                  <MoreIcon />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Заголовок</TableCell>
                <TableCell>Автор</TableCell>
                <TableCell>Дата</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="center">Просмотры</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredNews.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{item.author}</TableCell>
                  <TableCell>{new Date(item.date).toLocaleDateString('ru-RU')}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(item.status)}
                      color={getStatusColor(item.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">{item.views}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, item.id)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedNews && handleView(selectedNews)}>
          <ViewIcon className="mr-2" fontSize="small" />
          Просмотреть
        </MenuItem>
        <MenuItem onClick={() => selectedNews && handleEdit(selectedNews)}>
          <EditIcon className="mr-2" fontSize="small" />
          Редактировать
        </MenuItem>
        <MenuItem onClick={() => { if (selectedNews) handleDelete(selectedNews); handleMenuClose(); }} className="text-red-600">
          <DeleteIcon className="mr-2" fontSize="small" />
          Удалить
        </MenuItem>
      </Menu>
    </Box>
  );
}