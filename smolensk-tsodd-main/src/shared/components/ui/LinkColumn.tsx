'use client';

import React from 'react';
import { Box, Typography, Link as MuiLink } from '@mui/material';
import Link from 'next/link';

interface LinkItem {
  href: string;
  label: string;
}

interface LinkColumnProps {
  title: string;
  links: LinkItem[];
}

export const LinkColumn: React.FC<LinkColumnProps> = ({ title, links }) => {
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
        {title}
      </Typography>
      <Box className="flex flex-col gap-2">
        {links.map((l) => (
          <MuiLink
            key={l.href}
            component={Link}
            href={l.href}
            sx={{ color: 'grey.300', '&:hover': { color: 'common.white' }, textDecoration: 'none' }}
          >
            {l.label}
          </MuiLink>
        ))}
      </Box>
    </Box>
  );
};

export default LinkColumn;
