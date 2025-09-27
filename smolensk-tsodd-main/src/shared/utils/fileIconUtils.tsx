import React from 'react';
import {
  PictureAsPdf as PdfIcon,
  Description as WordIcon,
  TableChart as ExcelIcon,
  Slideshow as PowerpointIcon,
  Image as ImageIcon,
  VideoFile as VideoIcon,
  AudioFile as AudioIcon,
  Archive as ArchiveIcon,
  Code as CodeIcon,
  TextSnippet as TextIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';

export type FileIconProps = {
  size?: number;
  color?: string;
  sx?: any;
};

export const getFileIcon = (filename?: string, props?: FileIconProps) => {
  if (!filename) return <FileIcon sx={{ color: props?.color, fontSize: props?.size, ...props?.sx }} />;
  
  const extension = filename.toLowerCase().split('.').pop();
  const iconProps = {
    sx: { color: props?.color, fontSize: props?.size, ...props?.sx },
  } as const;

  switch (extension) {
    // PDF документы
    case 'pdf':
      return <PdfIcon {...iconProps} sx={{ color: '#d32f2f', ...iconProps.sx }} />;
    
    // Microsoft Word документы
    case 'doc':
    case 'docx':
      return <WordIcon {...iconProps} sx={{ color: '#1976d2', ...iconProps.sx }} />;
    
    // Microsoft Excel документы
    case 'xls':
    case 'xlsx':
      return <ExcelIcon {...iconProps} sx={{ color: '#2e7d32', ...iconProps.sx }} />;
    
    // Microsoft PowerPoint презентации
    case 'ppt':
    case 'pptx':
      return <PowerpointIcon {...iconProps} sx={{ color: '#f57c00', ...iconProps.sx }} />;
    
    // Изображения
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'webp':
    case 'svg':
    case 'tiff':
    case 'ico':
      return <ImageIcon {...iconProps} sx={{ color: '#9c27b0', ...iconProps.sx }} />;
    
    // Видео файлы
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
    case 'flv':
    case 'webm':
    case 'mkv':
    case '3gp':
      return <VideoIcon {...iconProps} sx={{ color: '#e91e63', ...iconProps.sx }} />;
    
    // Аудио файлы
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
    case 'ogg':
    case 'wma':
    case 'm4a':
      return <AudioIcon {...iconProps} sx={{ color: '#ff9800', ...iconProps.sx }} />;
    
    // Архивы
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
    case 'bz2':
    case 'xz':
      return <ArchiveIcon {...iconProps} sx={{ color: '#795548', ...iconProps.sx }} />;
    
    // Код и скрипты
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'html':
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
    case 'json':
    case 'xml':
    case 'yaml':
    case 'yml':
    case 'py':
    case 'java':
    case 'cpp':
    case 'c':
    case 'cs':
    case 'php':
    case 'rb':
    case 'go':
    case 'rs':
    case 'swift':
    case 'kt':
    case 'scala':
    case 'sh':
    case 'bat':
    case 'ps1':
      return <CodeIcon {...iconProps} sx={{ color: '#607d8b', ...iconProps.sx }} />;
    
    // Текстовые файлы
    case 'txt':
    case 'rtf':
    case 'md':
    case 'log':
    case 'csv':
      return <TextIcon {...iconProps} sx={{ color: '#424242', ...iconProps.sx }} />;
    
    // По умолчанию
    default:
      return <FileIcon {...iconProps} sx={{ color: '#757575', ...iconProps.sx }} />;
  }
};

export const getFileTypeLabel = (filename?: string) => {
  if (!filename) return 'Файл';
  
  const extension = filename.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'pdf':
      return 'PDF';
    case 'doc':
    case 'docx':
      return 'Word';
    case 'xls':
    case 'xlsx':
      return 'Excel';
    case 'ppt':
    case 'pptx':
      return 'PowerPoint';
    case 'jpg':
    case 'jpeg':
      return 'JPEG';
    case 'png':
      return 'PNG';
    case 'gif':
      return 'GIF';
    case 'mp4':
      return 'MP4';
    case 'mp3':
      return 'MP3';
    case 'zip':
      return 'ZIP';
    case 'rar':
      return 'RAR';
    case 'js':
      return 'JavaScript';
    case 'ts':
      return 'TypeScript';
    case 'html':
      return 'HTML';
    case 'css':
      return 'CSS';
    case 'json':
      return 'JSON';
    case 'txt':
      return 'Текст';
    case 'md':
      return 'Markdown';
    default:
      return extension?.toUpperCase() || 'Файл';
  }
};

export const getFileTypeColor = (filename?: string) => {
  if (!filename) return '#757575';
  
  const extension = filename.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'pdf':
      return '#d32f2f';
    case 'doc':
    case 'docx':
      return '#1976d2';
    case 'xls':
    case 'xlsx':
      return '#2e7d32';
    case 'ppt':
    case 'pptx':
      return '#f57c00';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'webp':
    case 'svg':
      return '#9c27b0';
    case 'mp4':
    case 'avi':
    case 'mov':
      return '#e91e63';
    case 'mp3':
    case 'wav':
    case 'flac':
      return '#ff9800';
    case 'zip':
    case 'rar':
    case '7z':
      return '#795548';
    case 'js':
    case 'ts':
    case 'html':
    case 'css':
      return '#607d8b';
    case 'txt':
    case 'md':
      return '#424242';
    default:
      return '#757575';
  }
};
