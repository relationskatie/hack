'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

interface SectionHeaderProps {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    align?: 'left' | 'center';
    spacingBottom?: number;
    maxSubtitleWidth?: number;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    subtitle,
    align = 'left',
    spacingBottom = 4,
    maxSubtitleWidth,
}) => {
    return (
        <Box sx={{ textAlign: align, mb: spacingBottom }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: subtitle ? 1.5 : 0 }}>
                {title}
            </Typography>
            {subtitle && (
                <Typography
                    variant="h6"
                    sx={{
                        color: 'text.secondary',
                        mx: align === 'center' ? 'auto' : 0,
                        maxWidth: maxSubtitleWidth,
                    }}
                >
                    {subtitle}
                </Typography>
            )}
        </Box>
    );
};

export default SectionHeader;


