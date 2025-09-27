# Документация компонентов - ЦОДД Смоленской области

## Обзор компонентов

Проект использует модульную архитектуру компонентов с разделением на feature-специфичные и shared компоненты. Все компоненты построены на Material-UI с дополнительной стилизацией через Tailwind CSS.

## 🏗 Структура компонентов

### 1. Layout компоненты (`src/shared/components/layout/`)

#### Header (`Header.tsx`)
Главный навигационный компонент с адаптивным меню.

```typescript
import { Header } from '@/shared/components/layout';

// Автоматически включает:
// - Логотип и название
// - Адаптивное меню
// - Авторизацию пользователя
// - Глобальный поиск
// - Мобильное меню (drawer)
```

**Функции:**
- Адаптивная навигация
- Dropdown меню для категорий
- Авторизация/выход
- Мобильное меню
- Глобальный поиск

#### Footer (`Footer.tsx`)
Подвал сайта с контактной информацией и ссылками.

```typescript
import { Footer } from '@/shared/components/layout';

// Включает:
// - Контактную информацию
// - Ссылки на разделы
// - Социальные сети
// - Копирайт
```

### 2. Page компоненты (`src/shared/components/pages/`)

#### HeroSection (`HeroSection.tsx`)
Главный баннер с призывом к действию.

```typescript
import { HeroSection } from '@/shared/components/pages';

<HeroSection 
  title="ЦОДД Смоленской области"
  subtitle="Повышение безопасности дорожного движения"
  backgroundImage="/desktop_hero_bg.jpg"
  ctaText="Узнать больше"
  ctaLink="/about"
/>
```

#### AboutSection (`AboutSection.tsx`)
Секция "О нас" с ключевой информацией.

```typescript
import { AboutSection } from '@/shared/components/pages';

<AboutSection 
  title="О ЦОДД"
  description="Описание организации"
  stats={[
    { label: 'Светофоров', value: '250+' },
    { label: 'Камер', value: '180+' }
  ]}
/>
```

#### ServicesSection (`ServicesSection.tsx`)
Секция услуг с карточками.

```typescript
import { ServicesSection } from '@/shared/components/pages';

<ServicesSection 
  title="Наши услуги"
  services={servicesData}
  showAll={true}
/>
```

#### ProjectsSection (`ProjectsSection.tsx`)
Секция проектов с фильтрацией.

```typescript
import { ProjectsSection } from '@/shared/components/pages';

<ProjectsSection 
  title="Проекты"
  projects={projectsData}
  categories={['infrastructure', 'safety']}
/>
```

#### StatsSection (`StatsSection.tsx`)
Секция статистики с метриками.

```typescript
import { StatsSection } from '@/shared/components/pages';

<StatsSection 
  title="Статистика"
  stats={statsData}
  period="month"
/>
```

#### CTASection (`CTASection.tsx`)
Секция призыва к действию.

```typescript
import { CTASection } from '@/shared/components/pages';

<CTASection 
  title="Нужна помощь?"
  description="Свяжитесь с нами"
  primaryAction={{ text: 'Позвонить', link: 'tel:+74812123456' }}
  secondaryAction={{ text: 'Написать', link: '/contacts' }}
/>
```

### 3. UI компоненты (`src/shared/components/ui/`)

#### AppButton (`AppButton.tsx`)
Кастомная кнопка с темизацией.

```typescript
import { AppButton } from '@/shared/components/ui';

<AppButton 
  variant="contained" 
  color="primary"
  size="large"
  loading={isLoading}
  onClick={handleClick}
>
  Нажми меня
</AppButton>

// Поддерживаемые варианты:
// variant: 'contained' | 'outlined' | 'text'
// color: 'primary' | 'secondary' | 'success' | 'error'
// size: 'small' | 'medium' | 'large'
```

#### StatSummaryCard (`StatSummaryCard.tsx`)
Карточка для отображения статистики.

```typescript
import { StatSummaryCard } from '@/shared/components/ui';

<StatSummaryCard 
  title="ДТП за месяц"
  value={42}
  change={-5.2}
  changeType="decrease"
  icon={<TrafficIcon />}
  color="error"
/>
```

#### KPIGrid (`KPIGrid.tsx`)
Сетка для отображения KPI метрик.

```typescript
import { KPIGrid } from '@/shared/components/ui';

<KPIGrid 
  items={kpiData}
  columns={4}
  spacing={2}
/>
```

#### SearchPanel (`SearchPanel.tsx`)
Панель поиска с фильтрами.

```typescript
import { SearchPanel } from '@/shared/components/ui';

<SearchPanel 
  onSearch={handleSearch}
  onFilterChange={handleFilterChange}
  filters={filterConfig}
  placeholder="Поиск..."
/>
```

#### UnifiedFilterPanel (`UnifiedFilterPanel.tsx`)
Универсальная панель фильтров.

```typescript
import { UnifiedFilterPanel } from '@/shared/components/ui';

<UnifiedFilterPanel 
  filters={filterState}
  onFiltersChange={setFilterState}
  config={filterConfig}
/>
```

#### DateRangePicker (`DateRangePicker.tsx`)
Выбор диапазона дат.

```typescript
import { DateRangePicker } from '@/shared/components/ui';

<DateRangePicker 
  value={dateRange}
  onChange={setDateRange}
  presets={['today', 'week', 'month', 'quarter']}
/>
```

#### HoverCard (`HoverCard.tsx`)
Карточка с дополнительной информацией при наведении.

```typescript
import { HoverCard } from '@/shared/components/ui';

<HoverCard 
  content="Основной контент"
  hoverContent="Дополнительная информация при наведении"
/>
```

#### RoleBasedView (`RoleBasedView.tsx`)
Компонент для отображения контента в зависимости от роли.

```typescript
import { RoleBasedView } from '@/shared/components/ui';

<RoleBasedView 
  allowedRoles={['admin', 'editor']}
  fallback={<div>Доступ запрещен</div>}
>
  <AdminContent />
</RoleBasedView>
```

#### ToolbarActions (`ToolbarActions.tsx`)
Панель действий для таблиц и списков.

```typescript
import { ToolbarActions } from '@/shared/components/ui';

<ToolbarActions 
  actions={[
    { label: 'Добавить', icon: <AddIcon />, onClick: handleAdd },
    { label: 'Экспорт', icon: <ExportIcon />, onClick: handleExport }
  ]}
  selectedCount={selectedItems.length}
/>
```

#### LinkColumn (`LinkColumn.tsx`)
Колонка с ссылками для таблиц.

```typescript
import { LinkColumn } from '@/shared/components/ui';

<LinkColumn 
  value="Название элемента"
  href="/items/123"
  external={false}
/>
```

#### IconBadge (`IconBadge.tsx`)
Бейдж с иконкой.

```typescript
import { IconBadge } from '@/shared/components/ui';

<IconBadge 
  icon={<WarningIcon />}
  color="warning"
  size="small"
>
  Внимание
</IconBadge>
```

### 4. Form компоненты (`src/shared/components/ui/form/`)

#### BaseInput (`BaseInput.tsx`)
Базовое поле ввода с валидацией.

```typescript
import { BaseInput } from '@/shared/components/ui/form';

<BaseInput 
  name="username"
  label="Имя пользователя"
  type="text"
  required
  validation={{
    required: 'Обязательное поле',
    minLength: { value: 3, message: 'Минимум 3 символа' }
  }}
/>
```

#### BaseSelect (`BaseSelect.tsx`)
Поле выбора с опциями.

```typescript
import { BaseSelect } from '@/shared/components/ui/form';

<BaseSelect 
  name="category"
  label="Категория"
  options={[
    { value: 'news', label: 'Новости' },
    { value: 'announcement', label: 'Объявления' }
  ]}
  required
/>
```

#### BaseTextarea (`BaseTextarea.tsx`)
Многострочное поле ввода.

```typescript
import { BaseTextarea } from '@/shared/components/ui/form';

<BaseTextarea 
  name="description"
  label="Описание"
  rows={4}
  maxLength={500}
/>
```

#### BaseCheckbox (`BaseCheckbox.tsx`)
Чекбокс с лейблом.

```typescript
import { BaseCheckbox } from '@/shared/components/ui/form';

<BaseCheckbox 
  name="agreement"
  label="Согласен с условиями"
  required
/>
```

### 5. Common компоненты (`src/shared/components/common/`)

#### GlobalSearch (`GlobalSearch.tsx`)
Глобальный поиск по сайту.

```typescript
import { GlobalSearch } from '@/shared/components/common';

<GlobalSearch 
  onSearch={handleSearch}
  placeholder="Поиск по сайту..."
  categories={['news', 'projects', 'services']}
/>
```

#### LoadingScreen (`LoadingScreen.tsx`)
Экран загрузки.

```typescript
import { LoadingScreen } from '@/shared/components/common';

<LoadingScreen 
  message="Загрузка данных..."
  progress={75}
/>
```

#### EmptyState (`EmptyState.tsx`)
Состояние пустого списка.

```typescript
import { EmptyState } from '@/shared/components/common';

<EmptyState 
  icon={<NoDataIcon />}
  title="Нет данных"
  description="Попробуйте изменить фильтры"
  action={{ label: 'Сбросить фильтры', onClick: handleReset }}
/>
```

#### ErrorBoundary (`ErrorBoundary.tsx`)
Обработчик ошибок React.

```typescript
import { ErrorBoundary } from '@/shared/components/common';

<ErrorBoundary 
  fallback={<ErrorFallback />}
  onError={handleError}
>
  <YourComponent />
</ErrorBoundary>
```

#### ConfirmDialog (`ConfirmDialog.tsx`)
Диалог подтверждения действия.

```typescript
import { ConfirmDialog } from '@/shared/components/common';

<ConfirmDialog 
  open={isOpen}
  title="Подтвердите действие"
  message="Вы уверены, что хотите удалить этот элемент?"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
  confirmText="Удалить"
  cancelText="Отмена"
  severity="error"
/>
```

#### ClientOnly (`ClientOnly.tsx`)
Компонент только для клиентского рендеринга.

```typescript
import { ClientOnly } from '@/shared/components/common';

<ClientOnly fallback={<Skeleton />}>
  <ClientSideComponent />
</ClientOnly>
```

#### AnimatedLogo (`AnimatedLogo.tsx`)
Анимированный логотип.

```typescript
import { AnimatedLogo } from '@/shared/components/common';

<AnimatedLogo 
  size="large"
  animated={true}
  variant="primary"
/>
```

### 6. Admin компоненты (`src/shared/components/admin/`)

#### AdminHeader (`AdminHeader.tsx`)
Заголовок административной панели.

```typescript
import { AdminHeader } from '@/shared/components/admin';

<AdminHeader 
  title="Управление новостями"
  breadcrumbs={[
    { label: 'Админ', href: '/admin' },
    { label: 'Новости', href: '/admin/news' }
  ]}
  actions={[
    { label: 'Добавить новость', href: '/admin/news/create' }
  ]}
/>
```

#### AdminSidebar (`AdminSidebar.tsx`)
Боковая панель администратора.

```typescript
import { AdminSidebar } from '@/shared/components/admin';

<AdminSidebar 
  currentPath="/admin/news"
  menuItems={[
    { label: 'Новости', href: '/admin/news', icon: <NewsIcon /> },
    { label: 'Проекты', href: '/admin/projects', icon: <ProjectsIcon /> }
  ]}
/>
```

#### AdminSearch (`AdminSearch.tsx`)
Поиск в административной панели.

```typescript
import { AdminSearch } from '@/shared/components/admin';

<AdminSearch 
  onSearch={handleSearch}
  placeholder="Поиск в админке..."
  filters={adminFilters}
/>
```

### 7. Feature компоненты

#### News компоненты (`src/features/news/components/`)

##### NewsCard (`NewsCard.tsx`)
```typescript
import { NewsCard } from '@/features/news';

<NewsCard 
  news={newsItem}
  variant="compact" // 'compact' | 'detailed'
  showCategory={true}
  showDate={true}
  onClick={handleClick}
/>
```

##### NewsList (`NewsList.tsx`)
```typescript
import { NewsList } from '@/features/news';

<NewsList 
  news={newsData}
  loading={isLoading}
  onLoadMore={handleLoadMore}
  hasMore={hasMore}
/>
```

##### NewsSection (`NewsSection.tsx`)
```typescript
import { NewsSection } from '@/features/news';

<NewsSection 
  title="Последние новости"
  limit={6}
  category="all"
  showViewAll={true}
/>
```

#### Map компоненты (`src/features/map/components/`)

##### MapComponent (`MapComponent.tsx`)
```typescript
import { MapComponent } from '@/features/map';

<MapComponent 
  center={[54.7818, 32.0401]} // Смоленск
  zoom={13}
  markers={mapData}
  onMarkerClick={handleMarkerClick}
/>
```

##### InteractiveMap (`InteractiveMap.tsx`)
```typescript
import { InteractiveMap } from '@/features/map';

<InteractiveMap 
  data={mapData}
  layers={['traffic-lights', 'cameras']}
  filters={mapFilters}
/>
```

##### CustomMarker (`CustomMarker.tsx`)
```typescript
import { CustomMarker } from '@/features/map';

<CustomMarker 
  position={[54.7818, 32.0401]}
  type="traffic-light"
  status="active"
  data={markerData}
/>
```

## 🎨 Стилизация компонентов

### Material-UI тема

```typescript
// Цветовая палитра
const theme = {
  palette: {
    primary: { main: '#62a744' },    // Зеленый
    secondary: { main: '#757575' },  // Серый
    error: { main: '#f44336' },
    warning: { main: '#ff9800' },
    info: { main: '#2196f3' },
    success: { main: '#4caf50' }
  }
};
```

### Tailwind CSS классы

```typescript
// Адаптивные классы
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
      {item.content}
    </Card>
  ))}
</div>
```

### Кастомные стили

```typescript
// Emotion стили
const StyledComponent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  }
}));
```

## 📱 Адаптивность

### Breakpoints

```typescript
// Material-UI breakpoints
const breakpoints = {
  xs: 0,      // мобильные
  sm: 600,    // планшеты
  md: 900,    // маленькие десктопы
  lg: 1200,   // десктопы
  xl: 1536    // большие десктопы
};
```

### Адаптивные компоненты

```typescript
// Использование useMediaQuery
const isMobile = useMediaQuery(theme.breakpoints.down('md'));

return (
  <Box>
    {isMobile ? <MobileLayout /> : <DesktopLayout />}
  </Box>
);
```

## 🔧 Хуки для компонентов

### useUnifiedFilters

```typescript
import { useUnifiedFilters } from '@/shared/hooks';

const { filters, setFilters, resetFilters } = useUnifiedFilters({
  search: '',
  category: 'all',
  dateRange: null,
  status: 'active'
});
```

## 🎯 Паттерны использования

### Композиция компонентов

```typescript
// Сборка страницы из компонентов
function NewsPage() {
  return (
    <PageLayout>
      <PageHeader title="Новости" />
      <SearchPanel onSearch={handleSearch} />
      <NewsList news={news} loading={loading} />
      <Pagination {...paginationProps} />
    </PageLayout>
  );
}
```

### Условный рендеринг

```typescript
// Рендеринг в зависимости от состояния
{loading ? (
  <LoadingScreen />
) : error ? (
  <ErrorState error={error} />
) : (
  <Content data={data} />
)}
```

### Обработка событий

```typescript
// Стандартизированная обработка событий
const handleItemClick = useCallback((item: Item) => {
  router.push(`/items/${item.id}`);
}, [router]);

const handleItemEdit = useCallback((item: Item) => {
  setEditingItem(item);
  setDialogOpen(true);
}, []);
```

## 🧪 Тестирование компонентов

### Структура тестов

```typescript
// __tests__/components/NewsCard.test.tsx
import { render, screen } from '@testing-library/react';
import { NewsCard } from '@/features/news';

describe('NewsCard', () => {
  it('renders news title', () => {
    const news = { title: 'Test News', content: 'Content' };
    render(<NewsCard news={news} />);
    expect(screen.getByText('Test News')).toBeInTheDocument();
  });
});
```

## 📋 Чек-лист для новых компонентов

При создании нового компонента:

- [ ] Определить тип компонента (UI/Feature/Page)
- [ ] Создать TypeScript интерфейс для props
- [ ] Добавить адаптивность
- [ ] Обеспечить доступность (a11y)
- [ ] Добавить тесты
- [ ] Документировать использование
- [ ] Экспортировать из соответствующего index.ts

## 🔗 Полезные ссылки

- [Material-UI Documentation](https://mui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
