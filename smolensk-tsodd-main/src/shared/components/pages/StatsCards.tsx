import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import {
    Traffic as TrafficIcon,
    Security as SecurityIcon,
    Speed as SpeedIcon,
    Construction as ConstructionIcon,
} from '@mui/icons-material';

interface StatCard {
    icon: React.ReactNode;
    value: string;
    label: string;
}

const statsData: StatCard[] = [
    {
        icon: <TrafficIcon className="text-5xl text-primary-main mb-3" />,
        value: '245',
        label: 'Светофорных объектов',
    },
    {
        icon: <SecurityIcon className="text-5xl text-primary-main mb-3" />,
        value: '-23%',
        label: 'Снижение ДТП',
    },
    {
        icon: <SpeedIcon className="text-5xl text-primary-main mb-3" />,
        value: '15%',
        label: 'Рост скорости потока',
    },
    {
        icon: <ConstructionIcon className="text-5xl text-primary-main mb-3" />,
        value: '87',
        label: 'Проектов в работе',
    },
];

export default function StatsCards() {
    return (
        <Grid container spacing={3}>
            {statsData.map((stat, index) => (
                <Grid key={index} size={{ xs: 6 }}>
                    <Card className="h-full hover:shadow-lg transition-shadow">
                        <CardContent className="text-center p-6">
                            {stat.icon}
                            <Typography variant="h4" className="font-bold text-primary-main" sx={{ mb: '8px' }}>
                                {stat.value}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600">
                                {stat.label}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}