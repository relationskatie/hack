/**
 * Утилиты для работы с Markdown разметкой
 */

// Простая функция для преобразования Markdown в HTML
export const markdownToHtml = (markdown: string): string => {
    if (!markdown) return '';

    let html = markdown;

    // Заголовки
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Жирный текст
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Курсив
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Ссылки
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Списки
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>');

    // Обертываем списки в ul/ol
    html = html.replace(/(<li>.*<\/li>)/g, (match) => {
        const lines = match.split('\n');
        const listItems = lines.filter(line => line.trim().startsWith('<li>'));
        if (listItems.length > 0) {
            return `<ul>${listItems.join('')}</ul>`;
        }
        return match;
    });

    // Параграфы
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');

    // Обертываем в параграфы
    if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<ol')) {
        html = `<p>${html}</p>`;
    }

    // Очищаем пустые параграфы
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p><br><\/p>/g, '');

    return html;
};

// Функция для создания безопасного HTML
export const createMarkup = (html: string) => {
    return { __html: html };
};
